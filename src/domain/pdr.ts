export type PdrGroupId =
  | 'cat'
  | 'catMaineCoon'
  | 'dogGiant'
  | 'dogLarge'
  | 'dogMedium'
  | 'dogSmall'
  | 'dogToy'

export type PdrStageId = 'afterFiveWeeks' | 'beforeFiveWeeks'

export type PdrFormula =
  | {
    kind: 'constantMinusMeasurementOverDivisor'
    constantMm: number
    divisor: number
    measurementLabel: string
    measurementShortLabel: string
    recommendedDbpMax: number
    recommendedDbpMin: number
  }
  | {
    kind: 'interceptMinusSlopeMeasurement'
    interceptDays: number
    measurementLabel: string
    measurementShortLabel: string
    recommendedDbpMax: number
    recommendedDbpMin: number
    slopePerMm: number
  }

export type PdrGroup = {
  formulas: Record<PdrStageId, PdrFormula>
  id: PdrGroupId
  label: string
}

export type PdrInput = {
  bpMm?: number
  examDateIso?: string
  groupId?: PdrGroupId
  measurementMm?: number
  stageId?: PdrStageId
}

export type PdrResult = {
  daysBeforeParturition: number
  dueDateIso: string
  formula: PdrFormula
  formulaText: string
  group: PdrGroup
  isOutsideRecommendedPeriod: boolean
  measurementMm: number
  rangeEndIso: string
  rangeStartIso: string
  roundedDaysBeforeParturition: number
  stage: PdrStage
}

export type PdrStage = {
  id: PdrStageId
  label: string
}

export const pdrStages = [
  {
    id: 'beforeFiveWeeks',
    label: 'До 5 недель',
  },
  {
    id: 'afterFiveWeeks',
    label: 'После 5 недель',
  },
] as const satisfies readonly PdrStage[]

export const pdrStageLabels = {
  afterFiveWeeks: 'После 5 недель',
  beforeFiveWeeks: 'До 5 недель',
} as const satisfies Record<PdrStageId, string>

const earlyMeasurement = {
  measurementLabel: 'Внутренний диаметр хориальной полости',
  measurementShortLabel: 'ВДХП',
} as const

const lateMeasurement = {
  measurementLabel: 'Бипариетальный диаметр',
  measurementShortLabel: 'БПД',
} as const

const constantFormula = (
  constantMm: number,
  divisor: number,
  measurement: typeof earlyMeasurement | typeof lateMeasurement,
  recommendedDbpMin: number,
  recommendedDbpMax: number,
): PdrFormula => ({
  kind: 'constantMinusMeasurementOverDivisor',
  constantMm,
  divisor,
  ...measurement,
  recommendedDbpMax,
  recommendedDbpMin,
})

const linearFormula = (
  interceptDays: number,
  slopePerMm: number,
  measurement: typeof earlyMeasurement | typeof lateMeasurement,
  recommendedDbpMin: number,
  recommendedDbpMax: number,
): PdrFormula => ({
  kind: 'interceptMinusSlopeMeasurement',
  interceptDays,
  slopePerMm,
  ...measurement,
  recommendedDbpMax,
  recommendedDbpMin,
})

export const pdrGroups = [
  {
    id: 'cat',
    label: 'Кошка',
    formulas: {
      beforeFiveWeeks: constantFormula(62.03, 1.1, earlyMeasurement, 26, 39),
      afterFiveWeeks: constantFormula(23.39, 0.47, lateMeasurement, 0, 32),
    },
  },
  {
    id: 'catMaineCoon',
    label: 'Кошка, мейн-кун',
    formulas: {
      beforeFiveWeeks: linearFormula(57.9, 0.79, earlyMeasurement, 26, 39),
      afterFiveWeeks: linearFormula(49.3, 1.86, lateMeasurement, 0, 32),
    },
  },
  {
    id: 'dogToy',
    label: 'Собака карликовая, до 5 кг',
    formulas: {
      beforeFiveWeeks: linearFormula(44.04, 0.62887, earlyMeasurement, 26, 41),
      afterFiveWeeks: linearFormula(39.7, 1.619, lateMeasurement, 6, 23),
    },
  },
  {
    id: 'dogSmall',
    label: 'Собака мелкая, 5-10 кг',
    formulas: {
      beforeFiveWeeks: constantFormula(68.68, 1.53, earlyMeasurement, 21, 42),
      afterFiveWeeks: constantFormula(25.11, 0.61, lateMeasurement, 1, 37),
    },
  },
  {
    id: 'dogMedium',
    label: 'Собака средняя, 10-25 кг',
    formulas: {
      beforeFiveWeeks: constantFormula(82.13, 1.8, earlyMeasurement, 21, 42),
      afterFiveWeeks: constantFormula(29.18, 0.7, lateMeasurement, 1, 37),
    },
  },
  {
    id: 'dogLarge',
    label: 'Собака крупная, 26-40 кг',
    formulas: {
      beforeFiveWeeks: constantFormula(105.1, 2.5, earlyMeasurement, 26, 42),
      afterFiveWeeks: constantFormula(30, 0.8, lateMeasurement, 2, 30),
    },
  },
  {
    id: 'dogGiant',
    label: 'Собака гигантская, более 40 кг',
    formulas: {
      beforeFiveWeeks: constantFormula(88.1, 1.9, earlyMeasurement, 25, 40),
      afterFiveWeeks: constantFormula(29, 0.7, lateMeasurement, 1, 35),
    },
  },
] as const satisfies readonly PdrGroup[]

