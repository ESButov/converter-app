import { describe, expect, it } from 'vitest'
import { calculateEcg, formatEcgNumber } from './ecg'

describe('ecg', () => {
  it('calculates ECG values from the photographed example', () => {
    expect(calculateEcg({
      pAmplitudeMm: 2,
      pDurationMm: 2,
      qAmplitudeMm: 2,
      qrsDurationMm: 3,
      qtIntervalMm: 11,
      rAmplitudeMm: 21,
      rrIntervalMm: 20,
      speedMmSec: 50,
      stDeviationMm: 1,
      tAmplitudeMm: 2,
      voltageMmPerMv: 10,
    })).toMatchObject({
      heartRateBpm: 150,
      mvPerMm: 0.1,
      msPerMm: 20,
      pAmplitudeMv: 0.2,
      pDurationMs: 40,
      qAmplitudeMv: 0.2,
      qrsDurationMs: 60,
      qtIntervalMs: 220,
      rAmplitudeMv: 2.1,
      stDeviationMv: 0.1,
      tAmplitudeMv: 0.2,
    })
  })

  it('changes mm value when speed or voltage calibration changes', () => {
    expect(calculateEcg({
      pDurationMm: 2,
      rAmplitudeMm: 21,
      speedMmSec: 25,
      voltageMmPerMv: 20,
    })).toMatchObject({
      mvPerMm: 0.05,
      msPerMm: 40,
      pDurationMs: 80,
      rAmplitudeMv: 1.05,
    })
  })

  it('does not calculate without valid calibration and formats values', () => {
    expect(calculateEcg({ speedMmSec: 50 })).toBeUndefined()
    expect(formatEcgNumber(2.10, 2)).toBe('2.1')
    expect(formatEcgNumber(150, 0)).toBe('150')
  })
})
