import { describe, expect, it } from 'vitest'
import {
  calculateSodiumCorrection,
  formatSodiumNumber,
  getCompatibleSodiumFluids,
  getSodiumCorrectionDirection,
} from './sodiumCorrection'

describe('sodiumCorrection', () => {
  it('calculates hyponatremia correction by the Adrogue-Madias formula', () => {
    const result = calculateSodiumCorrection({
      chronicity: 'chronic',
      currentSodiumMmolL: 115,
      fluidId: 'normosolR',
      targetSodiumMmolL: 125,
      weightKg: 10,
    })

    expect(result?.direction).toBe('increase')
    expect(result?.totalBodyWaterL).toBeCloseTo(6)
    expect(result?.sodiumDeltaMmolL).toBeCloseTo(10)
    expect(result?.sodiumDeficitMmol).toBeCloseTo(60)
    expect(result?.expectedChangePerLiterMmolL).toBeCloseTo(3.5714)
    expect(result?.correctionVolumeMl).toBeCloseTo(2800)
    expect(result?.replacementTimeHours).toBeCloseTo(20)
    expect(result?.correctionRateMlHour).toBeCloseTo(140)
  })

  it('calculates hypernatremia free water deficit and selected fluid volume', () => {
    const result = calculateSodiumCorrection({
      chronicity: 'chronic',
      currentSodiumMmolL: 175,
      fluidId: 'dextrose5',
      targetSodiumMmolL: 145,
      weightKg: 5,
    })

    expect(result?.direction).toBe('decrease')
    expect(result?.totalBodyWaterL).toBeCloseTo(3)
    expect(result?.freeWaterDeficitMl).toBeCloseTo(620.6897)
    expect(result?.expectedChangePerLiterMmolL).toBeCloseTo(-43.75)
    expect(result?.correctionVolumeMl).toBeCloseTo(685.7143)
    expect(result?.replacementTimeHours).toBeCloseTo(60)
    expect(result?.correctionRateMlHour).toBeCloseTo(11.4286)
  })

  it('filters fluids by correction direction and target sodium', () => {
    expect(getSodiumCorrectionDirection(115, 125)).toBe('increase')
    expect(getSodiumCorrectionDirection(175, 145)).toBe('decrease')
    expect(getSodiumCorrectionDirection(145, 145)).toBeUndefined()

    const increaseFluidIds = getCompatibleSodiumFluids(115, 125).map((fluid) => fluid.id)
    const decreaseFluidIds = getCompatibleSodiumFluids(175, 145).map((fluid) => fluid.id)

    expect(increaseFluidIds).toContain('lactatedRingers')
    expect(increaseFluidIds).toContain('sodiumChloride3')
    expect(increaseFluidIds).not.toContain('dextrose5')
    expect(decreaseFluidIds).toContain('dextrose5')
    expect(decreaseFluidIds).toContain('sodiumChloride045')
    expect(decreaseFluidIds).not.toContain('plasmaLyteA')
    expect(decreaseFluidIds).not.toContain('sodiumChloride09')
  })

  it('calculates hypertonic saline bolus range when selected for sodium increase', () => {
    const result = calculateSodiumCorrection({
      currentSodiumMmolL: 115,
      fluidId: 'sodiumChloride3',
      targetSodiumMmolL: 125,
      weightKg: 10,
    })

    expect(result?.hypertonicBolusMinMl).toBeCloseTo(20)
    expect(result?.hypertonicBolusMaxMl).toBeCloseTo(60)
  })

  it('formats numbers without trailing zeroes', () => {
    expect(formatSodiumNumber(140)).toBe('140')
    expect(formatSodiumNumber(620.6897)).toBe('620.7')
    expect(formatSodiumNumber(11.4286, 2)).toBe('11.43')
  })
})