export const pdrGroupIds = pdrGroups.map((group) => group.id)
export const pdrStageIds = pdrStages.map((stage) => stage.id)

const pdrGroupById = new Map<PdrGroupId, PdrGroup>(
  pdrGroups.map((group) => [group.id, group]),
)

const pdrStageById = new Map<PdrStageId, PdrStage>(
  pdrStages.map((stage) => [stage.id, stage]),
)

const pdrAccuracyDays = 2

const hasPositiveNumber = (value: number | undefined): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value > 0
)

const parseIsoDate = (dateIso: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateIso)

  if (match === null) {
    return undefined
  }

  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, monthIndex, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== monthIndex ||
    date.getUTCDate() !== day
  ) {
    return undefined
  }

  return date
}

const formatDateToIso = (date: Date) => (
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
)

export const addDaysToIsoDate = (
  dateIso: string,
  days: number,
): string | undefined => {
  const date = parseIsoDate(dateIso)

  if (date === undefined || !Number.isFinite(days)) {
    return undefined
  }

  const nextDate = new Date(date)
  nextDate.setUTCDate(nextDate.getUTCDate() + days)

  return formatDateToIso(nextDate)
}

export const getPdrGroupById = (groupId: PdrGroupId) => (
  pdrGroupById.get(groupId)
)

export const getPdrStageById = (stageId: PdrStageId) => (
  pdrStageById.get(stageId)
)

export const calculatePdrFormulaDays = (
  formula: PdrFormula,
  measurementMm: number,
) => {
  if (formula.kind === 'constantMinusMeasurementOverDivisor') {
    return (formula.constantMm - measurementMm) / formula.divisor
  }

  return formula.interceptDays - formula.slopePerMm * measurementMm
}

export const getPdrFormulaText = (formula: PdrFormula) => {
  if (formula.kind === 'constantMinusMeasurementOverDivisor') {
    return `(${formatPdrNumber(formula.constantMm, 2)} - ${formula.measurementShortLabel}мм) / ${formatPdrNumber(formula.divisor, 2)}`
  }

  return `${formatPdrNumber(formula.interceptDays, 2)} - ${formatPdrNumber(formula.slopePerMm, 5)} x ${formula.measurementShortLabel}мм`
}

export const calculatePdr = ({
  bpMm,
  examDateIso,
  groupId,
  measurementMm,
  stageId,
}: PdrInput): PdrResult | undefined => {
  const resolvedMeasurementMm = measurementMm ?? bpMm

  if (
    groupId === undefined ||
    stageId === undefined ||
    examDateIso === undefined ||
    !hasPositiveNumber(resolvedMeasurementMm)
  ) {
    return undefined
  }

  const group = pdrGroupById.get(groupId)
  const stage = pdrStageById.get(stageId)

  if (
    group === undefined ||
    stage === undefined ||
    parseIsoDate(examDateIso) === undefined
  ) {
    return undefined
  }

  const formula = group.formulas[stageId]
  const daysBeforeParturition = calculatePdrFormulaDays(formula, resolvedMeasurementMm)
  const roundedDaysBeforeParturition = Math.round(daysBeforeParturition)
  const dueDateIso = addDaysToIsoDate(examDateIso, roundedDaysBeforeParturition)
  const rangeStartIso = dueDateIso === undefined
    ? undefined
    : addDaysToIsoDate(dueDateIso, -pdrAccuracyDays)
  const rangeEndIso = dueDateIso === undefined
    ? undefined
    : addDaysToIsoDate(dueDateIso, pdrAccuracyDays)

  if (
    dueDateIso === undefined ||
    rangeStartIso === undefined ||
    rangeEndIso === undefined
  ) {
    return undefined
  }

  return {
    daysBeforeParturition,
    dueDateIso,
    formula,
    formulaText: getPdrFormulaText(formula),
    group,
    isOutsideRecommendedPeriod:
      daysBeforeParturition < formula.recommendedDbpMin ||
      daysBeforeParturition > formula.recommendedDbpMax,
    measurementMm: resolvedMeasurementMm,
    rangeEndIso,
    rangeStartIso,
    roundedDaysBeforeParturition,
    stage,
  }
}

export const formatPdrDate = (dateIso: string): string => {
  const date = parseIsoDate(dateIso)

  if (date === undefined) {
    return dateIso
  }

  return `${String(date.getUTCDate()).padStart(2, '0')}.${String(date.getUTCMonth() + 1).padStart(2, '0')}.${date.getUTCFullYear()}`
}

export const formatPdrNumber = (value: number, digits = 1): string => {
  const multiplier = 10 ** digits
  const roundedValue = Math.round((value + Number.EPSILON) * multiplier) / multiplier

  return roundedValue.toFixed(digits).replace(/\.?0+$/, '')
}
