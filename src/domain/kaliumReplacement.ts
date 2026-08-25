export type KaliumDoseRange = {
  min: number
  max: number
}

export type KaliumGuideline = {
  label: string
  serumKalium: {
    min?: number
    max?: number
  }
  doseMEqKgHour: KaliumDoseRange
}

export type KaliumReplacementInput = {
  currentKaliumMmolL?: number
  kclConcentrationPercent?: number
  weightKg?: number
}

export type KaliumReplacementResult = {
  doseMEqKgHour: KaliumDoseRange
  guidelineLabel: string
  kclConcentrationMEqMl: number
  kclDoseMlKgHour: KaliumDoseRange
  kclRateMlHour: KaliumDoseRange
  kaliumRateMEqHour: KaliumDoseRange
}

export const kaliumGuidelines = [
  {
    label: '>3.5 mmol/L',
    serumKalium: {
      min: 3.5,
    },
    doseMEqKgHour: {
      min: 0.05,
      max: 0.05,
    },
  },
  {
    label: '3.1-3.5 mmol/L',
    serumKalium: {
      min: 3.1,
      max: 3.5,
    },
    doseMEqKgHour: {
      min: 0.1,
      max: 0.15,
    },
  },
  {
    label: '2.6-3.0 mmol/L',
    serumKalium: {
      min: 2.6,
      max: 3,
    },
    doseMEqKgHour: {
      min: 0.2,
      max: 0.25,
    },
  },
  {
    label: '2.0-2.5 mmol/L',
    serumKalium: {
      min: 2,
      max: 2.5,
    },
    doseMEqKgHour: {
      min: 0.3,
      max: 0.4,
    },
  },
  {
    label: '<2.0 mmol/L',
    serumKalium: {
      max: 2,
    },
    doseMEqKgHour: {
      min: 0.5,
      max: 0.5,
    },
  },
] as const satisfies readonly KaliumGuideline[]

const KCL_MOLECULAR_WEIGHT_MG_PER_MMOL = 74.55

const round = (value: number, digits = 1) => Number(value.toFixed(digits))

const hasPositiveNumber = (value: number | undefined): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value > 0
)

const hasNonNegativeNumber = (value: number | undefined): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value >= 0
)

const isInGuidelineRange = (
  currentKaliumMmolL: number,
  guideline: KaliumGuideline,
) => {
  const { max, min } = guideline.serumKalium

  if (min !== undefined && max === undefined) {
    return currentKaliumMmolL > min
  }

  if (min === undefined && max !== undefined) {
    return currentKaliumMmolL < max
  }

  if (min !== undefined && max !== undefined) {
    return currentKaliumMmolL >= min && currentKaliumMmolL <= max
  }

  return false
}

export const calculateKclConcentrationMEqMl = (
  kclConcentrationPercent: number,
): number => (
  kclConcentrationPercent * 10 / KCL_MOLECULAR_WEIGHT_MG_PER_MMOL
)

export const getKaliumGuideline = (
  currentKaliumMmolL: number,
): KaliumGuideline | undefined => (
  kaliumGuidelines.find((guideline) => (
    isInGuidelineRange(currentKaliumMmolL, guideline)
  ))
)

export const calculateKaliumReplacement = ({
  currentKaliumMmolL,
  kclConcentrationPercent,
  weightKg,
}: KaliumReplacementInput): KaliumReplacementResult | undefined => {
  if (
    !hasPositiveNumber(weightKg) ||
    !hasNonNegativeNumber(currentKaliumMmolL) ||
    !hasPositiveNumber(kclConcentrationPercent)
  ) {
    return undefined
  }

  const guideline = getKaliumGuideline(currentKaliumMmolL)

  if (guideline === undefined) {
    return undefined
  }

  const kclConcentrationMEqMl = calculateKclConcentrationMEqMl(kclConcentrationPercent)
  const kaliumRateMin = weightKg * guideline.doseMEqKgHour.min
  const kaliumRateMax = weightKg * guideline.doseMEqKgHour.max

  return {
    doseMEqKgHour: guideline.doseMEqKgHour,
    guidelineLabel: guideline.label,
    kclConcentrationMEqMl: round(kclConcentrationMEqMl, 3),
    kclDoseMlKgHour: {
      min: round(guideline.doseMEqKgHour.min / kclConcentrationMEqMl, 2),
      max: round(guideline.doseMEqKgHour.max / kclConcentrationMEqMl, 2),
    },
    kclRateMlHour: {
      min: round(kaliumRateMin / kclConcentrationMEqMl),
      max: round(kaliumRateMax / kclConcentrationMEqMl),
    },
    kaliumRateMEqHour: {
      min: round(kaliumRateMin),
      max: round(kaliumRateMax),
    },
  }
}

export const formatKaliumNumber = (value: number, digits = 1): string => (
  value.toFixed(digits).replace(/\.?0+$/, '')
)
