import { describe, expect, it } from 'vitest'
import {
  calculateAlbuminReplacement,
  calculateDonorBloodCollection,
  calculatePlasmaTransfusion,
  calculatePlateletTransfusion,
  calculateRedCellTransfusion,
  formatTransfusionNumber,
} from './bloodTransfusion'

describe('bloodTransfusion', () => {
  it('calculates red cell component volume for dogs through fixed BV', () => {
    expect(calculateRedCellTransfusion({
      currentPcv: 15,
      plannedVolumeMl: 100,
      productPcv: 40,
      species: 'dog',
      targetPcv: 25,
      weightKg: 10,
    })).toEqual({
      bloodVolumeMl: 900,
      bloodVolumeMlKg: 90,
      expectedPcv: 25,
      pcvDelta: 10,
      plannedExpectedPcv: 19.4,
      plannedPcvIncrease: 4.4,
      volumeMl: 225,
      volumeMlKg: 22.5,
    })
  })

  it('calculates red cell component volume for cats through fixed BV', () => {
    expect(calculateRedCellTransfusion({
      currentPcv: 12,
      productPcv: 60,
      species: 'cat',
      targetPcv: 22,
      weightKg: 4,
    })).toMatchObject({
      bloodVolumeMl: 240,
      bloodVolumeMlKg: 60,
      expectedPcv: 22,
      volumeMl: 40,
      volumeMlKg: 10,
    })
  })

  it('calculates plasma dose ranges by species', () => {
    expect(calculatePlasmaTransfusion('dog', 20)).toEqual({
      doseMlKg: {
        min: 10,
        max: 20,
      },
      volumeMl: {
        min: 200,
        max: 400,
      },
    })

    expect(calculatePlasmaTransfusion('cat', 4)).toEqual({
      doseMlKg: {
        min: 6,
        max: 10,
      },
      volumeMl: {
        min: 24,
        max: 40,
      },
    })
  })

  it('calculates platelet unit dose', () => {
    expect(calculatePlateletTransfusion(23)).toEqual({
      roundedUnits: 3,
      units: 2.3,
    })
  })

  it('calculates donor blood collection limits by species', () => {
    expect(calculateDonorBloodCollection('dog', 40)).toEqual({
      doseMlKg: {
        min: 15,
        max: 15,
      },
      isBelowRecommendedWeight: false,
      recommendedWeightKg: 25,
      volumeMl: {
        min: 600,
        max: 600,
      },
    })

    expect(calculateDonorBloodCollection('cat', 10)).toEqual({
      doseMlKg: {
        min: 10,
        max: 12,
      },
      isBelowRecommendedWeight: false,
      recommendedWeightKg: 4.5,
      volumeMl: {
        min: 100,
        max: 120,
      },
    })
  })

  it('calculates albumin replacement volume and speed', () => {
    expect(calculateAlbuminReplacement({
      currentAlbuminGL: 20,
      targetAlbuminGL: 25,
      weightKg: 10,
    })).toEqual({
      albuminDeltaGL: 5,
      dilutionVolume20PercentMl: 75,
      infusionTimeHours: 12,
      speed10PercentMlHour: 12.5,
      speed20PercentDilutedMlHour: 12.5,
      speed20PercentMlHour: 6.25,
      volume10PercentMl: 150,
      volume20PercentMl: 75,
    })
  })

  it('formats helper values', () => {
    expect(formatTransfusionNumber(112.5)).toBe('112.5')
    expect(formatTransfusionNumber(40)).toBe('40')
  })
})
