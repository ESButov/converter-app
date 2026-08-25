import { describe, expect, it } from 'vitest'
import {
  calculateKclConcentrationMEqMl,
  calculateKaliumReplacement,
  formatKaliumNumber,
  getKaliumGuideline,
} from './kaliumReplacement'

describe('kaliumReplacement', () => {
  it('calculates KCl 4% rate by AAHA dose range', () => {
    expect(calculateKaliumReplacement({
      currentKaliumMmolL: 2.8,
      kclConcentrationPercent: 4,
      weightKg: 10,
    })).toMatchObject({
      doseMEqKgHour: {
        min: 0.2,
        max: 0.25,
      },
      guidelineLabel: '2.6-3.0 mmol/L',
      kclConcentrationMEqMl: 0.537,
      kclDoseMlKgHour: {
        min: 0.37,
        max: 0.47,
      },
      kclRateMlHour: {
        min: 3.7,
        max: 4.7,
      },
      kaliumRateMEqHour: {
        min: 2,
        max: 2.5,
      },
    })
  })

  it('uses maximum routine IV dose for severe hypokalemia', () => {
    expect(calculateKaliumReplacement({
      currentKaliumMmolL: 1.9,
      kclConcentrationPercent: 4,
      weightKg: 4,
    })).toMatchObject({
      doseMEqKgHour: {
        min: 0.5,
        max: 0.5,
      },
      kclDoseMlKgHour: {
        min: 0.93,
        max: 0.93,
      },
      kclRateMlHour: {
        min: 3.7,
        max: 3.7,
      },
      kaliumRateMEqHour: {
        min: 2,
        max: 2,
      },
    })
  })

  it('keeps boundary values in the intended kalium ranges', () => {
    expect(getKaliumGuideline(3.5)?.label).toBe('3.1-3.5 mmol/L')
    expect(getKaliumGuideline(3)?.label).toBe('2.6-3.0 mmol/L')
    expect(getKaliumGuideline(2.5)?.label).toBe('2.0-2.5 mmol/L')
    expect(getKaliumGuideline(2)?.label).toBe('2.0-2.5 mmol/L')
  })

  it('calculates arbitrary KCl concentration', () => {
    expect(Number(calculateKclConcentrationMEqMl(10).toFixed(3))).toBe(1.341)
    expect(calculateKaliumReplacement({
      currentKaliumMmolL: 2.8,
      kclConcentrationPercent: 10,
      weightKg: 10,
    })?.kclRateMlHour).toEqual({
      min: 1.5,
      max: 1.9,
    })
  })

  it('does not calculate when required values are missing', () => {
    expect(calculateKaliumReplacement({
      currentKaliumMmolL: 2.8,
      kclConcentrationPercent: 4,
    })).toBeUndefined()
  })

  it('formats numbers without trailing zero', () => {
    expect(formatKaliumNumber(4)).toBe('4')
    expect(formatKaliumNumber(0.536, 3)).toBe('0.536')
  })
})
