import { describe, expect, it } from 'vitest'
import {
  calculateCalciumCorrection,
  formatCalciumNumber,
  getCalciumCorrectionDirection,
  getCompatibleCalciumFluids,
} from './calciumCorrection'

describe('calciumCorrection', () => {
  it('calculates calcium gluconate dose for hypocalcemia', () => {
    expect(getCalciumCorrectionDirection(1.4, 1.8)).toBe('increase')
    expect(calculateCalciumCorrection({
      calciumGluconateConcentrationPercent: 10,
      currentCalciumMmolL: 1.4,
      targetCalciumMmolL: 1.8,
      weightKg: 10,
    })).toMatchObject({
      calciumDeltaMmolL: 0.4,
      direction: 'increase',
      doseMlKg: {
        max: 1.5,
        min: 0.5,
      },
      infusionMinutes: {
        max: 30,
        min: 20,
      },
      totalDoseMl: {
        max: 15,
        min: 5,
      },
    })
  })

  it('adjusts dose for a non-standard calcium gluconate concentration', () => {
    expect(calculateCalciumCorrection({
      calciumGluconateConcentrationPercent: 5,
      currentCalciumMmolL: 1.4,
      targetCalciumMmolL: 1.8,
      weightKg: 10,
    })?.doseMlKg).toEqual({
      max: 3,
      min: 1,
    })
  })

  it('returns fluid choices for hypercalcemia protocol', () => {
    expect(getCalciumCorrectionDirection(3.5, 2.8)).toBe('decrease')
    expect(getCompatibleCalciumFluids(3.5, 2.8).map((fluid) => fluid.id)).toEqual([
      'balancedIsotonic',
      'sodiumChloride09',
    ])
    expect(calculateCalciumCorrection({
      currentCalciumMmolL: 3.5,
      fluidId: 'balancedIsotonic',
      targetCalciumMmolL: 2.8,
    })).toMatchObject({
      calciumDeltaMmolL: -0.7,
      direction: 'decrease',
      fluid: {
        id: 'balancedIsotonic',
      },
    })
  })

  it('formats numbers without trailing zero', () => {
    expect(formatCalciumNumber(1.5)).toBe('1.5')
    expect(formatCalciumNumber(10)).toBe('10')
  })
})
