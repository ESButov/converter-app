import { describe, expect, it } from 'vitest'
import {
  calculateEnteralNutrition,
  formatEnteralNumber,
  getDerCoefficientOptions,
  getEnteralNeed,
  getEnteralNeedsForSpecies,
} from './enteralNutrition'

describe('enteralNutrition', () => {
  it('calculates RER and DER for a dog fixed coefficient need', () => {
    expect(calculateEnteralNutrition({
      derCoefficient: 1.6,
      foodCaloriesKcalPer100g: 200,
      needId: 'dogAdultNeutered',
      species: 'dog',
      weightKg: 10,
    })).toMatchObject({
      derCoefficient: 1.6,
      derKcalDay: 629.8,
      foodMassDerGDay: 314.9,
      foodMassRerGDay: 196.8,
      rerFactor: 70,
      rerKcalDay: 393.6,
    })
  })

  it('calculates RER and DER for a cat range coefficient need', () => {
    expect(calculateEnteralNutrition({
      derCoefficient: 1.5,
      foodCaloriesKcalPer100g: 120,
      needId: 'catAdultIntact',
      species: 'cat',
      weightKg: 4,
    })).toMatchObject({
      derCoefficient: 1.5,
      derKcalDay: 424.3,
      foodMassDerGDay: 353.6,
      foodMassRerGDay: 235.7,
      rerFactor: 100,
      rerKcalDay: 282.8,
    })
  })

  it('orders common needs before species-specific needs', () => {
    expect(getEnteralNeedsForSpecies('dog').map((need) => need.id).slice(0, 5)).toEqual([
      'refeedingPrevention',
      'hospitalizedPatient',
      'severeTraumaSurgeryCancer',
      'severeInfectionSepsis',
      'burns',
    ])
  })

  it('builds DER coefficient options with a 0.05 step where required', () => {
    const need = getEnteralNeed('severeTraumaSurgeryCancer', 'dog')

    expect(need).toBeDefined()
    expect(need === undefined ? [] : getDerCoefficientOptions(need.coefficient)).toEqual([
      1.25,
      1.3,
      1.35,
      1.4,
      1.45,
      1.5,
    ])
  })

  it('calculates safe refeeding NEP for a cat', () => {
    expect(calculateEnteralNutrition({
      derCoefficient: 1,
      feedType: 'wet',
      foodCaloriesKcalPer100g: 100,
      needId: 'refeedingPrevention',
      species: 'cat',
      therapyDay: 'day1',
      weightKg: 4,
    })?.refeeding).toMatchObject({
      calculatedNepRateMlHour: 9.4,
      dayFactorPercent: 20,
      foodMassGDay: 56.6,
      isRateSafe: true,
      maxSafeDailyVolumeMl: 288,
      maxSafeRateMlHour: 12,
      totalMixtureMlDay: 226.3,
      waterVolumeMlDay: 169.7,
    })
  })

  it('calculates bolus supplement when refeeding NEP rate is unsafe', () => {
    expect(calculateEnteralNutrition({
      derCoefficient: 1,
      feedType: 'wet',
      foodCaloriesKcalPer100g: 100,
      needId: 'refeedingPrevention',
      species: 'dog',
      therapyDay: 'day3',
      weightKg: 10,
    })?.refeeding).toMatchObject({
      bolusEvery4HoursMl: 37.5,
      bolusEvery6HoursMl: 56.2,
      calculatedNepRateMlHour: 39.4,
      dayFactorPercent: 60,
      foodMassGDay: 236.2,
      isRateSafe: false,
      maxSafeDailyVolumeMl: 720,
      maxSafeRateMlHour: 30,
      supplementalBolusVolumeMlDay: 224.7,
      totalMixtureMlDay: 944.7,
      waterVolumeMlDay: 708.6,
    })
  })

  it('filters needs by species and formats numbers', () => {
    expect(getEnteralNeedsForSpecies('dog').some((need) => need.id === 'catAdultIntact')).toBe(false)
    expect(getEnteralNeedsForSpecies('cat').some((need) => need.id === 'dogAdultIntact')).toBe(false)
    expect(formatEnteralNumber(1.5, 2)).toBe('1.5')
    expect(formatEnteralNumber(100)).toBe('100')
  })
})
