import { describe, expect, it } from 'vitest'
import {
  calculateGlucoseDilution,
  formatGlucoseVolume,
  glucoseConcentrations,
  isGlucoseConcentration,
} from './glucoseDilution'

describe('glucoseDilution', () => {
  it('stores available target concentrations', () => {
    expect(glucoseConcentrations).toEqual([10, 15, 20, 30])
    expect(isGlucoseConcentration(20)).toBe(true)
    expect(isGlucoseConcentration(25)).toBe(false)
  })

  it('calculates 40% and 5% glucose volumes', () => {
    expect(calculateGlucoseDilution(100, 10)).toEqual({
      volume40: 100 * (10 - 5) / 35,
      volume5: 100 - 100 * (10 - 5) / 35,
    })
  })

  it('formats volumes with one decimal and hides trailing zero', () => {
    expect(formatGlucoseVolume(14.285)).toBe('14.3')
    expect(formatGlucoseVolume(100)).toBe('100')
  })
})
