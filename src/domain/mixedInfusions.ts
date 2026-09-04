export type MixedInfusionSpecies = 'cat' | 'dog'

export type MixedInfusionDoseUnit = 'mcgKgMin' | 'mcgKgHour' | 'mgKgHour'

export type MixedInfusionDrugId =
  | 'ad'
  | 'cer'
  | 'ddm-01'
  | 'ddm-05'
  | 'dob'
  | 'domitor'
  | 'dop-05'
  | 'dop-4'
  | 'fentanyl'
  | 'ketamine'
  | 'l-2'
  | 'l-10'
  | 'nad'
  | 'tr'
  | 'vez'

export type MixedInfusionDoseRange = {
  max: number
  min: number
}

export type MixedInfusionDrugDefinition = {
  concentration: number
  concentrationMgMl: number
  concentrationLabel: string
  doseInputPattern: RegExp
  doseRangeLabels?: Record<MixedInfusionSpecies | 'all', string | undefined>
  doseRanges: Record<MixedInfusionSpecies | 'all', MixedInfusionDoseRange | undefined>
  doseStep: string
  doseUnit: MixedInfusionDoseUnit
  highDoseThreshold?: number
  id: MixedInfusionDrugId
  loadingDosesMgKg?: readonly number[]
  name: string
  routeLabel?: string
}

export type MixedInfusionDrugInput = {
  dose?: number
  drugId?: MixedInfusionDrugId
}

export type MixedInfusionInput = {
  durationHours?: number
  durationMinutes?: number
  drugs: readonly MixedInfusionDrugInput[]
  infusionRateMlHour?: number
  syringeSizeMl?: number
  weightKg?: number
}

export type MixedInfusionDrugResult = {
  definition: MixedInfusionDrugDefinition
  dose: number
  doseStatus: 'above' | 'below' | 'ok'
  isHighRate: boolean
  loadingDoses: readonly MixedInfusionLoadingDoseResult[]
  volumeMl: number
}

export type MixedInfusionLoadingDoseResult = {
  doseMgKg: number
  volumeMl: number
}

export type MixedInfusionResult = {
  basis: 'durationRate' | 'durationSyringe' | 'syringeRate'
  drugVolumeMl: number
  drugs: readonly MixedInfusionDrugResult[]
  finalRateMlHour: number
  isSyringeVolumeEnough: boolean
  salineVolumeMl: number
  syringeSizeMl: number
  totalDurationHours: number
}

export const mixedInfusionSpeciesLabels = {
  cat: 'Кошка',
  dog: 'Собака',
} as const satisfies Record<MixedInfusionSpecies, string>

