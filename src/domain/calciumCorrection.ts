export type CalciumCorrectionDirection = 'decrease' | 'increase'
export type CalciumFluidId = 'balancedIsotonic' | 'sodiumChloride09'

export type CalciumFluid = {
  id: CalciumFluidId
  label: string
}

export type CalciumDoseRange = {
  max: number
  min: number
}

export type CalciumCorrectionInput = {
  calciumGluconateConcentrationPercent?: number
  currentCalciumMmolL?: number
  fluidId?: CalciumFluidId
  targetCalciumMmolL?: number
  weightKg?: number
}

export type CalciumCorrectionResult = {
  calciumDeltaMmolL: number
  calciumGluconateConcentrationPercent?: number
  direction: CalciumCorrectionDirection
  doseMlKg?: CalciumDoseRange
  fluid?: CalciumFluid
  infusionMinutes?: CalciumDoseRange
  targetCalciumMmolL: number
  totalDoseMl?: CalciumDoseRange
}

export const calciumFluids = [
  {
    id: 'balancedIsotonic',
    label: 'Буферный изотонический кристаллоид',
  },
  {
    id: 'sodiumChloride09',
    label: '0.9% раствор натрия хлорида',
  },
] as const satisfies readonly CalciumFluid[]

export const calciumFluidIds = calciumFluids.map((fluid) => fluid.id)

const calciumGluconate10DoseMlKg = {
  max: 1.5,
  min: 0.5,
} as const satisfies CalciumDoseRange

const calciumGluconateInfusionMinutes = {
  max: 30,
  min: 20,
} as const satisfies CalciumDoseRange

const standardCalciumGluconatePercent = 10

const hasPositiveNumber = (value: number | undefined): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value > 0
)

const round = (value: number, digits = 2) => {
  const multiplier = 10 ** digits

  return Math.round((value + Number.EPSILON) * multiplier) / multiplier
}

const roundRange = (range: CalciumDoseRange, digits = 2): CalciumDoseRange => ({
  max: round(range.max, digits),
  min: round(range.min, digits),
})

export const getCalciumCorrectionDirection = (
  currentCalciumMmolL?: number,
  targetCalciumMmolL?: number,
): CalciumCorrectionDirection | undefined => {
  if (
    !hasPositiveNumber(currentCalciumMmolL) ||
    !hasPositiveNumber(targetCalciumMmolL) ||
    currentCalciumMmolL === targetCalciumMmolL
  ) {
    return undefined
  }

  return targetCalciumMmolL > currentCalciumMmolL ? 'increase' : 'decrease'
}

export const getCompatibleCalciumFluids = (
  currentCalciumMmolL?: number,
  targetCalciumMmolL?: number,
): CalciumFluid[] => (
  getCalciumCorrectionDirection(currentCalciumMmolL, targetCalciumMmolL) === 'decrease'
    ? [...calciumFluids]
    : []
)

export const calculateCalciumCorrection = ({
  calciumGluconateConcentrationPercent,
  currentCalciumMmolL,
  fluidId,
  targetCalciumMmolL,
  weightKg,
}: CalciumCorrectionInput): CalciumCorrectionResult | undefined => {
  if (
    !hasPositiveNumber(currentCalciumMmolL) ||
    !hasPositiveNumber(targetCalciumMmolL)
  ) {
    return undefined
  }

  const direction = getCalciumCorrectionDirection(
    currentCalciumMmolL,
    targetCalciumMmolL,
  )

  if (direction === undefined) {
    return undefined
  }

  const baseResult = {
    calciumDeltaMmolL: round(targetCalciumMmolL - currentCalciumMmolL),
    direction,
    targetCalciumMmolL: round(targetCalciumMmolL),
  }

  if (direction === 'decrease') {
    const compatibleFluids = getCompatibleCalciumFluids(
      currentCalciumMmolL,
      targetCalciumMmolL,
    )
    const selectedFluid = fluidId === undefined
      ? undefined
      : compatibleFluids.find((fluid) => fluid.id === fluidId)

    return {
      ...baseResult,
      fluid: selectedFluid,
    }
  }

  if (
    !hasPositiveNumber(weightKg) ||
    !hasPositiveNumber(calciumGluconateConcentrationPercent)
  ) {
    return undefined
  }

  const concentrationMultiplier = (
    standardCalciumGluconatePercent / calciumGluconateConcentrationPercent
  )
  const doseMlKg = roundRange({
    max: calciumGluconate10DoseMlKg.max * concentrationMultiplier,
    min: calciumGluconate10DoseMlKg.min * concentrationMultiplier,
  })

  return {
    ...baseResult,
    calciumGluconateConcentrationPercent: round(calciumGluconateConcentrationPercent),
    doseMlKg,
    infusionMinutes: calciumGluconateInfusionMinutes,
    totalDoseMl: roundRange({
      max: doseMlKg.max * weightKg,
      min: doseMlKg.min * weightKg,
    }),
  }
}

export const formatCalciumNumber = (value: number, digits = 1): string => {
  const fixedValue = value.toFixed(digits)

  return fixedValue.includes('.')
    ? fixedValue.replace(/\.?0+$/, '')
    : fixedValue
}
