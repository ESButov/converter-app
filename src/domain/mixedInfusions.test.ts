import { describe, expect, it } from 'vitest'
import {
  calculateMixedInfusion,
  calculateMixedInfusionDrugVolume,
  getMixedInfusionDoseHint,
  getMixedInfusionDurationHours,
  mixedInfusionDrugById,
  resolveMixedInfusionParameters,
} from './mixedInfusions'

describe('mixed infusion calculations', () => {
  it('converts hours and minutes to total duration', () => {
    expect(getMixedInfusionDurationHours(1, 30)).toBe(1.5)
    expect(getMixedInfusionDurationHours(0, 0)).toBeUndefined()
  })

  it('calculates drug volumes and saline volume for a shared syringe', () => {
    const result = calculateMixedInfusion({
      durationHours: 1,
      durationMinutes: 0,
      drugs: [
        { drugId: 'l-2', dose: 20 },
        { drugId: 'cer', dose: 0.1 },
      ],
      syringeSizeMl: 20,
      weightKg: 10,
    }, 'dog')

    expect(result?.drugs[0]?.volumeMl).toBeCloseTo(0.6)
    expect(result?.drugs[1]?.volumeMl).toBeCloseTo(0.2)
    expect(result?.drugVolumeMl).toBeCloseTo(0.8)
    expect(result?.salineVolumeMl).toBeCloseTo(19.2)
    expect(result?.finalRateMlHour).toBeCloseTo(20)
    expect(result?.syringeSizeMl).toBeCloseTo(20)
    expect(result?.totalDurationHours).toBeCloseTo(1)
    expect(result?.isSyringeVolumeEnough).toBe(true)
  })

  it('resolves duration from syringe size and infusion rate', () => {
    const parameters = resolveMixedInfusionParameters({
      drugs: [],
      infusionRateMlHour: 5,
      syringeSizeMl: 20,
    })

    expect(parameters?.basis).toBe('syringeRate')
    expect(parameters?.totalDurationHours).toBeCloseTo(4)
    expect(parameters?.syringeSizeMl).toBeCloseTo(20)
    expect(parameters?.finalRateMlHour).toBeCloseTo(5)
  })

  it('resolves syringe size from duration and infusion rate', () => {
    const parameters = resolveMixedInfusionParameters({
      durationHours: 2,
      drugs: [],
      infusionRateMlHour: 6,
    })

    expect(parameters?.basis).toBe('durationRate')
    expect(parameters?.totalDurationHours).toBeCloseTo(2)
    expect(parameters?.syringeSizeMl).toBeCloseTo(12)
    expect(parameters?.finalRateMlHour).toBeCloseTo(6)
  })

  it('uses old CalcForm concentration model for minute-based drugs', () => {
    const lidocaine = mixedInfusionDrugById.get('l-10')

    expect(lidocaine).toBeDefined()
    expect(calculateMixedInfusionDrugVolume(lidocaine!, 20, 10, 1)).toBeCloseTo(0.12)
  })

  it('calculates FLK drugs inside mixed infusions', () => {
    const result = calculateMixedInfusion({
      durationHours: 3,
      drugs: [
        { drugId: 'fentanyl', dose: 0.02 },
        { drugId: 'l-2', dose: 17 },
        { drugId: 'ketamine', dose: 10 },
      ],
      syringeSizeMl: 20,
      weightKg: 34.5,
    }, 'dog')

    expect(result?.drugs[0]?.volumeMl).toBeCloseTo(2.484)
    expect(result?.drugs[1]?.volumeMl).toBeCloseTo(5.2785)
    expect(result?.drugs[2]?.volumeMl).toBeCloseTo(0.621)
    expect(result?.drugVolumeMl).toBeCloseTo(8.3835)
    expect(result?.salineVolumeMl).toBeCloseTo(11.6165)
    expect(result?.finalRateMlHour).toBeCloseTo(6.6667)
    expect(result?.drugs[0]?.loadingDoses[0]?.volumeMl).toBeCloseTo(1.38)
    expect(result?.drugs[1]?.loadingDoses[2]?.volumeMl).toBeCloseTo(1.725)
    expect(result?.drugs[2]?.loadingDoses[1]?.volumeMl).toBeCloseTo(0.1725)
  })

  it('marks FLK high rates separately from the dose range', () => {
    const result = calculateMixedInfusion({
      durationHours: 1,
      drugs: [
        { drugId: 'fentanyl', dose: 0.09 },
        { drugId: 'ketamine', dose: 10 },
      ],
      syringeSizeMl: 20,
      weightKg: 10,
    }, 'dog')

    expect(result?.drugs[0]?.doseStatus).toBe('ok')
    expect(result?.drugs[0]?.isHighRate).toBe(true)
    expect(result?.drugs[1]?.isHighRate).toBe(false)
  })

  it('requires at least two filled drugs', () => {
    const result = calculateMixedInfusion({
      durationHours: 1,
      drugs: [
        { drugId: 'l-2', dose: 20 },
      ],
      syringeSizeMl: 20,
      weightKg: 10,
    }, 'dog')

    expect(result).toBeUndefined()
  })

  it('marks doses outside the selected species range', () => {
    const result = calculateMixedInfusion({
      durationHours: 1,
      drugs: [
        { drugId: 'l-2', dose: 10 },
        { drugId: 'ad', dose: 0.3 },
      ],
      syringeSizeMl: 20,
      weightKg: 10,
    }, 'dog')

    expect(result?.drugs[0]?.doseStatus).toBe('below')
    expect(result?.drugs[1]?.doseStatus).toBe('above')
  })

  it('shows animal-specific lidocaine dose hints', () => {
    const lidocaine = mixedInfusionDrugById.get('l-2')

    expect(lidocaine).toBeDefined()
    expect(getMixedInfusionDoseHint(lidocaine!, 'cat')).toBe('Кошка: 0.6-1.8 мг/кг/ч (10-30 мкг/кг/мин)')
    expect(getMixedInfusionDoseHint(lidocaine!, 'dog')).toBe('Собака: 1.2-4.8 мг/кг/ч (20-80 мкг/кг/мин)')
    expect(getMixedInfusionDoseHint(mixedInfusionDrugById.get('fentanyl')!, 'dog')).toBe('Собака: 0.0012-0.008 мг/кг/ч (0.02-0.10 мкг/кг/мин)')
    expect(getMixedInfusionDoseHint(mixedInfusionDrugById.get('ketamine')!, 'dog')).toBe('Собака: 0.12-1.2 мг/кг/ч (2-20 мкг/кг/мин)')
  })
})