export const mixedInfusionDrugDefinitions = [
  {
    id: 'fentanyl',
    name: 'Фентанил',
    concentration: 50,
    concentrationMgMl: 0.05,
    concentrationLabel: '0.05 мг/мл',
    doseUnit: 'mcgKgMin',
    doseStep: '0.01',
    doseInputPattern: /^\d*(?:\.\d{0,2})?$/,
    highDoseThreshold: 0.005 * 1000 / 60,
    doseRangeLabels: {
      all: '0.0012-0.008 мг/кг/ч (0.02-0.10 мкг/кг/мин)',
      cat: undefined,
      dog: undefined,
    },
    doseRanges: {
      all: { min: 0.02, max: 0.1 },
      cat: undefined,
      dog: undefined,
    },
    loadingDosesMgKg: [0.002],
    routeLabel: 'в/м или в/в',
  },
  {
    id: 'ketamine',
    name: 'Кетамин',
    concentration: 100000,
    concentrationMgMl: 100,
    concentrationLabel: '100 мг/мл',
    doseUnit: 'mcgKgMin',
    doseStep: '0.01',
    doseInputPattern: /^\d*(?:\.\d{0,2})?$/,
    highDoseThreshold: 1.2 * 1000 / 60,
    doseRangeLabels: {
      all: '0.12-1.2 мг/кг/ч (2-20 мкг/кг/мин)',
      cat: undefined,
      dog: undefined,
    },
    doseRanges: {
      all: { min: 2, max: 20 },
      cat: undefined,
      dog: undefined,
    },
    loadingDosesMgKg: [0.25, 0.5],
    routeLabel: 'в/в',
  },
  {
    id: 'l-2',
    name: 'Лидокаин 2%',
    concentration: 20000,
    concentrationMgMl: 20,
    concentrationLabel: '20 мг/мл',
    doseUnit: 'mcgKgMin',
    doseStep: '1',
    doseInputPattern: /^\d*$/,
    highDoseThreshold: 3 * 1000 / 60,
    doseRangeLabels: {
      all: undefined,
      cat: '0.6-1.8 мг/кг/ч (10-30 мкг/кг/мин)',
      dog: '1.2-4.8 мг/кг/ч (20-80 мкг/кг/мин)',
    },
    doseRanges: {
      all: undefined,
      cat: { min: 10, max: 30 },
      dog: { min: 20, max: 80 },
    },
    loadingDosesMgKg: [0.25, 0.5, 1],
    routeLabel: 'в/в',
  },
  {
    id: 'l-10',
    name: 'Лидокаин 10%',
    concentration: 100000,
    concentrationMgMl: 100,
    concentrationLabel: '100 мг/мл',
    doseUnit: 'mcgKgMin',
    doseStep: '1',
    doseInputPattern: /^\d*$/,
    highDoseThreshold: 3 * 1000 / 60,
    doseRangeLabels: {
      all: undefined,
      cat: '0.6-1.8 мг/кг/ч (10-30 мкг/кг/мин)',
      dog: '1.2-4.8 мг/кг/ч (20-80 мкг/кг/мин)',
    },
    doseRanges: {
      all: undefined,
      cat: { min: 10, max: 30 },
      dog: { min: 20, max: 80 },
    },
    loadingDosesMgKg: [0.25, 0.5, 1],
    routeLabel: 'в/в',
  },
  {
    id: 'cer',
    name: 'Церукал (метоклопрамид)',
    concentration: 5,
    concentrationMgMl: 5,
    concentrationLabel: '5 мг/мл',
    doseUnit: 'mgKgHour',
    doseStep: '0.01',
    doseInputPattern: /^\d*(?:\.\d{0,2})?$/,
    doseRanges: {
      all: { min: 0.05, max: 0.2 },
      cat: undefined,
      dog: undefined,
    },
  },
  {
    id: 'domitor',
    name: 'Домитор (медитин)',
    concentration: 1000,
    concentrationMgMl: 1,
    concentrationLabel: '1 мг/мл',
    doseUnit: 'mcgKgHour',
    doseStep: '0.01',
    doseInputPattern: /^\d*(?:\.\d{0,2})?$/,
    doseRanges: {
      all: { min: 0.25, max: 1 },
      cat: undefined,
      dog: undefined,
    },
  },
  {
    id: 'ddm-01',
    name: 'Дексмедетомидин 0.1',
    concentration: 100,
    concentrationMgMl: 0.1,
    concentrationLabel: '0.1 мг/мл',
    doseUnit: 'mcgKgHour',
    doseStep: '0.01',
    doseInputPattern: /^\d*(?:\.\d{0,2})?$/,
    doseRanges: {
      all: { min: 0.2, max: 2 },
      cat: undefined,
      dog: undefined,
    },
  },
  {
    id: 'ddm-05',
    name: 'Дексмедетомидин 0.5',
    concentration: 500,
    concentrationMgMl: 0.5,
    concentrationLabel: '0.5 мг/мл',
    doseUnit: 'mcgKgHour',
    doseStep: '0.01',
    doseInputPattern: /^\d*(?:\.\d{0,2})?$/,
    doseRanges: {
      all: { min: 0.2, max: 2 },
      cat: undefined,
      dog: undefined,
    },
  },
  {
    id: 'vez',
    name: 'Везотил (телазол/золетил)',
    concentration: 100,
    concentrationMgMl: 100,
    concentrationLabel: '100 мг/мл',
    doseUnit: 'mgKgHour',
    doseStep: '0.01',
    doseInputPattern: /^\d*(?:\.\d{0,2})?$/,
    doseRanges: {
      all: { min: 0.1, max: 4 },
      cat: undefined,
      dog: undefined,
    },
  },
  {
    id: 'tr',
    name: 'Трамадол',
    concentration: 50,
    concentrationMgMl: 50,
    concentrationLabel: '50 мг/мл',
    doseUnit: 'mgKgHour',
    doseStep: '0.01',
    doseInputPattern: /^\d*(?:\.\d{0,2})?$/,
    doseRanges: {
      all: { min: 0.1, max: 0.3 },
      cat: undefined,
      dog: undefined,
    },
  },
  {
    id: 'ad',
    name: 'Адреналин',
    concentration: 1000,
    concentrationMgMl: 1,
    concentrationLabel: '1 мг/мл',
    doseUnit: 'mcgKgMin',
    doseStep: '0.01',
    doseInputPattern: /^\d*(?:\.\d{0,2})?$/,
    doseRanges: {
      all: { min: 0.01, max: 0.2 },
      cat: undefined,
      dog: undefined,
    },
  },
  {
    id: 'nad',
    name: 'Норадреналин',
    concentration: 2000,
    concentrationMgMl: 2,
    concentrationLabel: '2 мг/мл',
    doseUnit: 'mcgKgMin',
    doseStep: '0.01',
    doseInputPattern: /^\d*(?:\.\d{0,2})?$/,
    doseRanges: {
      all: { min: 0.05, max: 2 },
      cat: undefined,
      dog: undefined,
    },
  },
  {
    id: 'dop-05',
    name: 'Допамин 0.5%',
    concentration: 5000,
    concentrationMgMl: 5,
    concentrationLabel: '5 мг/мл',
    doseUnit: 'mcgKgMin',
    doseStep: '1',
    doseInputPattern: /^\d*$/,
    doseRanges: {
      all: { min: 4, max: 10 },
      cat: undefined,
      dog: undefined,
    },
  },
  {
    id: 'dop-4',
    name: 'Допамин 4%',
    concentration: 40000,
    concentrationMgMl: 40,
    concentrationLabel: '40 мг/мл',
    doseUnit: 'mcgKgMin',
    doseStep: '1',
    doseInputPattern: /^\d*$/,
    doseRanges: {
      all: { min: 4, max: 10 },
      cat: undefined,
      dog: undefined,
    },
  },
  {
    id: 'dob',
    name: 'Добутамин',
    concentration: 12500,
    concentrationMgMl: 12.5,
    concentrationLabel: '12.5 мг/мл',
    doseUnit: 'mcgKgMin',
    doseStep: '1',
    doseInputPattern: /^\d*$/,
    doseRanges: {
      all: { min: 4, max: 10 },
      cat: undefined,
      dog: undefined,
    },
  },
] as const satisfies readonly MixedInfusionDrugDefinition[]

