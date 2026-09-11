import { describe, expect, it } from 'vitest';
import { calculateEpiduralNomogram } from './epiduralNomogram';

describe('calculateEpiduralNomogram', () => {
  it('calculates nomogram volume and limits lidocaine by safe dose', () => {
    const result = calculateEpiduralNomogram({
      weightKg: 20,
      occipitoCoccygealLengthCm: 60,
      blockValue: 60,
      blockUnit: 'percent',
      anestheticId: 'lidocaine',
      concentrationPercent: 2,
      adjuvantId: 'none',
    });

    expect(result).not.toBeNull();
    expect(result?.nomogramVolumeMl).toBeCloseTo(6.63, 2);
    expect(result?.anestheticVolumeMl).toBeCloseTo(5, 2);
    expect(result?.salineVolumeMl).toBeCloseTo(1.63, 2);
    expect(result?.localAnestheticDoseMgKg).toBeCloseTo(5, 2);
    expect(result?.warnings.some((warning) => warning.includes('ограничен безопасной дозой'))).toBe(true);
  });

  it('uses block length in centimeters and subtracts adjuvant volume from final volume', () => {
    const result = calculateEpiduralNomogram({
      weightKg: 25,
      occipitoCoccygealLengthCm: 60,
      blockValue: 42,
      blockUnit: 'cm',
      anestheticId: 'bupivacaine',
      concentrationPercent: 0.5,
      adjuvantId: 'morphine',
      adjuvantDosePerKg: 0.1,
    });

    expect(result).not.toBeNull();
    expect(result?.targetBlockPercent).toBeCloseTo(70, 2);
    expect(result?.nomogramVolumeMl).toBeCloseTo(8.08, 2);
    expect(result?.adjuvantVolumeMl).toBeCloseTo(0.25, 2);
    expect(result?.anestheticVolumeMl).toBeCloseTo(7.83, 2);
    expect(result?.salineVolumeMl).toBeCloseTo(0, 2);
    expect(result?.finalSolutionVolumeMl).toBeCloseTo(8.08, 2);
  });
});
