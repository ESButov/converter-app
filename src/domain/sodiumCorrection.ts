export type SodiumChronicity = 'acute' | 'chronic'
export type SodiumCorrectionDirection = 'decrease' | 'increase'
export type SodiumFluidId =
  | 'dextrose5'
  | 'lactatedRingers'
  | 'normosolM5Dextrose'
  | 'normosolR'
  | 'plasmaLyte56Dextrose'
  | 'plasmaLyteA'
  | 'ringers'
  | 'sodiumChloride018Dextrose4'
  | 'sodiumChloride045'
  | 'sodiumChloride045Dextrose25'
  | 'sodiumChloride09'
  | 'sodiumChloride3'
  | 'sodiumChloride5'
  | 'sodiumChloride75'

export type SodiumFluid = {
  id: SodiumFluidId
  label: string
  sodiumMmolL: number
  isHypertonic?: boolean
}

export type SodiumCorrectionInput = {
  chronicity?: SodiumChronicity
  currentSodiumMmolL?: number
  fluidId?: SodiumFluidId
  targetSodiumMmolL?: number
  weightKg?: number
}

export type SodiumCorrectionResult = {
  correctionRateMlHour: number
  correctionVolumeMl: number
  direction: SodiumCorrectionDirection
  expectedChangePerLiterMmolL: number
  fluid: SodiumFluid
  freeWaterDeficitMl?: number
  hypertonicBolusMaxMl?: number
  hypertonicBolusMinMl?: number
  maxCorrectionRateMmolLHour: number
  replacementTimeHours: number
  sodiumDeficitMmol?: number
  sodiumDeltaMmolL: number
  totalBodyWaterL: number
}

export const sodiumChronicityLabels = {
  acute: 'Острое',
  chronic: 'Хроническое / неизвестно',
} as const satisfies Record<SodiumChronicity, string>

export const sodiumDirectionLabels = {
  decrease: 'гипернатриемия / снижение Na+',
  increase: 'гипонатриемия / повышение Na+',
} as const satisfies Record<SodiumCorrectionDirection, string>

export const sodiumFluids = [
  {
    id: 'dextrose5',
    label: '5% глюкоза в воде / D5W',
    sodiumMmolL: 0,
  },
  {
    id: 'sodiumChloride018Dextrose4',
    label: '0.18% NaCl + 4% глюкоза',
    sodiumMmolL: 31,
  },
  {
    id: 'plasmaLyte56Dextrose',
    label: 'Plasma-Lyte 56 в 5% глюкозе',
    sodiumMmolL: 40,
  },
  {
    id: 'normosolM5Dextrose',
    label: 'Normosol-M в 5% глюкозе',
    sodiumMmolL: 40,
  },
  {
    id: 'sodiumChloride045',
    label: '0.45% NaCl',
    sodiumMmolL: 77,
  },
  {
    id: 'sodiumChloride045Dextrose25',
    label: '0.45% NaCl + 2.5% глюкоза',
    sodiumMmolL: 77,
  },
  {
    id: 'lactatedRingers',
    label: 'Раствор Рингера-лактат / Hartmann',
    sodiumMmolL: 130,
  },
  {
    id: 'plasmaLyteA',
    label: 'Plasma-Lyte A',
    sodiumMmolL: 140,
  },
  {
    id: 'normosolR',
    label: 'Normosol-R',
    sodiumMmolL: 140,
  },
  {
    id: 'ringers',
    label: 'Раствор Рингера',
    sodiumMmolL: 147,
  },
  {
    id: 'sodiumChloride09',
    label: '0.9% NaCl',
    sodiumMmolL: 154,
  },
  {
    id: 'sodiumChloride3',
    label: '3% NaCl',
    sodiumMmolL: 513,
    isHypertonic: true,
  },
  {
    id: 'sodiumChloride5',
    label: '5% NaCl',
    sodiumMmolL: 856,
    isHypertonic: true,
  },
  {
    id: 'sodiumChloride75',
    label: '7.5% NaCl',
    sodiumMmolL: 1283,
    isHypertonic: true,
  },
] as const satisfies readonly SodiumFluid[]

export const sodiumFluidIds = sodiumFluids.map((fluid) => fluid.id)

const sodiumFluidById = new Map<SodiumFluidId, SodiumFluid>(
  sodiumFluids.map((fluid) => [fluid.id, fluid]),
)

const sodiumFluidIdsByDirection = {
  decrease: [
    'dextrose5',
    'sodiumChloride018Dextrose4',
    'plasmaLyte56Dextrose',
    'normosolM5Dextrose',
    'sodiumChloride045',
    'sodiumChloride045Dextrose25',
  ],
  increase: [
    'lactatedRingers',
    'plasmaLyteA',
    'normosolR',
    'ringers',
    'sodiumChloride09',
    'sodiumChloride3',
    'sodiumChloride5',
    'sodiumChloride75',
  ],
} as const satisfies Record<SodiumCorrectionDirection, readonly SodiumFluidId[]>