export const mixedInfusionDrugById = new Map<MixedInfusionDrugId, MixedInfusionDrugDefinition>(
  mixedInfusionDrugDefinitions.map((drug) => [drug.id, drug]),
)

const hasPositiveNumber = (value: number | undefined): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value > 0
)

type MixedInfusionResolvedParameters = {
  basis: MixedInfusionResult['basis']
  finalRateMlHour: number
  syringeSizeMl: number
  totalDurationHours: number
}

export const mixedInfusionDoseUnitLabels = {
  mcgKgMin: 'мкг/кг/мин',
  mcgKgHour: 'мкг/кг/ч',
  mgKgHour: 'мг/кг/ч',
} as const satisfies Record<MixedInfusionDoseUnit, string>

export const getMixedInfusionDurationHours = (
  hours?: number,
  minutes?: number,
): number | undefined => {
  const safeHours = typeof hours === 'number' && Number.isFinite(hours) ? hours : 0
  const safeMinutes = typeof minutes === 'number' && Number.isFinite(minutes) ? minutes : 0
  const totalHours = safeHours + safeMinutes / 60

  return totalHours > 0 ? totalHours : undefined
}

export const getMixedInfusionDoseRange = (
  definition: MixedInfusionDrugDefinition,
  species: MixedInfusionSpecies,
) => definition.doseRanges[species] ?? definition.doseRanges.all

export const getMixedInfusionDoseRangeLabel = (
  definition: MixedInfusionDrugDefinition,
  species: MixedInfusionSpecies,
) => (
  definition.doseRangeLabels?.[species] ??
  definition.doseRangeLabels?.all
)

export const getMixedInfusionDoseHint = (
  definition: MixedInfusionDrugDefinition,
  species: MixedInfusionSpecies,
) => {
  const rangeLabel = getMixedInfusionDoseRangeLabel(definition, species)

  if (rangeLabel !== undefined) {
    return `${mixedInfusionSpeciesLabels[species]}: ${rangeLabel}`
  }

  const range = getMixedInfusionDoseRange(definition, species)
  const unit = mixedInfusionDoseUnitLabels[definition.doseUnit]

  return range === undefined
    ? `${definition.concentrationLabel}; диапазон дозы не задан`
    : `${range.min}-${range.max} ${unit}; концентрация ${definition.concentrationLabel}`
}

export const getMixedInfusionDoseInputPattern = (
  definition: MixedInfusionDrugDefinition | undefined,
) => definition?.doseInputPattern ?? /^\d*(?:\.\d{0,3})?$/

