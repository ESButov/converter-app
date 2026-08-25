export type EnteralSpecies = 'dog' | 'cat'
export type FeedType = 'wet' | 'dry'
export type TherapyDay = 'day1' | 'day2' | 'day3' | 'day4' | 'day5' | 'day6' | 'day7Plus'

export type EnteralNeedId =
  | 'dogAdultNeutered'
  | 'dogAdultIntact'
  | 'dogLowActivityObesityProne'
  | 'dogWeightLoss'
  | 'catAdultNeutered'
  | 'catAdultIntact'
  | 'catLowActivityObesityProne'
  | 'catWeightLoss'
  | 'refeedingPrevention'
  | 'hospitalizedPatient'
  | 'severeTraumaSurgeryCancer'
  | 'severeInfectionSepsis'
  | 'burns'

export type DerCoefficientRange = {
  max: number
  min: number
  step?: number
}

export type EnteralNeedDefinition = {
  coefficient: DerCoefficientRange
  id: EnteralNeedId
  label: string
  species: EnteralSpecies | 'all'
}

export type EnteralNutritionInput = {
  derCoefficient?: number
  feedType?: FeedType
  foodCaloriesKcalPer100g?: number
  needId?: EnteralNeedId
  species?: EnteralSpecies
  therapyDay?: TherapyDay
  weightKg?: number
}

export type RefeedingResult = {
  bolusEvery4HoursMl?: number
  bolusEvery6HoursMl?: number
  calculatedNepRateMlHour: number
  dayFactorPercent: number
  foodMassGDay: number
  isRateSafe: boolean
  maxSafeDailyVolumeMl: number
  maxSafeRateMlHour: number
  supplementalBolusVolumeMlDay?: number
  therapyDay: TherapyDay
  totalMixtureMlDay: number
  waterVolumeMlDay: number
}

export type EnteralNutritionResult = {
  derKcalDay: number
  derCoefficient: number
  foodMassDerGDay?: number
  foodMassRerGDay?: number
  need: EnteralNeedDefinition
  refeeding?: RefeedingResult
  rerFactor: number
  rerKcalDay: number
}

export const enteralNeeds = [
  {
    id: 'dogAdultNeutered',
    label: 'Взрослое кастрированное животное',
    species: 'dog',
    coefficient: {
      min: 1.6,
      max: 1.6,
    },
  },
  {
    id: 'dogAdultIntact',
    label: 'Взрослое, интактное',
    species: 'dog',
    coefficient: {
      min: 1.8,
      max: 1.8,
    },
  },
  {
    id: 'dogLowActivityObesityProne',
    label: 'Малоактивный, склонный к ожирению',
    species: 'dog',
    coefficient: {
      min: 1.2,
      max: 1.4,
      step: 0.1,
    },
  },
  {
    id: 'dogWeightLoss',
    label: 'При необходимости снижения веса',
    species: 'dog',
    coefficient: {
      min: 1,
      max: 1,
    },
  },
  {
    id: 'catAdultNeutered',
    label: 'Взрослое кастрированное животное',
    species: 'cat',
    coefficient: {
      min: 1.2,
      max: 1.4,
      step: 0.1,
    },
  },
  {
    id: 'catAdultIntact',
    label: 'Взрослое, интактное',
    species: 'cat',
    coefficient: {
      min: 1.4,
      max: 1.6,
      step: 0.1,
    },
  },
  {
    id: 'catLowActivityObesityProne',
    label: 'Малоактивный, склонный к ожирению',
    species: 'cat',
    coefficient: {
      min: 1,
      max: 1,
    },
  },
  {
    id: 'catWeightLoss',
    label: 'При необходимости снижения веса',
    species: 'cat',
    coefficient: {
      min: 0.8,
      max: 0.8,
    },
  },
  {
    id: 'refeedingPrevention',
    label: 'Профилактика рефидинг синдрома',
    species: 'all',
    coefficient: {
      min: 1,
      max: 1,
    },
  },
  {
    id: 'hospitalizedPatient',
    label: 'Госпитализированный пациент',
    species: 'all',
    coefficient: {
      min: 1.3,
      max: 1.3,
    },
  },
  {
    id: 'severeTraumaSurgeryCancer',
    label: 'Тяжелая травма или хирургическая операция, рак',
    species: 'all',
    coefficient: {
      min: 1.25,
      max: 1.5,
      step: 0.05,
    },
  },
  {
    id: 'severeInfectionSepsis',
    label: 'Тяжелая инфекция или сепсис',
    species: 'all',
    coefficient: {
      min: 1.5,
      max: 1.7,
      step: 0.1,
    },
  },
  {
    id: 'burns',
    label: 'Ожоги',
    species: 'all',
    coefficient: {
      min: 1.7,
      max: 2,
      step: 0.1,
    },
  },
] as const satisfies readonly EnteralNeedDefinition[]

export const therapyDayFactors = {
  day1: 20,
  day2: 40,
  day3: 60,
  day4: 75,
  day5: 85,
  day6: 95,
  day7Plus: 100,
} as const satisfies Record<TherapyDay, number>

