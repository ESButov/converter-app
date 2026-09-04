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
      examDateIso: '2026-09-01',
      groupId: 'cat',
      measurementMm: 20,
      stageId: 'afterFiveWeeks',
    })

    expect(result?.daysBeforeParturition).toBeCloseTo(7.2128)
    expect(result?.roundedDaysBeforeParturition).toBe(7)
    expect(result?.dueDateIso).toBe('2026-09-08')
    expect(result?.rangeStartIso).toBe('2026-09-06')
    expect(result?.rangeEndIso).toBe('2026-09-10')
    expect(result?.isOutsideRecommendedPeriod).toBe(false)
  })

  it('calculates early feline expected parturition date by chorionic cavity', () => {
    const result = calculatePdr({
      examDateIso: '2026-09-01',
      groupId: 'cat',
      measurementMm: 30,
      stageId: 'beforeFiveWeeks',
    })

    expect(result?.daysBeforeParturition).toBeCloseTo(29.1182)
    expect(result?.roundedDaysBeforeParturition).toBe(29)
    expect(result?.dueDateIso).toBe('2026-09-30')
    expect(result?.formula.measurementShortLabel).toBe('ВДХП')
  })

  it('uses Maine Coon specific formulas', () => {
    const earlyResult = calculatePdr({
      examDateIso: '2026-09-01',
      groupId: 'catMaineCoon',
      measurementMm: 30,
      stageId: 'beforeFiveWeeks',
    })
    const lateResult = calculatePdr({
      examDateIso: '2026-09-01',
      groupId: 'catMaineCoon',
      measurementMm: 20,
      stageId: 'afterFiveWeeks',
    })

    expect(earlyResult?.daysBeforeParturition).toBeCloseTo(34.2)
    expect(earlyResult?.dueDateIso).toBe('2026-10-05')
    expect(lateResult?.daysBeforeParturition).toBeCloseTo(12.1)
    expect(lateResult?.dueDateIso).toBe('2026-09-13')
  })

  it('calculates small, medium, large and giant dog dates by group-specific formulas', () => {
    expect(calculatePdr({
      examDateIso: '2026-09-01',
      groupId: 'dogSmall',
      measurementMm: 20,
      stageId: 'afterFiveWeeks',
    })?.dueDateIso).toBe('2026-09-09')

    expect(calculatePdr({
      examDateIso: '2026-09-01',
      groupId: 'dogMedium',
      measurementMm: 25,
      stageId: 'afterFiveWeeks',
    })?.dueDateIso).toBe('2026-09-07')

    expect(calculatePdr({
      examDateIso: '2026-09-01',
      groupId: 'dogLarge',
      measurementMm: 24,
      stageId: 'afterFiveWeeks',
    })?.dueDateIso).toBe('2026-09-09')

    expect(calculatePdr({
      examDateIso: '2026-09-01',
      groupId: 'dogGiant',
      measurementMm: 24,
      stageId: 'afterFiveWeeks',
    })?.dueDateIso).toBe('2026-09-08')
  })

  it('calculates miniature dog dates with separate formulas', () => {
    expect(calculatePdr({
      examDateIso: '2026-09-01',
      groupId: 'dogToy',
      measurementMm: 20,
      stageId: 'afterFiveWeeks',
    })?.dueDateIso).toBe('2026-09-08')

    expect(calculatePdr({
      examDateIso: '2026-09-01',
      groupId: 'dogToy',
      measurementMm: 20,
      stageId: 'beforeFiveWeeks',
    })?.dueDateIso).toBe('2026-10-02')
  })

  it('marks values outside recommended BP timing period', () => {
    expect(calculatePdr({
      examDateIso: '2026-09-01',
      groupId: 'dogLarge',
      measurementMm: 31,
      stageId: 'afterFiveWeeks',
    })?.isOutsideRecommendedPeriod).toBe(true)
  })

  it('does not calculate with missing or invalid values', () => {
    expect(calculatePdr({
      groupId: 'cat',
      measurementMm: 20,
      stageId: 'afterFiveWeeks',
    })).toBeUndefined()

    expect(calculatePdr({
      examDateIso: '2026-09-01',
      groupId: 'cat',
      measurementMm: 0,
      stageId: 'afterFiveWeeks',
    })).toBeUndefined()

    expect(calculatePdr({
      examDateIso: '2026-02-31',
      groupId: 'cat',
      measurementMm: 20,
      stageId: 'afterFiveWeeks',
    })).toBeUndefined()

    expect(calculatePdr({
      examDateIso: '2026-09-01',
      groupId: 'cat',
      measurementMm: 20,
    })).toBeUndefined()
  })

  it('formats numbers and dates', () => {
    expect(getPdrGroupById('cat')?.label).toBe('Кошка')
    expect(addDaysToIsoDate('2026-09-01', 7)).toBe('2026-09-08')
    expect(formatPdrDate('2026-09-08')).toBe('08.09.2026')
    expect(formatPdrNumber(7.2128)).toBe('7.2')
  })
})