export const calculateMixedInfusionDrugVolume = (
  definition: MixedInfusionDrugDefinition,
  dose: number,
  weightKg: number,
  durationHours: number,
) => {
  if (definition.doseUnit === 'mcgKgMin') {
    return weightKg * dose * 60 * durationHours / definition.concentration
  }

  return weightKg * dose * durationHours / definition.concentration
}

export const resolveMixedInfusionParameters = (
  input: MixedInfusionInput,
): MixedInfusionResolvedParameters | undefined => {
  const durationHours = getMixedInfusionDurationHours(input.durationHours, input.durationMinutes)

  if (hasPositiveNumber(durationHours) && hasPositiveNumber(input.syringeSizeMl)) {
    return {
      basis: 'durationSyringe',
      finalRateMlHour: input.syringeSizeMl / durationHours,
      syringeSizeMl: input.syringeSizeMl,
      totalDurationHours: durationHours,
    }
  }

  if (hasPositiveNumber(input.syringeSizeMl) && hasPositiveNumber(input.infusionRateMlHour)) {
    return {
      basis: 'syringeRate',
      finalRateMlHour: input.infusionRateMlHour,
      syringeSizeMl: input.syringeSizeMl,
      totalDurationHours: input.syringeSizeMl / input.infusionRateMlHour,
    }
  }

  if (hasPositiveNumber(durationHours) && hasPositiveNumber(input.infusionRateMlHour)) {
    return {
      basis: 'durationRate',
      finalRateMlHour: input.infusionRateMlHour,
      syringeSizeMl: durationHours * input.infusionRateMlHour,
      totalDurationHours: durationHours,
    }
  }

  return undefined
}

const getDoseStatus = (
  definition: MixedInfusionDrugDefinition,
  species: MixedInfusionSpecies,
  dose: number,
): MixedInfusionDrugResult['doseStatus'] => {
  const range = getMixedInfusionDoseRange(definition, species)

  if (range === undefined) return 'ok'
  if (dose < range.min) return 'below'
  if (dose > range.max) return 'above'

  return 'ok'
}

const isHighRate = (
  definition: MixedInfusionDrugDefinition,
  dose: number,
) => (
  definition.highDoseThreshold !== undefined &&
  dose > definition.highDoseThreshold
)

export const calculateMixedInfusion = (
  input: MixedInfusionInput,
  species: MixedInfusionSpecies,
): MixedInfusionResult | undefined => {
  const resolvedParameters = resolveMixedInfusionParameters(input)

  if (
    !hasPositiveNumber(input.weightKg) ||
    resolvedParameters === undefined
  ) {
    return undefined
  }

  const weightKg = input.weightKg

  const drugs = input.drugs.flatMap((drugInput): MixedInfusionDrugResult[] => {
    if (!drugInput.drugId || !hasPositiveNumber(drugInput.dose)) {
      return []
    }

    const definition = mixedInfusionDrugById.get(drugInput.drugId)

    if (definition === undefined) {
      return []
    }

    return [{
      definition,
      dose: drugInput.dose,
      doseStatus: getDoseStatus(definition, species, drugInput.dose),
      isHighRate: isHighRate(definition, drugInput.dose),
      loadingDoses: definition.loadingDosesMgKg?.map((doseMgKg) => ({
        doseMgKg,
        volumeMl: weightKg * doseMgKg / definition.concentrationMgMl,
      })) ?? [],
      volumeMl: calculateMixedInfusionDrugVolume(
        definition,
        drugInput.dose,
        weightKg,
        resolvedParameters.totalDurationHours,
      ),
    }]
  })

  if (drugs.length < 2) {
    return undefined
  }

  const drugVolumeMl = drugs.reduce((sum, drug) => sum + drug.volumeMl, 0)
  const salineVolumeMl = resolvedParameters.syringeSizeMl - drugVolumeMl

  return {
    basis: resolvedParameters.basis,
    drugVolumeMl,
    drugs,
    finalRateMlHour: resolvedParameters.finalRateMlHour,
    isSyringeVolumeEnough: salineVolumeMl >= 0,
    salineVolumeMl,
    syringeSizeMl: resolvedParameters.syringeSizeMl,
    totalDurationHours: resolvedParameters.totalDurationHours,
  }
}

export const formatMixedInfusionNumber = (value: number, digits = 2): string => (
  Number(value.toFixed(digits)).toString()
)
