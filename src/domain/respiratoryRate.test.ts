import { describe, expect, it } from 'vitest'
import {
  calculateRespiratoryRatePerMinute,
  formatRespiratoryRateTimer,
} from './respiratoryRate'

describe('calculateRespiratoryRatePerMinute', () => {
  it('multiplies short timer counts to one minute', () => {
    expect(calculateRespiratoryRatePerMinute(6, 15)).toBe(24)
    expect(calculateRespiratoryRatePerMinute(8, 30)).toBe(16)
    expect(calculateRespiratoryRatePerMinute(18, 60)).toBe(18)
  })

  it('ignores invalid input', () => {
    expect(calculateRespiratoryRatePerMinute(-1, 15)).toBeUndefined()
    expect(calculateRespiratoryRatePerMinute(4, 0)).toBeUndefined()
  })
})

describe('formatRespiratoryRateTimer', () => {
  it('formats seconds as mm:ss', () => {
    expect(formatRespiratoryRateTimer(15)).toBe('00:15')
    expect(formatRespiratoryRateTimer(60)).toBe('01:00')
    expect(formatRespiratoryRateTimer(-5)).toBe('00:00')
  })
})