const totalBodyWaterFactor = 0.6
const chronicCorrectionRateMmolLHour = 0.5
const acuteCorrectionRateMmolLHour = 1
const hypertonicBolusMinMlKg = 2
const hypertonicBolusMaxMlKg = 6

const hasPositiveNumber = (value: number | undefined): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value > 0
)

export const getSodiumCorrectionDirection = (
  currentSodiumMmolL?: number,
  targetSodiumMmolL?: number,
): SodiumCorrectionDirection | undefined => {
  if (
    !hasPositiveNumber(currentSodiumMmolL) ||
    !hasPositiveNumber(targetSodiumMmolL) ||
    currentSodiumMmolL === targetSodiumMmolL
  ) {
    return undefined
  }

  return targetSodiumMmolL > currentSodiumMmolL ? 'increase' : 'decrease'
}

export const getSodiumFluidById = (fluidId: SodiumFluidId) => (
  sodiumFluidById.get(fluidId)
)

export const getCompatibleSodiumFluids = (
  currentSodiumMmolL?: number,
  targetSodiumMmolL?: number,
): SodiumFluid[] => {
  const direction = getSodiumCorrectionDirection(currentSodiumMmolL, targetSodiumMmolL)

  if (
    direction === undefined ||
    currentSodiumMmolL === undefined ||
    targetSodiumMmolL === undefined
  ) {
    return []
  }

  return sodiumFluidIdsByDirection[direction]
    .map((fluidId) => sodiumFluidById.get(fluidId))
    .filter((fluid): fluid is SodiumFluid => (
      fluid !== undefined &&
      (direction === 'increase'
        ? fluid.sodiumMmolL > currentSodiumMmolL
        : fluid.sodiumMmolL < currentSodiumMmolL)
    ))
}

export const calculateSodiumCorrection = (
  input: SodiumCorrectionInput,
): SodiumCorrectionResult | undefined => {
  if (
    !hasPositiveNumber(input.weightKg) ||
    !hasPositiveNumber(input.currentSodiumMmolL) ||
    !hasPositiveNumber(input.targetSodiumMmolL)
  ) {
    return undefined
  }

  const direction = getSodiumCorrectionDirection(
    input.currentSodiumMmolL,
    input.targetSodiumMmolL,
  )

  if (direction === undefined) {
    return undefined
  }

  const compatibleFluids = getCompatibleSodiumFluids(
    input.currentSodiumMmolL,
    input.targetSodiumMmolL,
  )
  const fluid = input.fluidId === undefined
    ? compatibleFluids[0]
    : getSodiumFluidById(input.fluidId)

  if (fluid === undefined || !compatibleFluids.some(({ id }) => id === fluid.id)) {
    return undefined
  }

  const chronicity = input.chronicity ?? 'chronic'
  const totalBodyWaterL = input.weightKg * totalBodyWaterFactor
  const sodiumDeltaMmolL = Math.abs(input.targetSodiumMmolL - input.currentSodiumMmolL)
  const maxCorrectionRateMmolLHour = chronicity === 'acute'
    ? acuteCorrectionRateMmolLHour
    : chronicCorrectionRateMmolLHour
  const replacementTimeHours = sodiumDeltaMmolL / maxCorrectionRateMmolLHour
  const expectedChangePerLiterMmolL = (
    fluid.sodiumMmolL - input.currentSodiumMmolL
  ) / (totalBodyWaterL + 1)
  const correctionVolumeMl = sodiumDeltaMmolL /
    Math.abs(expectedChangePerLiterMmolL) * 1000
  const isHypertonicFluid = 'isHypertonic' in fluid && fluid.isHypertonic === true

  return {
    correctionRateMlHour: correctionVolumeMl / replacementTimeHours,
    correctionVolumeMl,
    direction,
    expectedChangePerLiterMmolL,
    fluid,
    freeWaterDeficitMl: direction === 'decrease'
      ? (input.currentSodiumMmolL / input.targetSodiumMmolL - 1) * totalBodyWaterL * 1000
      : undefined,
    hypertonicBolusMaxMl: direction === 'increase' && isHypertonicFluid
      ? input.weightKg * hypertonicBolusMaxMlKg
      : undefined,
    hypertonicBolusMinMl: direction === 'increase' && isHypertonicFluid
      ? input.weightKg * hypertonicBolusMinMlKg
      : undefined,
    maxCorrectionRateMmolLHour,
    replacementTimeHours,
    sodiumDeficitMmol: direction === 'increase'
      ? sodiumDeltaMmolL * totalBodyWaterL
      : undefined,
    sodiumDeltaMmolL,
    totalBodyWaterL,
  }
}

export const formatSodiumNumber = (value: number, digits = 1): string => {
  const multiplier = 10 ** digits
  const roundedValue = Math.round((value + Number.EPSILON) * multiplier) / multiplier

  return roundedValue.toFixed(digits).replace(/\.?0+$/, '')
}
