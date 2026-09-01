import { describe, expect, it } from 'vitest'
import {
  calculateIpscalc,
  calculateMaintenanceMlDay,
  formatIpscalcNumber,
} from './ipscalc'

describe('ipscalc', () => {
  it('calculates dehydration deficit, maintenance and measured ongoing losses', () => {
    expect(calculateIpscalc({
      dehydrationPercent: 8,
      losses: {
        diarrheaMl: 50,
        vomitingMl: 100,
      },
      lossesPeriodHours: 24,
      rehydrationHours: 24,
      species: 'dog',
      weightKg: 10,
    })).toMatchObject({
      deficitRateMlHour: 33.33,
      dehydrationDeficitMl: 800,
      firstDayVolumeMl: 1320,
      maintenanceMlDay: 370,
      maintenanceMlHour: 15.42,
      ongoingLossesMlDay: 150,
      ongoingLossesMlHour: 6.25,
      ongoingLossesTotalMl: 150,
      rateAfterDeficitMlHour: 21.67,
      rehydrationPeriodVolumeMl: 1320,
      totalRateDuringRehydrationMlHour: 55,
    })
  })

  it('calculates first day volume correctly when deficit replacement is longer than one day', () => {
    expect(calculateIpscalc({
      dehydrationPercent: 8,
      losses: {
        vomitingMl: 120,
      },
      lossesPeriodHours: 24,
      rehydrationHours: 48,
      species: 'cat',
      weightKg: 10,
    })).toMatchObject({
      deficitRateMlHour: 16.67,
      dehydrationDeficitMl: 800,
      firstDayVolumeMl: 890,
      maintenanceMlDay: 370,
      ongoingLossesMlDay: 120,
      totalRateDuringRehydrationMlHour: 37.08,
    })
  })

  it('requires integer replacement and losses period hours', () => {
    expect(calculateIpscalc({
      dehydrationPercent: 8,
      rehydrationHours: 12.5,
      species: 'dog',
      weightKg: 10,
    })).toBeUndefined()

    expect(calculateIpscalc({
      dehydrationPercent: 8,
      lossesPeriodHours: 2.5,
      rehydrationHours: 12,
      species: 'dog',
      weightKg: 10,
    })).toBeUndefined()
  })

  it('uses 30 x weight + 70 maintenance formula and formats numbers', () => {
    expect(calculateMaintenanceMlDay(10)).toBe(370)
    expect(formatIpscalcNumber(55)).toBe('55')
    expect(formatIpscalcNumber(15.4167, 2)).toBe('15.42')
  })
})
