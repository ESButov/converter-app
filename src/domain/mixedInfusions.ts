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
  concentrationLabel: string
  doseRanges: Record<MixedInfusionSpecies | 'all', MixedInfusionDoseRange | undefined>
  doseStep: string
  doseUnit: MixedInfusionDoseUnit
  id: MixedInfusionDrugId
  name: string
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
    id: 'l-2',
    name: 'Лидокаин 2%',
    concentration: 20000,
    concentrationLabel: '20 мг/мл',
    doseUnit: 'mcgKgMin',
    doseStep: '1',
    doseRanges: {
      all: undefined,
      cat: { min: 10, max: 30 },
      dog: { min: 20, max: 80 },
    },
  },
  {
    id: 'l-10',
    name: 'Лидокаин 10%',
    concentration: 100000,
    concentrationLabel: '100 мг/мл',
    doseUnit: 'mcgKgMin',
    doseStep: '1',
    doseRanges: {
      all: undefined,
      cat: { min: 10, max: 30 },
      dog: { min: 20, max: 80 },
    },
  },
  {
    id: 'cer',
    name: 'Церукал (метоклопрамид)',
    concentration: 5,
    concentrationLabel: '5 мг/мл',
    doseUnit: 'mgKgHour',
    doseStep: '0.01',
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
    concentrationLabel: '1 мг/мл',
    doseUnit: 'mcgKgHour',
    doseStep: '0.01',
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
    concentrationLabel: '0.1 мг/мл',
    doseUnit: 'mcgKgHour',
    doseStep: '0.01',
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
    concentrationLabel: '0.5 мг/мл',
    doseUnit: 'mcgKgHour',
    doseStep: '0.01',
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
    concentrationLabel: '100 мг/мл',
    doseUnit: 'mgKgHour',
    doseStep: '0.01',
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
    concentrationLabel: '50 мг/мл',
    doseUnit: 'mgKgHour',
    doseStep: '0.01',
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
    concentrationLabel: '1 мг/мл',
    doseUnit: 'mcgKgMin',
    doseStep: '0.01',
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
    concentrationLabel: '2 мг/мл',
    doseUnit: 'mcgKgMin',
    doseStep: '0.01',
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
    concentrationLabel: '5 мг/мл',
    doseUnit: 'mcgKgMin',
    doseStep: '1',
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
    concentrationLabel: '40 мг/мл',
    doseUnit: 'mcgKgMin',
    doseStep: '1',
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
    concentrationLabel: '12.5 мг/мл',
    doseUnit: 'mcgKgMin',
    doseStep: '1',
    doseRanges: {
      all: { min: 4, max: 10 },
      cat: undefined,
      dog: undefined,
    },
  },
] as const satisfies readonly MixedInfusionDrugDefinition[]

export const mixedInfusionDrugById = new Map(
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

export const getMixedInfusionDoseHint = (
  definition: MixedInfusionDrugDefinition,
  species: MixedInfusionSpecies,
) => {
  const range = getMixedInfusionDoseRange(definition, species)
  const unit = mixedInfusionDoseUnitLabels[definition.doseUnit]

  if (definition.id === 'l-2' || definition.id === 'l-10') {
    return `${mixedInfusionSpeciesLabels[species]}: ${range?.min}-${range?.max} ${unit}`
  }

  return range === undefined
    ? `${definition.concentrationLabel}; диапазон дозы не задан`
    : `${range.min}-${range.max} ${unit}; концентрация ${definition.concentrationLabel}`
}

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
