import { describe, expect, it } from 'vitest'
import {
  calculatePep,
  calculatePepBasalEnergy,
  formatPepNumber,
  getPepProtocol,
} from './pep'

describe('pep', () => {
  it('matches the workbook values from the PEP more than 2 kg sheet', () => {
    const result = calculatePep({
      aminoOsmolarityMosmL: 1021,
      aminoPotassiumMmolL: 0,
      aminoSolutionPercent: 10,
      carbohydrateEnergyPercent: 50,
      dehydrationPercent: 0,
      diarrheaLossMlKgDay: 0,
      energyFactor: 1.2,
      feverLossMlKgDay: 0,
      glucoseSolutionPercent: 20,
      insulinGlucoseGPerUnit: 0,
      intestinalLossMlKgDay: 0,
      lipidOsmolarityMosmL: 380,
      lipidSolutionPercent: 20,
      pepPercent: 25,
      proteinGPer100Kcal: 6,
      respiratoryLossMlKgDay: 0,
      targetPotassiumMmolL: 0,
      ventilationLossMlKgDay: 0,
      vomitingLossMlKgDay: 0,
      weightKg: 4.7,
    })

    expect(result?.protocol).toBe('over2kg')
    expect(result?.basalEnergyKcalDay).toBeCloseTo(223.4454)
    expect(result?.illEnergyKcalDay).toBeCloseTo(268.1345)
    expect(result?.pepEnergyKcalDay).toBeCloseTo(67.0336)
    expect(result?.proteinGramsDay).toBeCloseTo(4.022)
    expect(result?.aminoVolumeMlDay).toBeCloseTo(40.2202)
    expect(result?.glucoseVolumeMlDay).toBeCloseTo(49.2894)
    expect(result?.glucoseGramsDay).toBeCloseTo(9.8579)
    expect(result?.lipidVolumeMlDay).toBeCloseTo(16.7584)
    expect(result?.lipidGramsDay).toBeCloseTo(3.3517)
    expect(result?.totalPepVolumeMlDay).toBeCloseTo(106.268)
    expect(result?.pepRateMlHour).toBeCloseTo(4.4278)
    expect(result?.theoreticalOsmolarityMosmL).toBeCloseTo(961.1948)
    expect(result?.totalFluidMlDay).toBeCloseTo(211)
    expect(result?.additionalFluidMlDay).toBeCloseTo(104.732)
  })

  it('uses the less than or equal to 2 kg basal energy formula', () => {
    const result = calculatePep({
      energyFactor: 1,
      glucoseSolutionPercent: 40,
      lipidSolutionPercent: 10,
      pepPercent: 15,
      weightKg: 1.6,
    })

    expect(getPepProtocol(1.6)).toBe('under2kg')
    expect(calculatePepBasalEnergy(1.6)).toBeCloseTo(118)
    expect(result?.protocol).toBe('under2kg')
    expect(result?.basalEnergyKcalDay).toBeCloseTo(118)
    expect(result?.pepEnergyKcalDay).toBeCloseTo(17.7)
    expect(result?.aminoVolumeMlDay).toBeCloseTo(10.62)
    expect(result?.glucoseVolumeMlDay).toBeCloseTo(4.9456)
    expect(result?.lipidVolumeMlDay).toBeCloseTo(6.726)
    expect(result?.totalPepVolumeMlDay).toBeCloseTo(22.2916)
  })

  it('calculates insulin only when grams per unit are provided', () => {
    const result = calculatePep({
      insulinGlucoseGPerUnit: 5,
      weightKg: 4.7,
    })

    expect(result?.insulinUnitsDay).toBeCloseTo(1.9716)
    expect(result?.insulinUnits12h).toBeCloseTo(0.9858)
  })

  it('formats numbers without trailing zeroes', () => {
    expect(formatPepNumber(106.268)).toBe('106.27')
    expect(formatPepNumber(20)).toBe('20')
    expect(formatPepNumber(0.9858, 3)).toBe('0.986')
  })
})
