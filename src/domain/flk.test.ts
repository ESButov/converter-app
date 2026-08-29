import { describe, expect, it } from 'vitest'
import {
  calculateFlk,
  flkDrugById,
  formatFlkNumber,
  getFlkDoseHint,
  getFlkDurationHours,
} from './flk'

describe('flk', () => {
  it('calculates FLK syringe composition from the source workbook defaults', () => {
    const result = calculateFlk({
      durationHours: 3,
      fentanylRateMcgKgMin: 0.0133333,
      ketamineRateMcgKgMin: 10,
      lidocaineRateMcgKgMin: 16.6667,
      syringeSizeMl: 20,
      weightKg: 34.5,
    })

    expect(result).toBeDefined()
    expect(result?.drugs[0]?.totalDoseMg).toBeCloseTo(0.0828)
    expect(result?.drugs[0]?.volumeMl).toBeCloseTo(1.656)
    expect(result?.drugs[1]?.volumeMl).toBeCloseTo(5.175)
    expect(result?.drugs[2]?.volumeMl).toBeCloseTo(0.621)
    expect(result?.drugVolumeMl).toBeCloseTo(7.452)
    expect(result?.salineVolumeMl).toBeCloseTo(12.548)
    expect(result?.finalRateMlHour).toBeCloseTo(6.6667)
  })

  it('includes ketamine in total drug volume and flags high rates', () => {
    const result = calculateFlk({
      durationHours: 3,
      fentanylRateMcgKgMin: 0.1,
      ketamineRateMcgKgMin: 33.3333,
      lidocaineRateMcgKgMin: 66.6667,
      syringeSizeMl: 20,
      weightKg: 10,
    })

    expect(result?.drugVolumeMl).toBeCloseTo(10 * 0.006 * 3 / 0.05 + 10 * 4 * 3 / 20 + 10 * 2 * 3 / 100)
    expect(result?.drugs.every((drug) => drug.isHighRate)).toBe(true)
  })

  it('uses hours and minutes and selected lidocaine concentration', () => {
    const result = calculateFlk({
      durationHours: 1,
      durationMinutes: 30,
      ketamineRateMcgKgMin: 10,
      lidocaineConcentrationMgMl: 100,
      lidocaineRateMcgKgMin: 10,
      syringeSizeMl: 20,
      weightKg: 10,
    })

    expect(getFlkDurationHours(1, 30)).toBe(1.5)
    expect(result?.totalDurationHours).toBe(1.5)
    expect(result?.drugs[1]?.volumeMl).toBeCloseTo(0.09)
    expect(result?.drugs[2]?.volumeMl).toBeCloseTo(0.09)
    expect(result?.finalRateMlHour).toBeCloseTo(13.3333)
  })

  it('formats numbers without trailing zeroes', () => {
    expect(formatFlkNumber(6.6667)).toBe('6.67')
    expect(formatFlkNumber(0.0828, 4)).toBe('0.0828')
    expect(formatFlkNumber(20)).toBe('20')
  })

  it('shows species-specific lidocaine dose hints', () => {
    const lidocaine = flkDrugById.get('lidocaine')

    expect(lidocaine).toBeDefined()
    expect(getFlkDoseHint(lidocaine!, 'cat')).toBe('Кошка: 0.6-1.8 мг/кг/ч (10-30 мкг/кг/мин)')
    expect(getFlkDoseHint(lidocaine!, 'dog')).toBe('Собака: 1.2-4.8 мг/кг/ч (20-80 мкг/кг/мин)')
  })
})
