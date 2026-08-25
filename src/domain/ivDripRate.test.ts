import { describe, expect, it } from 'vitest'
import {
  calculateIvDripRate,
  formatInfusionDuration,
  formatInfusionNumber,
  getInfusionTimeMinutes,
} from './ivDripRate'

describe('ivDripRate', () => {
  it('calculates tempo from volume, time and drop factor', () => {
    expect(calculateIvDripRate({
      dropFactor: 20,
      speedUnit: 'mlPerHour',
      timeHours: 4,
      timeMinutes: 0,
      volumeMl: 500,
    })).toEqual({
      mode: 'byTime',
      totalTimeMinutes: 240,
      mlPerHour: 125,
      dropsPerMinute: 41.7,
      roundedDropsPerMinute: 42,
      secondsPerDrop: 1.4,
    })
  })

  it('calculates time and tempo from ml per hour speed', () => {
    expect(calculateIvDripRate({
      dropFactor: 20,
      speed: 125,
      speedUnit: 'mlPerHour',
      volumeMl: 500,
    })).toMatchObject({
      mode: 'bySpeed',
      totalTimeMinutes: 240,
      mlPerHour: 125,
      dropsPerMinute: 41.7,
      roundedDropsPerMinute: 42,
    })
  })

  it('calculates time and pump speed from drops per minute speed', () => {
    expect(calculateIvDripRate({
      dropFactor: 20,
      speed: 40,
      speedUnit: 'dropsPerMinute',
      volumeMl: 500,
    })).toMatchObject({
      mode: 'bySpeed',
      totalTimeMinutes: 250,
      mlPerHour: 120,
      dropsPerMinute: 40,
      roundedDropsPerMinute: 40,
    })
  })

  it('formats helper values', () => {
    expect(getInfusionTimeMinutes(1, 30)).toBe(90)
    expect(getInfusionTimeMinutes(0, 0)).toBeUndefined()
    expect(formatInfusionDuration(250)).toBe('4 ч 10 мин')
    expect(formatInfusionNumber(41.666)).toBe('41.7')
    expect(formatInfusionNumber(125)).toBe('125')
  })
})
