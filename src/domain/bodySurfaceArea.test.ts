import { describe, expect, it } from 'vitest'
import {
  bodySurfaceAreaCoefficientByKey,
  bodySurfaceAreaCoefficients,
  calculateBodySurfaceArea,
} from './bodySurfaceArea'

describe('bodySurfaceArea', () => {
  it('stores simplified species coefficient objects', () => {
    expect(bodySurfaceAreaCoefficients[0]).toEqual({
      key: 'dog',
      speciesRu: 'Собака',
      speciesEn: 'Dog',
      label: 'Собака',
      coefficientKg: 0.101,
    })

    expect(bodySurfaceAreaCoefficientByKey.cat.speciesRu).toBe('Кошка')
    expect(bodySurfaceAreaCoefficientByKey.cat.coefficientKg).toBe(0.1)
  })

  it('calculates BSA from kg coefficient and body weight', () => {
    expect(calculateBodySurfaceArea(10, 0.101)).toBeCloseTo(0.469, 3)
  })
})
