import { describe, expect, it } from 'vitest'
import {
  calculateChlorideCorrection,
  calculateCorrectedChloride,
  formatChlorideNumber,
  getChlorideCorrectionDirection,
  getCompatibleChlorideFluids,
} from './chlorideCorrection'

describe('chlorideCorrection', () => {
  it('calculates corrected chloride by measured sodium', () => {
    expect(calculateCorrectedChloride(90, 125)).toBeCloseTo(104.4)
    expect(getChlorideCorrectionDirection(90, 125, 110)).toBe('increase')
    expect(getChlorideCorrectionDirection(90, 125, 100)).toBe('decrease')
  })

  it('selects sodium chloride for hypochloremia correction', () => {
    const fluidIds = getCompatibleChlorideFluids(90, 125, 110).map((fluid) => fluid.id)

    expect(fluidIds).toEqual(['sodiumChloride09'])
    expect(calculateChlorideCorrection({
      currentChlorideMmolL: 90,
      currentSodiumMmolL: 125,
      fluidId: 'sodiumChloride09',
      targetChlorideMmolL: 110,
    })).toMatchObject({
      chlorideDeltaMmolL: 5.6,
      correctedChlorideMmolL: 104.4,
      direction: 'increase',
      fluid: {
        id: 'sodiumChloride09',
      },
    })
  })

  it('selects lower chloride fluids for hyperchloremia', () => {
    const fluidIds = getCompatibleChlorideFluids(125, 145, 110).map((fluid) => fluid.id)

    expect(fluidIds).toContain('lactatedRingers')
    expect(fluidIds).toContain('plasmaLyteA')
    expect(fluidIds).not.toContain('sodiumChloride09')
  })

  it('formats numbers without trailing zero', () => {
    expect(formatChlorideNumber(104.4)).toBe('104.4')
    expect(formatChlorideNumber(110)).toBe('110')
  })
})