export const feedWaterMlPerG = {
  dry: 5,
  wet: 3,
} as const satisfies Record<FeedType, number>

export const rerFactors = {
  cat: 100,
  dog: 70,
} as const satisfies Record<EnteralSpecies, number>

const round = (value: number, digits = 1) => Number(value.toFixed(digits))

const hasPositiveNumber = (value: number | undefined): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value > 0
)

const isNearlyEqual = (left: number, right: number) => (
  Math.abs(left - right) < 0.000001
)

export const getEnteralNeedsForSpecies = (
  species: EnteralSpecies | undefined,
): EnteralNeedDefinition[] => {
  if (species === undefined) {
    return []
  }

  const needs: EnteralNeedDefinition[] = [...enteralNeeds]

  return needs
    .filter((need) => need.species === 'all')
    .concat(needs.filter((need) => need.species === species))
}

export const getEnteralNeed = (
  needId: EnteralNeedId | undefined,
  species: EnteralSpecies | undefined,
) => (
  getEnteralNeedsForSpecies(species).find((need) => need.id === needId)
)

export const isFixedDerCoefficient = (range: DerCoefficientRange) => (
  isNearlyEqual(range.min, range.max)
)

export const getDerCoefficientOptions = (
  range: DerCoefficientRange,
): number[] => {
  if (isFixedDerCoefficient(range)) {
    return [range.min]
  }

  const step = range.step ?? 0.1
  const stepsCount = Math.round((range.max - range.min) / step)

  return Array.from({ length: stepsCount + 1 }, (_, index) => (
    round(range.min + index * step, 2)
  ))
}

export const isRefeedingNeed = (needId: EnteralNeedId | undefined) => (
  needId === 'refeedingPrevention'
)

export const calculateRer = (
  species: EnteralSpecies,
  weightKg: number,
) => (
  rerFactors[species] * (weightKg ** 0.75)
)

export const calculateEnteralNutrition = ({
  derCoefficient,
  feedType,
  foodCaloriesKcalPer100g,
  needId,
  species,
  therapyDay,
  weightKg,
}: EnteralNutritionInput): EnteralNutritionResult | undefined => {
  if (
    species === undefined ||
    needId === undefined ||
    !hasPositiveNumber(weightKg) ||
    !hasPositiveNumber(derCoefficient)
  ) {
    return undefined
  }

  const need = getEnteralNeed(needId, species)

  if (need === undefined || !getDerCoefficientOptions(need.coefficient).includes(derCoefficient)) {
    return undefined
  }

  const rerKcalDay = calculateRer(species, weightKg)
  const derKcalDay = rerKcalDay * derCoefficient
  const result: EnteralNutritionResult = {
    derCoefficient,
    derKcalDay: round(derKcalDay),
    need,
    rerFactor: rerFactors[species],
    rerKcalDay: round(rerKcalDay),
  }

  if (!isRefeedingNeed(needId) && hasPositiveNumber(foodCaloriesKcalPer100g)) {
    result.foodMassRerGDay = round(rerKcalDay / foodCaloriesKcalPer100g * 100)
    result.foodMassDerGDay = round(derKcalDay / foodCaloriesKcalPer100g * 100)
  }

  if (
    isRefeedingNeed(needId) &&
    therapyDay !== undefined &&
    feedType !== undefined &&
    hasPositiveNumber(foodCaloriesKcalPer100g)
  ) {
    const dayFactorPercent = therapyDayFactors[therapyDay]
    const foodMassGDay = rerKcalDay * (dayFactorPercent / 100) / foodCaloriesKcalPer100g * 100
    const waterVolumeMlDay = foodMassGDay * feedWaterMlPerG[feedType]
    const totalMixtureMlDay = foodMassGDay + waterVolumeMlDay
    const calculatedNepRateMlHour = totalMixtureMlDay / 24
    const maxSafeRateMlHour = 3 * weightKg
    const maxSafeDailyVolumeMl = maxSafeRateMlHour * 24
    const isRateSafe = calculatedNepRateMlHour <= maxSafeRateMlHour

    result.refeeding = {
      calculatedNepRateMlHour: round(calculatedNepRateMlHour),
      dayFactorPercent,
      foodMassGDay: round(foodMassGDay),
      isRateSafe,
      maxSafeDailyVolumeMl: round(maxSafeDailyVolumeMl),
      maxSafeRateMlHour: round(maxSafeRateMlHour),
      therapyDay,
      totalMixtureMlDay: round(totalMixtureMlDay),
      waterVolumeMlDay: round(waterVolumeMlDay),
    }

    if (!isRateSafe) {
      const supplementalBolusVolumeMlDay = totalMixtureMlDay - maxSafeDailyVolumeMl

      result.refeeding.supplementalBolusVolumeMlDay = round(supplementalBolusVolumeMlDay)
      result.refeeding.bolusEvery4HoursMl = round(supplementalBolusVolumeMlDay / 6)
      result.refeeding.bolusEvery6HoursMl = round(supplementalBolusVolumeMlDay / 4)
    }
  }

  return result
}

export const formatEnteralNumber = (value: number, digits = 1): string => (
  value.toFixed(digits).replace(/\.?0+$/, '')
)
