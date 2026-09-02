export type TransfusionSpecies = 'dog' | 'cat'
export type BloodComponent =
  | 'wholeBlood'
  | 'packedRbc'
  | 'plasma'
  | 'albumin'
  | 'platelets'
  | 'donorCollection'

export type DoseRange = {
  min: number
  max: number
}

export type RedCellTransfusionInput = {
  currentPcv?: number
  plannedVolumeMl?: number
  productPcv?: number
  species?: TransfusionSpecies
  targetPcv?: number
  weightKg?: number
}

export type RedCellTransfusionResult = {
  bloodVolumeMl: number
  bloodVolumeMlKg: number
  expectedPcv: number
  pcvDelta: number
  plannedExpectedPcv?: number
  plannedPcvIncrease?: number
  volumeMl: number
  volumeMlKg: number
}

export type PlasmaTransfusionResult = {
  doseMlKg: DoseRange
  volumeMl: DoseRange
}

export type PlateletTransfusionResult = {
  roundedUnits: number
  units: number
}

export type DonorBloodCollectionResult = {
  doseMlKg: DoseRange
  isBelowRecommendedWeight: boolean
  recommendedWeightKg: number
  volumeMl: DoseRange
}

export type AlbuminReplacementInput = {
  currentAlbuminGL?: number
  targetAlbuminGL?: number
  weightKg?: number
}

export type AlbuminReplacementResult = {
  albuminDeltaGL: number
  dilutionVolume20PercentMl: number
  infusionTimeHours: number
  speed10PercentMlHour: number
  speed20PercentDilutedMlHour: number
  speed20PercentMlHour: number
  volume10PercentMl: number
  volume20PercentMl: number
}

type DonorBloodCollectionGuideline = {
  doseMlKg: DoseRange
  recommendedWeightKg: number
}

export const transfusionSpeciesKeys = ['dog', 'cat'] as const satisfies readonly TransfusionSpecies[]

export const bloodComponentKeys = [
  'wholeBlood',
  'packedRbc',
  'plasma',
  'albumin',
  'platelets',
  'donorCollection',
] as const satisfies readonly BloodComponent[]

export const bloodVolumeBySpeciesMlKg = {
  dog: 90,
  cat: 60,
} as const satisfies Record<TransfusionSpecies, number>

export const plasmaDoseRangesMlKg = {
  dog: {
    min: 10,
    max: 20,
  },
  cat: {
    min: 6,
    max: 10,
  },
} as const satisfies Record<TransfusionSpecies, DoseRange>

export const donorBloodCollectionGuidelines: Record<
  TransfusionSpecies,
  DonorBloodCollectionGuideline
> = {
  dog: {
    doseMlKg: {
      min: 15,
      max: 15,
    },
    recommendedWeightKg: 25,
  },
  cat: {
    doseMlKg: {
      min: 10,
      max: 12,
    },
    recommendedWeightKg: 4.5,
  },
}

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

export const isRedCellComponent = (component: BloodComponent) => (
  component === 'wholeBlood' || component === 'packedRbc'
)

export const calculateRedCellTransfusion = ({
  currentPcv,
  plannedVolumeMl,
  productPcv,
  species,
  targetPcv,
  weightKg,
}: RedCellTransfusionInput): RedCellTransfusionResult | undefined => {
  if (
    species === undefined ||
    !hasPositiveNumber(weightKg) ||
    !hasNonNegativeNumber(currentPcv) ||
    !hasPositiveNumber(targetPcv) ||
    !hasPositiveNumber(productPcv) ||
    targetPcv <= currentPcv
  ) {
    return undefined
  }

  const bloodVolumeMlKg = bloodVolumeBySpeciesMlKg[species]
  const bloodVolumeMl = weightKg * bloodVolumeMlKg
  const pcvDelta = targetPcv - currentPcv
  const volumeMl = bloodVolumeMl * pcvDelta / productPcv
  const pcvIncrease = volumeMl * productPcv / bloodVolumeMl

  const result: RedCellTransfusionResult = {
    bloodVolumeMl: round(bloodVolumeMl),
    bloodVolumeMlKg,
    expectedPcv: round(currentPcv + pcvIncrease),
    pcvDelta: round(pcvDelta),
    volumeMl: round(volumeMl),
    volumeMlKg: round(volumeMl / weightKg),
  }

  if (hasPositiveNumber(plannedVolumeMl)) {
    const plannedPcvIncrease = plannedVolumeMl * productPcv / bloodVolumeMl

    result.plannedPcvIncrease = round(plannedPcvIncrease)
    result.plannedExpectedPcv = round(currentPcv + plannedPcvIncrease)
  }

  return result
}

export const calculatePlasmaTransfusion = (
  species: TransfusionSpecies | undefined,
  weightKg: number | undefined,
): PlasmaTransfusionResult | undefined => {
  if (species === undefined || !hasPositiveNumber(weightKg)) {
    return undefined
  }

  const doseMlKg = plasmaDoseRangesMlKg[species]

  return {
    doseMlKg,
    volumeMl: {
      min: round(weightKg * doseMlKg.min),
      max: round(weightKg * doseMlKg.max),
    },
  }
}

export const calculatePlateletTransfusion = (
  weightKg: number | undefined,
): PlateletTransfusionResult | undefined => {
  if (!hasPositiveNumber(weightKg)) {
    return undefined
  }

  const units = weightKg / 10

  return {
    roundedUnits: Math.ceil(units),
    units: round(units, 2),
  }
}

export const calculateDonorBloodCollection = (
  species: TransfusionSpecies | undefined,
  weightKg: number | undefined,
): DonorBloodCollectionResult | undefined => {
  if (species === undefined || !hasPositiveNumber(weightKg)) {
    return undefined
  }

  const guideline = donorBloodCollectionGuidelines[species]

  return {
    doseMlKg: guideline.doseMlKg,
    isBelowRecommendedWeight: weightKg < guideline.recommendedWeightKg,
    recommendedWeightKg: guideline.recommendedWeightKg,
    volumeMl: {
      min: round(weightKg * guideline.doseMlKg.min),
      max: round(weightKg * guideline.doseMlKg.max),
    },
  }
}

export const calculateAlbuminReplacement = ({
  currentAlbuminGL,
  targetAlbuminGL,
  weightKg,
}: AlbuminReplacementInput): AlbuminReplacementResult | undefined => {
  if (
    !hasPositiveNumber(weightKg) ||
    !hasNonNegativeNumber(currentAlbuminGL) ||
    !hasPositiveNumber(targetAlbuminGL) ||
    targetAlbuminGL <= currentAlbuminGL
  ) {
    return undefined
  }

  const albuminDeltaGL = targetAlbuminGL - currentAlbuminGL
  const volume20PercentMl = 5 * albuminDeltaGL * 0.3 * weightKg
  const volume10PercentMl = 10 * albuminDeltaGL * 0.3 * weightKg
  const infusionTimeHours = 12

  return {
    albuminDeltaGL: round(albuminDeltaGL),
    dilutionVolume20PercentMl: round(volume20PercentMl),
    infusionTimeHours,
    speed10PercentMlHour: round(volume10PercentMl / infusionTimeHours, 2),
    speed20PercentDilutedMlHour: round((volume20PercentMl * 2) / infusionTimeHours, 2),
    speed20PercentMlHour: round(volume20PercentMl / infusionTimeHours, 2),
    volume10PercentMl: round(volume10PercentMl),
    volume20PercentMl: round(volume20PercentMl),
  }
}

export const formatTransfusionNumber = (value: number, digits = 1): string => (
  value.toFixed(digits).replace(/\.0$/, '')
)
