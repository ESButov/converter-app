import { describe, expect, it } from 'vitest'
import {
  calculateGlucoseInsulinMixture,
  formatGlucoseInsulinNumber,
  getGlucoseInsulinProtocolById,
} from './glucoseInsulin'

describe('glucoseInsulin', () => {
  it('calculates regular insulin and dextrose bolus protocol', () => {
    const result = calculateGlucoseInsulinMixture({
      currentKaliumMmolL: 8,
      targetKaliumMmolL: 6,
      weightKg: 10,
    })

    expect(result).toMatchObject({
      currentKaliumMmolL: 8,
      dilutedBolusMl: {
        max: 50,
        min: 30,
      },
      dilutionSalineMl: {
        max: 40,
        min: 20,
      },
      glucoseBolusG: 5,
      glucoseBolusMl: 10,
      glucoseConcentrationPercent: 50,
      glucoseGPerMl: 0.5,
      insulinUnits: 2.5,
      isLargeKaliumGoal: true,
      isSevereHyperkalemia: true,
      kaliumDecreaseGoalMmolL: 2,
      targetKaliumMmolL: 6,
    })
  })

  it('calculates BSAVA dextrose per insulin unit protocol', () => {
    const result = calculateGlucoseInsulinMixture({
      currentKaliumMmolL: 7.5,
      protocolId: 'bsava05',
      targetKaliumMmolL: 6.5,
      weightKg: 10,
    })

    expect(result).toMatchObject({
      dextroseTotalG: {
        max: 15,
        min: 10,
      },
      glucoseBolusGRange: {
        max: 7.5,
        min: 5,
      },
      glucoseBolusMlRange: {
        max: 15,
        min: 10,
      },
      glucoseRemainderMl: {
        max: 15,
        min: 10,
      },
      glucoseTotalMl: {
        max: 30,
        min: 20,
      },
      insulinUnits: 5,
      isLargeKaliumGoal: false,
      kaliumDecreaseGoalMmolL: 1,
    })
  })

  it('does not calculate if target kalium is not lower than current kalium', () => {
    expect(calculateGlucoseInsulinMixture({
      currentKaliumMmolL: 5,
      targetKaliumMmolL: 5,
      weightKg: 10,
    })).toBeUndefined()

    expect(calculateGlucoseInsulinMixture({
      currentKaliumMmolL: 5,
      targetKaliumMmolL: 6,
      weightKg: 10,
    })).toBeUndefined()
  })

  it('recalculates glucose volume by selected concentration', () => {
    const result = calculateGlucoseInsulinMixture({
      currentKaliumMmolL: 8,
      glucoseConcentrationPercent: 40,
      targetKaliumMmolL: 6,
      weightKg: 10,
    })

    expect(result).toMatchObject({
      dilutedBolusMl: {
        max: 62.5,
        min: 37.5,
      },
      dilutionSalineMl: {
        max: 50,
        min: 25,
      },
      glucoseBolusG: 5,
      glucoseBolusMl: 12.5,
      glucoseConcentrationPercent: 40,
      glucoseGPerMl: 0.4,
    })
  })

  it('returns protocol metadata and formats numbers', () => {
    expect(getGlucoseInsulinProtocolById('regular025')?.insulinUnitsKg).toBe(0.25)
    expect(formatGlucoseInsulinNumber(2)).toBe('2')
    expect(formatGlucoseInsulinNumber(2.567, 2)).toBe('2.57')
  })
})
