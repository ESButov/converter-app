import { describe, expect, it } from 'vitest'
import {
  addDaysToIsoDate,
  calculatePdr,
  formatPdrDate,
  formatPdrNumber,
  getPdrGroupById,
} from './pdr'

describe('pdr', () => {
  it('calculates feline expected parturition date by BP', () => {
    const result = calculatePdr({
      bpMm: 20,
      examDateIso: '2026-09-01',
      groupId: 'cat',
    })

    expect(result?.daysBeforeParturition).toBeCloseTo(7.2128)
    expect(result?.roundedDaysBeforeParturition).toBe(7)
    expect(result?.dueDateIso).toBe('2026-09-08')
    expect(result?.rangeStartIso).toBe('2026-09-06')
    expect(result?.rangeEndIso).toBe('2026-09-10')
    expect(result?.isOutsideRecommendedPeriod).toBe(false)
  })

  it('calculates small, medium, large and giant dog dates by group-specific formulas', () => {
    expect(calculatePdr({
      bpMm: 20,
      examDateIso: '2026-09-01',
      groupId: 'dogSmall',
    })?.dueDateIso).toBe('2026-09-09')

    expect(calculatePdr({
      bpMm: 25,
      examDateIso: '2026-09-01',
      groupId: 'dogMedium',
    })?.dueDateIso).toBe('2026-09-07')

    expect(calculatePdr({
      bpMm: 24,
      examDateIso: '2026-09-01',
      groupId: 'dogLarge',
    })?.dueDateIso).toBe('2026-09-09')

    expect(calculatePdr({
      bpMm: 24,
      examDateIso: '2026-09-01',
      groupId: 'dogGiant',
    })?.dueDateIso).toBe('2026-09-08')
  })

  it('marks values outside recommended BP timing period', () => {
    expect(calculatePdr({
      bpMm: 31,
      examDateIso: '2026-09-01',
      groupId: 'dogLarge',
    })?.isOutsideRecommendedPeriod).toBe(true)
  })

  it('does not calculate with missing or invalid values', () => {
    expect(calculatePdr({
      bpMm: 20,
      groupId: 'cat',
    })).toBeUndefined()

    expect(calculatePdr({
      bpMm: 0,
      examDateIso: '2026-09-01',
      groupId: 'cat',
    })).toBeUndefined()

    expect(calculatePdr({
      bpMm: 20,
      examDateIso: '2026-02-31',
      groupId: 'cat',
    })).toBeUndefined()
  })

  it('formats numbers and dates', () => {
    expect(getPdrGroupById('cat')?.label).toBe('Кошка')
    expect(addDaysToIsoDate('2026-09-01', 7)).toBe('2026-09-08')
    expect(formatPdrDate('2026-09-08')).toBe('08.09.2026')
    expect(formatPdrNumber(7.2128)).toBe('7.2')
  })
})
