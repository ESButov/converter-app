export type GlucoseInsulinProtocolId = 'regular025' | 'bsava05'

export type GlucoseInsulinRange = {
  max: number
  min: number
}

export type GlucoseInsulinProtocol = {
  id: GlucoseInsulinProtocolId
  insulinUnitsKg: number
  label: string
}

export type GlucoseInsulinInput = {
  currentKaliumMmolL?: number
  glucoseConcentrationPercent?: number
  protocolId?: GlucoseInsulinProtocolId
  targetKaliumMmolL?: number
  weightKg?: number
}

export type GlucoseInsulinResult = {
  currentKaliumMmolL: number
  dextroseTotalG?: GlucoseInsulinRange
  dilutedBolusMl?: GlucoseInsulinRange
  dilutionSalineMl?: GlucoseInsulinRange
  glucoseBolusG?: number
  glucoseBolusGRange?: GlucoseInsulinRange
  glucoseBolusMl?: number
  glucoseBolusMlRange?: GlucoseInsulinRange
  glucoseConcentrationPercent: number
  glucoseGPerMl: number
  glucoseRemainderMl?: GlucoseInsulinRange
  glucoseTotalMl?: GlucoseInsulinRange
  insulinUnits: number
  isLargeKaliumGoal: boolean
  isSevereHyperkalemia: boolean
  kaliumDecreaseGoalMmolL: number
  protocol: GlucoseInsulinProtocol
  targetKaliumMmolL: number
}

export const glucoseInsulinProtocols = [
  {
    id: 'regular025',
    insulinUnitsKg: 0.25,
    label: 'Регулярный инсулин 0.25 ЕД/кг + 50% глюкоза 1 мл/кг',
  },
  {
    id: 'bsava05',
    insulinUnitsKg: 0.5,
    label: 'BSAVA: растворимый инсулин 0.5 ЕД/кг + декстроза 2-3 г/ЕД',
  },
] as const satisfies readonly GlucoseInsulinProtocol[]

export const glucoseInsulinProtocolIds = glucoseInsulinProtocols.map(
  (protocol) => protocol.id,
)

const glucoseInsulinProtocolById = new Map<GlucoseInsulinProtocolId, GlucoseInsulinProtocol>(
  glucoseInsulinProtocols.map((protocol) => [protocol.id, protocol]),
)

const defaultGlucoseConcentrationPercent = 50
const regularDextroseBolusGKg = 0.5
const d50DilutionSalineMinParts = 2
const d50DilutionSalineMaxParts = 4
const bsavaDextroseMinGPerUnit = 2
const bsavaDextroseMaxGPerUnit = 3
const concentratedGlucoseDilutionThresholdPercent = 20
const largeKaliumGoalMmolL = 1.5
const severeHyperkalemiaMmolL = 7

const hasPositiveNumber = (value: number | undefined): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value > 0
)

const round = (value: number, digits = 2) => {
  const multiplier = 10 ** digits

  return Math.round((value + Number.EPSILON) * multiplier) / multiplier
}

const roundRange = (range: GlucoseInsulinRange, digits = 2): GlucoseInsulinRange => ({
  max: round(range.max, digits),
  min: round(range.min, digits),
})

export const getGlucoseInsulinProtocolById = (
  protocolId: GlucoseInsulinProtocolId,
) => glucoseInsulinProtocolById.get(protocolId)

export const calculateGlucoseGPerMl = (
  glucoseConcentrationPercent: number,
): number => glucoseConcentrationPercent / 100

export const calculateGlucoseInsulinMixture = ({
  currentKaliumMmolL,
  glucoseConcentrationPercent = defaultGlucoseConcentrationPercent,
  protocolId = 'regular025',
  targetKaliumMmolL,
  weightKg,
}: GlucoseInsulinInput): GlucoseInsulinResult | undefined => {
  if (
    !hasPositiveNumber(weightKg) ||
    !hasPositiveNumber(currentKaliumMmolL) ||
    !hasPositiveNumber(glucoseConcentrationPercent) ||
    !hasPositiveNumber(targetKaliumMmolL) ||
    targetKaliumMmolL >= currentKaliumMmolL
  ) {
    return undefined
  }

  const protocol = glucoseInsulinProtocolById.get(protocolId)

  if (protocol === undefined) {
    return undefined
  }

  const insulinUnits = weightKg * protocol.insulinUnitsKg
  const glucoseGPerMl = calculateGlucoseGPerMl(glucoseConcentrationPercent)
  const kaliumDecreaseGoalMmolL = currentKaliumMmolL - targetKaliumMmolL
  const baseResult = {
    currentKaliumMmolL: round(currentKaliumMmolL, 2),
    glucoseConcentrationPercent: round(glucoseConcentrationPercent, 2),
    glucoseGPerMl: round(glucoseGPerMl, 3),
    insulinUnits: round(insulinUnits, 2),
    isLargeKaliumGoal: kaliumDecreaseGoalMmolL > largeKaliumGoalMmolL,
    isSevereHyperkalemia: currentKaliumMmolL >= severeHyperkalemiaMmolL,
    kaliumDecreaseGoalMmolL: round(kaliumDecreaseGoalMmolL, 2),
    protocol,
    targetKaliumMmolL: round(targetKaliumMmolL, 2),
  }

  if (protocol.id === 'bsava05') {
    const dextroseTotalG = {
      max: insulinUnits * bsavaDextroseMaxGPerUnit,
      min: insulinUnits * bsavaDextroseMinGPerUnit,
    }
    const glucoseTotalMl = {
      max: dextroseTotalG.max / glucoseGPerMl,
      min: dextroseTotalG.min / glucoseGPerMl,
    }
    const glucoseBolusGRange = {
      max: dextroseTotalG.max / 2,
      min: dextroseTotalG.min / 2,
    }
    const glucoseBolusMlRange = {
      max: glucoseTotalMl.max / 2,
      min: glucoseTotalMl.min / 2,
    }

    return {
      ...baseResult,
      dextroseTotalG: roundRange(dextroseTotalG),
      glucoseBolusGRange: roundRange(glucoseBolusGRange),
      glucoseBolusMlRange: roundRange(glucoseBolusMlRange),
      glucoseRemainderMl: roundRange(glucoseBolusMlRange),
      glucoseTotalMl: roundRange(glucoseTotalMl),
    }
  }

  const glucoseBolusG = weightKg * regularDextroseBolusGKg
  const glucoseBolusMl = glucoseBolusG / glucoseGPerMl
  const dilutionSalineMl = {
    max: glucoseBolusMl * d50DilutionSalineMaxParts,
    min: glucoseBolusMl * d50DilutionSalineMinParts,
  }
  const needsDilution = glucoseConcentrationPercent >= concentratedGlucoseDilutionThresholdPercent

  return {
    ...baseResult,
    dilutedBolusMl: needsDilution
      ? roundRange({
        max: glucoseBolusMl + dilutionSalineMl.max,
        min: glucoseBolusMl + dilutionSalineMl.min,
      })
      : undefined,
    dilutionSalineMl: needsDilution ? roundRange(dilutionSalineMl) : undefined,
    glucoseBolusG: round(glucoseBolusG, 2),
    glucoseBolusMl: round(glucoseBolusMl, 2),
  }
}

export const formatGlucoseInsulinNumber = (value: number, digits = 1): string => {
  const multiplier = 10 ** digits
  const roundedValue = Math.round((value + Number.EPSILON) * multiplier) / multiplier

  return roundedValue.toFixed(digits).replace(/\.?0+$/, '')
}
