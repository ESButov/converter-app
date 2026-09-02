export type ChlorideCorrectionDirection = 'decrease' | 'increase'
export type ChlorideFluidId =
  | 'balancedIsotonic'
  | 'lactatedRingers'
  | 'plasmaLyteA'
  | 'sodiumChloride09'

export type ChlorideFluid = {
  chlorideMmolL: number
  id: ChlorideFluidId
  label: string
}

export type ChlorideCorrectionInput = {
  currentChlorideMmolL?: number
  currentSodiumMmolL?: number
  fluidId?: ChlorideFluidId
  targetChlorideMmolL?: number
}

export type ChlorideCorrectionResult = {
  chlorideDeltaMmolL: number
  correctedChlorideMmolL: number
  direction: ChlorideCorrectionDirection
  fluid?: ChlorideFluid
  measuredChlorideMmolL: number
  measuredSodiumMmolL: number
  normalSodiumMmolL: number
  targetChlorideMmolL: number
}

export const normalSodiumForChlorideCorrectionMmolL = 145

export const chlorideDirectionLabels = {
  decrease: 'гиперхлоремия / снижение хлорной нагрузки',
  increase: 'гипохлоремия / восполнение хлора',
} as const satisfies Record<ChlorideCorrectionDirection, string>

export const chlorideFluids = [
  {
    chlorideMmolL: 154,
    id: 'sodiumChloride09',
    label: '0.9% раствор натрия хлорида',
  },
  {
    chlorideMmolL: 109,
    id: 'lactatedRingers',
    label: 'Раствор Рингера-лактат',
  },
  {
    chlorideMmolL: 98,
    id: 'plasmaLyteA',
    label: 'Плазма-Лайт A',
  },
  {
    chlorideMmolL: 98,
    id: 'balancedIsotonic',
    label: 'Буферный изотонический кристаллоид',
  },
] as const satisfies readonly ChlorideFluid[]

export const chlorideFluidIds = chlorideFluids.map((fluid) => fluid.id)

const chlorideFluidById = new Map<ChlorideFluidId, ChlorideFluid>(
  chlorideFluids.map((fluid) => [fluid.id, fluid]),
)

const chlorideFluidIdsByDirection = {
  decrease: ['lactatedRingers', 'plasmaLyteA', 'balancedIsotonic'],
  increase: ['sodiumChloride09'],
} as const satisfies Record<ChlorideCorrectionDirection, readonly ChlorideFluidId[]>

const hasPositiveNumber = (value: number | undefined): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value > 0
)

const round = (value: number, digits = 2) => {
  const multiplier = 10 ** digits

  return Math.round((value + Number.EPSILON) * multiplier) / multiplier
}

export const calculateCorrectedChloride = (
  measuredChlorideMmolL: number,
  measuredSodiumMmolL: number,
  normalSodiumMmolL = normalSodiumForChlorideCorrectionMmolL,
) => (
  measuredChlorideMmolL * normalSodiumMmolL / measuredSodiumMmolL
)

export const getChlorideCorrectionDirection = (
  currentChlorideMmolL?: number,
  currentSodiumMmolL?: number,
  targetChlorideMmolL?: number,
): ChlorideCorrectionDirection | undefined => {
  if (
    !hasPositiveNumber(currentChlorideMmolL) ||
    !hasPositiveNumber(currentSodiumMmolL) ||
    !hasPositiveNumber(targetChlorideMmolL)
  ) {
    return undefined
  }

  const correctedChlorideMmolL = calculateCorrectedChloride(
    currentChlorideMmolL,
    currentSodiumMmolL,
  )

  if (correctedChlorideMmolL === targetChlorideMmolL) {
    return undefined
  }

  return targetChlorideMmolL > correctedChlorideMmolL ? 'increase' : 'decrease'
}

export const getCompatibleChlorideFluids = (
  currentChlorideMmolL?: number,
  currentSodiumMmolL?: number,
  targetChlorideMmolL?: number,
): ChlorideFluid[] => {
  const direction = getChlorideCorrectionDirection(
    currentChlorideMmolL,
    currentSodiumMmolL,
    targetChlorideMmolL,
  )

  if (direction === undefined) {
    return []
  }

  return chlorideFluidIdsByDirection[direction]
    .map((fluidId) => chlorideFluidById.get(fluidId))
    .filter((fluid): fluid is ChlorideFluid => fluid !== undefined)
}

export const calculateChlorideCorrection = ({
  currentChlorideMmolL,
  currentSodiumMmolL,
  fluidId,
  targetChlorideMmolL,
}: ChlorideCorrectionInput): ChlorideCorrectionResult | undefined => {
  if (
    !hasPositiveNumber(currentChlorideMmolL) ||
    !hasPositiveNumber(currentSodiumMmolL) ||
    !hasPositiveNumber(targetChlorideMmolL)
  ) {
    return undefined
  }

  const correctedChlorideMmolL = calculateCorrectedChloride(
    currentChlorideMmolL,
    currentSodiumMmolL,
  )
  const direction = getChlorideCorrectionDirection(
    currentChlorideMmolL,
    currentSodiumMmolL,
    targetChlorideMmolL,
  )

  if (direction === undefined) {
    return undefined
  }

  const compatibleFluids = getCompatibleChlorideFluids(
    currentChlorideMmolL,
    currentSodiumMmolL,
    targetChlorideMmolL,
  )
  const selectedFluid = fluidId === undefined
    ? undefined
    : compatibleFluids.find((fluid) => fluid.id === fluidId)

  return {
    chlorideDeltaMmolL: round(targetChlorideMmolL - correctedChlorideMmolL),
    correctedChlorideMmolL: round(correctedChlorideMmolL),
    direction,
    fluid: selectedFluid,
    measuredChlorideMmolL: round(currentChlorideMmolL),
    measuredSodiumMmolL: round(currentSodiumMmolL),
    normalSodiumMmolL: normalSodiumForChlorideCorrectionMmolL,
    targetChlorideMmolL: round(targetChlorideMmolL),
  }
}

export const formatChlorideNumber = (value: number, digits = 1): string => {
  const fixedValue = value.toFixed(digits)

  return fixedValue.includes('.')
    ? fixedValue.replace(/\.?0+$/, '')
    : fixedValue
}
