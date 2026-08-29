export type FlkDrugId = 'fentanyl' | 'lidocaine' | 'ketamine'
export type FlkSpecies = 'cat' | 'dog'

export type FlkDoseRange = {
  label: string
}

export type FlkDrugDefinition = {
  concentrationMgMl: number
  doseRanges: Record<FlkSpecies | 'all', FlkDoseRange | undefined>
  id: FlkDrugId
  label: string
  loadingDosesMgKg: readonly number[]
  routeLabel: string
  warningRateMgKgHour: number
}

export type FlkInput = {
  durationHours?: number
  durationMinutes?: number
  fentanylRateMcgKgMin?: number
  ketamineRateMcgKgMin?: number
  lidocaineConcentrationMgMl?: number
  lidocaineRateMcgKgMin?: number
  syringeSizeMl?: number
  weightKg?: number
}

export type FlkDrugResult = {
  definition: FlkDrugDefinition
  isHighRate: boolean
  loadingDoses: readonly FlkLoadingDoseResult[]
  rateMcgKgMin: number
  totalDoseMg: number
  volumeMl: number
}

export type FlkLoadingDoseResult = {
  doseMgKg: number
  volumeMl: number
}

export type FlkResult = {
  drugVolumeMl: number
  drugs: readonly FlkDrugResult[]
  finalRateMlHour: number
  salineVolumeMl: number
  syringeSizeMl: number
  totalDurationHours: number
}

export const flkSpeciesLabels = {
  cat: 'Кошка',
  dog: 'Собака',
} as const satisfies Record<FlkSpecies, string>

export const flkDrugDefinitions = [
  {
    id: 'fentanyl',
    label: 'Фентанил',
    concentrationMgMl: 0.05,
    warningRateMgKgHour: 0.005,
    doseRanges: {
      all: { label: '0.0012-0.008 мг/кг/ч (0.02-0.10 мкг/кг/мин)' },
      cat: undefined,
      dog: undefined,
    },
    loadingDosesMgKg: [0.002],
    routeLabel: 'в/м или в/в',
  },
  {
    id: 'lidocaine',
    label: 'Лидокаин',
    concentrationMgMl: 20,
    warningRateMgKgHour: 3,
    doseRanges: {
      all: undefined,
      cat: { label: '0.6-1.8 мг/кг/ч (10-30 мкг/кг/мин)' },
      dog: { label: '1.2-4.8 мг/кг/ч (20-80 мкг/кг/мин)' },
    },
    loadingDosesMgKg: [0.25, 0.5, 1],
    routeLabel: 'в/в',
  },
  {
    id: 'ketamine',
    label: 'Кетамин',
    concentrationMgMl: 100,
    warningRateMgKgHour: 1.2,
    doseRanges: {
      all: { label: '0.12-1.2 мг/кг/ч (2-20 мкг/кг/мин)' },
      cat: undefined,
      dog: undefined,
    },
    loadingDosesMgKg: [0.25, 0.5],
    routeLabel: 'в/в',
  },
] as const satisfies readonly FlkDrugDefinition[]

export const flkDrugById = new Map(
  flkDrugDefinitions.map((drug) => [drug.id, drug]),
)

const rateInputByDrugId = {
  fentanyl: 'fentanylRateMcgKgMin',
  lidocaine: 'lidocaineRateMcgKgMin',
  ketamine: 'ketamineRateMcgKgMin',
} as const satisfies Record<FlkDrugId, keyof FlkInput>

const hasPositiveNumber = (value: number | undefined): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value > 0
)

const readNonNegativeNumber = (value: number | undefined) => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value > 0
    ? value
    : 0
)

export const getFlkDurationHours = (
  hours?: number,
  minutes?: number,
): number | undefined => {
  const safeHours = typeof hours === 'number' && Number.isFinite(hours) ? hours : 0
  const safeMinutes = typeof minutes === 'number' && Number.isFinite(minutes) ? minutes : 0
  const totalHours = safeHours + safeMinutes / 60

  return totalHours > 0 ? totalHours : undefined
}

export const getFlkDoseRangeLabel = (
  definition: FlkDrugDefinition,
  species: FlkSpecies,
) => definition.doseRanges[species]?.label ?? definition.doseRanges.all?.label ?? 'диапазон дозы не задан'

export const getFlkDoseHint = (
  definition: FlkDrugDefinition,
  species?: FlkSpecies,
) => (
  species === undefined
    ? 'Выберите вид животного, чтобы увидеть подсказку по дозе.'
    : `${flkSpeciesLabels[species]}: ${getFlkDoseRangeLabel(definition, species)}`
)

export const calculateFlk = ({
  durationHours,
  durationMinutes,
  syringeSizeMl,
  weightKg,
  ...rates
}: FlkInput): FlkResult | undefined => {
  const totalDurationHours = getFlkDurationHours(durationHours, durationMinutes)

  if (
    !hasPositiveNumber(weightKg) ||
    !hasPositiveNumber(totalDurationHours) ||
    !hasPositiveNumber(syringeSizeMl)
  ) {
    return undefined
  }

  const drugs = flkDrugDefinitions.map((definition) => {
    const rateMcgKgMin = readNonNegativeNumber(rates[rateInputByDrugId[definition.id]])
    const rateMgKgHour = rateMcgKgMin * 60 / 1000
    const concentrationMgMl = definition.id === 'lidocaine' && hasPositiveNumber(rates.lidocaineConcentrationMgMl)
      ? rates.lidocaineConcentrationMgMl
      : definition.concentrationMgMl
    const totalDoseMg = weightKg * rateMgKgHour * totalDurationHours
    const volumeMl = totalDoseMg / concentrationMgMl
    const loadingDoses = definition.loadingDosesMgKg.map((doseMgKg) => ({
      doseMgKg,
      volumeMl: weightKg * doseMgKg / concentrationMgMl,
    }))

    return {
      definition,
      isHighRate: rateMgKgHour > definition.warningRateMgKgHour,
      loadingDoses,
      rateMcgKgMin,
      totalDoseMg,
      volumeMl,
    }
  })

  const drugVolumeMl = drugs.reduce((sum, drug) => sum + drug.volumeMl, 0)

  return {
    drugVolumeMl,
    drugs,
    finalRateMlHour: syringeSizeMl / totalDurationHours,
    salineVolumeMl: syringeSizeMl - drugVolumeMl,
    syringeSizeMl,
    totalDurationHours,
  }
}

export const formatFlkNumber = (value: number, digits = 2): string => {
  const multiplier = 10 ** digits
  const roundedValue = Math.round((value + Number.EPSILON) * multiplier) / multiplier

  return roundedValue.toFixed(digits).replace(/\.?0+$/, '')
}
