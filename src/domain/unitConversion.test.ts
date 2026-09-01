import { describe, expect, it } from 'vitest'
import {
  conversionMetrics,
  convertUnitValue,
  formatConvertedValue,
  getConversionMetricById,
  getConversionMetricsByCategory,
} from './unitConversion'

describe('unitConversion', () => {
  it('converts common general units', () => {
    expect(convertUnitValue({
      fromUnitId: 'kg',
      metricId: 'mass',
      toUnitId: 'g',
      value: 2.5,
    })?.value).toBeCloseTo(2500)

    expect(convertUnitValue({
      fromUnitId: 'celsius',
      metricId: 'temperature',
      toUnitId: 'fahrenheit',
      value: 38,
    })?.value).toBeCloseTo(100.4)
  })

  it('converts medication concentrations', () => {
    expect(convertUnitValue({
      fromUnitId: 'percent',
      metricId: 'solution_percent',
      toUnitId: 'mg_ml',
      value: 2,
    })?.value).toBeCloseTo(20)

    expect(convertUnitValue({
      fromUnitId: 'kcl_percent',
      metricId: 'kcl',
      toUnitId: 'kcl_meq_ml',
      value: 4,
    })?.value).toBeCloseTo(0.5366)

    expect(convertUnitValue({
      fromUnitId: 'nacl_percent',
      metricId: 'nacl',
      toUnitId: 'na_mmol_l',
      value: 0.9,
    })?.value).toBeCloseTo(154)
  })

  it('converts hematology and blood biochemistry values', () => {
    expect(convertUnitValue({
      fromUnitId: 'hematocrit_percent',
      metricId: 'hematocrit',
      toUnitId: 'hematocrit_l_l',
      value: 35,
    })?.value).toBeCloseTo(0.35)

    expect(convertUnitValue({
      fromUnitId: 'glucose_mg_dl',
      metricId: 'blood_glucose',
      toUnitId: 'glucose_mmol_l',
      value: 100,
    })?.value).toBeCloseTo(5.55)

    expect(convertUnitValue({
      fromUnitId: 'creatinine_mg_dl',
      metricId: 'creatinine',
      toUnitId: 'creatinine_mcmol_l',
      value: 1.3,
    })?.value).toBeCloseTo(114.92)
  })

  it('uses Russian name for urine protein to creatinine ratio and does not include T3', () => {
    expect(getConversionMetricById('urine_protein_creatinine_ratio')?.label).toBe(
      'Соотношение белок/креатинин в моче',
    )
    expect(conversionMetrics.some((metric) => String(metric.label) === 'Т3')).toBe(false)
    expect(conversionMetrics.some((metric) => String(metric.label) === 'Длина')).toBe(false)
    expect(conversionMetrics.some((metric) => String(metric.label) === 'Давление')).toBe(false)
  })

  it('filters metrics by category and formats converted values', () => {
    expect(getConversionMetricsByCategory('biochemistry').map((metric) => metric.id)).toContain(
      'blood_glucose',
    )
    expect(formatConvertedValue(5.55)).toBe('5.55')
    expect(formatConvertedValue(0.5365526)).toBe('0.5366')
  })
})
