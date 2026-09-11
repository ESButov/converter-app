export type EpiduralBlockUnit = 'percent' | 'cm';

export type EpiduralAnestheticId = 'lidocaine' | 'bupivacaine' | 'ropivacaine';

export type EpiduralAdjuvantId =
  | 'none'
  | 'morphine'
  | 'buprenorphine'
  | 'methadone'
  | 'dexmedetomidine'
  | 'medetomidine';

type DoseUnit = 'mg' | 'mcg';

export type EpiduralAnestheticDefinition = {
  id: EpiduralAnestheticId;
  label: string;
  concentrationsPercent: number[];
  defaultConcentrationPercent: number;
  maxSafeDoseMgKg: number;
  recommendedDose: string;
  comment: string;
};

export type EpiduralAdjuvantDefinition = {
  id: EpiduralAdjuvantId;
  label: string;
  doseUnit: DoseUnit;
  defaultDosePerKg: number;
  concentrationMgMl: number;
  hint: string;
};

type SpreadDescription = {
  boundary: string;
  blocked: string;
};

export type EpiduralNomogramInput = {
  weightKg: number;
  occipitoCoccygealLengthCm: number;
  blockValue: number;
  blockUnit: EpiduralBlockUnit;
  anestheticId: EpiduralAnestheticId;
  concentrationPercent: number;
  adjuvantId?: EpiduralAdjuvantId;
  adjuvantDosePerKg?: number;
};

export type EpiduralNomogramResult = {
  targetBlockPercent: number;
  targetBlockLengthCm: number;
  nomogramVolumeMl: number;
  anestheticVolumeMl: number;
  adjuvantVolumeMl: number;
  salineVolumeMl: number;
  finalSolutionVolumeMl: number;
  localAnestheticDoseMgKg: number;
  volumeMlKg: number;
  spread: SpreadDescription;
  anestheticComment: string;
  warnings: string[];
};

const NOMOGRAM_INTERCEPT = 0.14;
const NOMOGRAM_SLOPE = 4.16;
const MAX_FINAL_VOLUME_ML = 6;
const MAX_FINAL_VOLUME_ML_KG = 0.25;

export const epiduralAnesthetics: EpiduralAnestheticDefinition[] = [
  {
    id: 'lidocaine',
    label: 'Лидокаин',
    concentrationsPercent: [1, 2],
    defaultConcentrationPercent: 2,
    maxSafeDoseMgKg: 5,
    recommendedDose: '4-5 мг/кг',
    comment:
      'Быстрое начало действия, обычно 4-10 минут. Продолжительность чаще около 1-2 часов, моторный блок выражен сильнее и подходит для коротких процедур.',
  },
  {
    id: 'bupivacaine',
    label: 'Бупивакаин',
    concentrationsPercent: [0.25, 0.5],
    defaultConcentrationPercent: 0.5,
    maxSafeDoseMgKg: 2,
    recommendedDose: '0,5-1 мг/кг',
    comment:
      'Начало действия обычно 5-15 минут. Продолжительность примерно 2-6 часов; при передозировке выше риск кардиотоксичности, поэтому объем ограничивается дозой.',
  },
  {
    id: 'ropivacaine',
    label: 'Ропивакаин',
    concentrationsPercent: [0.2, 0.5, 0.75],
    defaultConcentrationPercent: 0.5,
    maxSafeDoseMgKg: 3,
    recommendedDose: '1-3 мг/кг',
    comment:
      'Начало действия обычно 7-15 минут. Продолжительность примерно 2-5 часов; моторный блок часто менее выражен, чем у бупивакаина.',
  },
];

export const epiduralAdjuvants: EpiduralAdjuvantDefinition[] = [
  {
    id: 'none',
    label: 'Без адъюванта',
    doseUnit: 'mg',
    defaultDosePerKg: 0,
    concentrationMgMl: 1,
    hint: '',
  },
  {
    id: 'morphine',
    label: 'Морфин',
    doseUnit: 'mg',
    defaultDosePerKg: 0.1,
    concentrationMgMl: 10,
    hint: 'Ориентир 0,05-0,2 мг/кг эпидурально, чаще 0,1 мг/кг.',
  },
  {
    id: 'buprenorphine',
    label: 'Бупренорфин',
    doseUnit: 'mg',
    defaultDosePerKg: 0.004,
    concentrationMgMl: 0.3,
    hint: 'Ориентир 0,004 мг/кг эпидурально.',
  },
  {
    id: 'methadone',
    label: 'Метадон',
    doseUnit: 'mg',
    defaultDosePerKg: 0.3,
    concentrationMgMl: 10,
    hint: 'Ориентир 0,1-0,3 мг/кг эпидурально.',
  },
  {
    id: 'dexmedetomidine',
    label: 'Дексмедетомидин',
    doseUnit: 'mcg',
    defaultDosePerKg: 4,
    concentrationMgMl: 0.5,
    hint: 'Ориентир 3-6 мкг/кг эпидурально.',
  },
  {
    id: 'medetomidine',
    label: 'Медетомидин',
    doseUnit: 'mcg',
    defaultDosePerKg: 5,
    concentrationMgMl: 1,
    hint: 'Ориентир 5-10 мкг/кг эпидурально.',
  },
];

export function getEpiduralAnestheticById(id: EpiduralAnestheticId) {
  return epiduralAnesthetics.find((item) => item.id === id) ?? epiduralAnesthetics[0];
}

export function getEpiduralAdjuvantById(id: EpiduralAdjuvantId) {
  return epiduralAdjuvants.find((item) => item.id === id) ?? epiduralAdjuvants[0];
}

export function percentToMgMl(concentrationPercent: number) {
  return concentrationPercent * 10;
}

export function calculateEpiduralNomogram(input: EpiduralNomogramInput): EpiduralNomogramResult | null {
  const {
    weightKg,
    occipitoCoccygealLengthCm,
    blockValue,
    blockUnit,
    anestheticId,
    concentrationPercent,
  } = input;

  if (
    !Number.isFinite(weightKg) ||
    !Number.isFinite(occipitoCoccygealLengthCm) ||
    !Number.isFinite(blockValue) ||
    !Number.isFinite(concentrationPercent) ||
    weightKg <= 0 ||
    occipitoCoccygealLengthCm <= 0 ||
    blockValue <= 0 ||
    concentrationPercent <= 0
  ) {
    return null;
  }

  const anesthetic = getEpiduralAnestheticById(anestheticId);
  const targetBlockLengthCm =
    blockUnit === 'percent' ? occipitoCoccygealLengthCm * (blockValue / 100) : blockValue;
  const targetBlockPercent = (targetBlockLengthCm / occipitoCoccygealLengthCm) * 100;
  const targetFraction = targetBlockPercent / 100;
  const warnings: string[] = [];

  if (targetFraction <= NOMOGRAM_INTERCEPT) {
    warnings.push('Желаемый блок ниже рабочей зоны номограммы; расчетный объем получается отрицательным.');
    return {
      targetBlockPercent,
      targetBlockLengthCm,
      nomogramVolumeMl: 0,
      anestheticVolumeMl: 0,
      adjuvantVolumeMl: 0,
      salineVolumeMl: 0,
      finalSolutionVolumeMl: 0,
      localAnestheticDoseMgKg: 0,
      volumeMlKg: 0,
      spread: describeEpiduralSpread(targetBlockPercent),
      anestheticComment: anesthetic.comment,
      warnings,
    };
  }

  const nomogramVolumeMl =
    occipitoCoccygealLengthCm * (targetFraction - NOMOGRAM_INTERCEPT) / NOMOGRAM_SLOPE;
  const adjuvant = getEpiduralAdjuvantById(input.adjuvantId ?? 'none');
  const adjuvantDosePerKg = input.adjuvantDosePerKg ?? adjuvant.defaultDosePerKg;
  const adjuvantVolumeMl =
    adjuvant.id === 'none'
      ? 0
      : calculateAdjuvantVolumeMl(weightKg, adjuvantDosePerKg, adjuvant);

  const concentrationMgMl = percentToMgMl(concentrationPercent);
  const maxAnestheticVolumeMl = (anesthetic.maxSafeDoseMgKg * weightKg) / concentrationMgMl;
  const availableForAnestheticMl = Math.max(nomogramVolumeMl - adjuvantVolumeMl, 0);
  const anestheticVolumeMl = Math.min(availableForAnestheticMl, maxAnestheticVolumeMl);
  const salineVolumeMl = Math.max(nomogramVolumeMl - adjuvantVolumeMl - anestheticVolumeMl, 0);
  const finalSolutionVolumeMl = anestheticVolumeMl + adjuvantVolumeMl + salineVolumeMl;
  const localAnestheticDoseMgKg = (anestheticVolumeMl * concentrationMgMl) / weightKg;
  const volumeMlKg = finalSolutionVolumeMl / weightKg;

  if (availableForAnestheticMl > maxAnestheticVolumeMl) {
    warnings.push(
      `Для выбранной концентрации объем ${anesthetic.label.toLowerCase()} ограничен безопасной дозой ${anesthetic.maxSafeDoseMgKg} мг/кг; остаток доведен натрия хлоридом 0,9%.`,
    );
  }

  if (adjuvantVolumeMl > nomogramVolumeMl) {
    warnings.push('Объем адъюванта превышает расчетный объем по номограмме; проверьте концентрацию и дозу.');
  }

  if (finalSolutionVolumeMl > MAX_FINAL_VOLUME_ML) {
    warnings.push(`Итоговый объем больше ${MAX_FINAL_VOLUME_ML} мл; для крупных и гигантских собак оцените риск краниального распространения.`);
  }

  if (volumeMlKg > MAX_FINAL_VOLUME_ML_KG) {
    warnings.push(`Итоговый объем больше ${MAX_FINAL_VOLUME_ML_KG} мл/кг; проверьте безопасность выбранного уровня блока.`);
  }

  if (targetBlockPercent > 70) {
    warnings.push('Высокий блок может затрагивать грудные сегменты; требуется мониторинг дыхания, давления и глубины седации.');
  }

  return {
    targetBlockPercent,
    targetBlockLengthCm,
    nomogramVolumeMl,
    anestheticVolumeMl,
    adjuvantVolumeMl,
    salineVolumeMl,
    finalSolutionVolumeMl,
    localAnestheticDoseMgKg,
    volumeMlKg,
    spread: describeEpiduralSpread(targetBlockPercent),
    anestheticComment: anesthetic.comment,
    warnings,
  };
}

export function formatEpiduralNumber(value: number, digits = 2) {
  if (!Number.isFinite(value)) {
    return '0';
  }

  return value.toLocaleString('ru-RU', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function calculateAdjuvantVolumeMl(
  weightKg: number,
  dosePerKg: number,
  adjuvant: EpiduralAdjuvantDefinition,
) {
  if (!Number.isFinite(dosePerKg) || dosePerKg <= 0) {
    return 0;
  }

  const totalDoseMg =
    adjuvant.doseUnit === 'mcg'
      ? (dosePerKg * weightKg) / 1000
      : dosePerKg * weightKg;

  return totalDoseMg / adjuvant.concentrationMgMl;
}

function describeEpiduralSpread(targetBlockPercent: number): SpreadDescription {
  if (targetBlockPercent < 30) {
    return {
      boundary: 'ниже 30% затылочно-копчиковой длины',
      blocked:
        'Ожидается каудальное распространение: промежность, хвост, тазовый канал; для тазовых конечностей эффект может быть неполным.',
    };
  }

  if (targetBlockPercent < 35) {
    return {
      boundary: 'примерно поясничный 4-5',
      blocked: 'Промежность, хвост, тазовые конечности, каудальная часть таза.',
    };
  }

  if (targetBlockPercent < 40) {
    return {
      boundary: 'примерно поясничный 2-3',
      blocked: 'Тазовые конечности, таз, промежность, каудальный отдел брюшной стенки.',
    };
  }

  if (targetBlockPercent < 45) {
    return {
      boundary: 'примерно поясничный 1',
      blocked: 'Тазовые конечности, таз, каудальная и средняя часть брюшной стенки.',
    };
  }

  if (targetBlockPercent < 50) {
    return {
      boundary: 'примерно грудной 12-13',
      blocked: 'Каудальная половина брюшной стенки, таз, тазовые конечности.',
    };
  }

  if (targetBlockPercent < 55) {
    return {
      boundary: 'примерно грудной 11-12',
      blocked: 'Каудальная и средняя брюшная стенка; возможен эффект на часть органов брюшной полости.',
    };
  }

  if (targetBlockPercent < 60) {
    return {
      boundary: 'примерно грудной 10-11',
      blocked: 'Средняя брюшная стенка, каудальные абдоминальные структуры, таз и тазовые конечности.',
    };
  }

  if (targetBlockPercent < 65) {
    return {
      boundary: 'примерно грудной 9-10',
      blocked: 'Брюшная стенка до среднего грудопоясничного уровня; возможен блок висцеральной боли каудальной брюшной полости.',
    };
  }

  if (targetBlockPercent < 70) {
    return {
      boundary: 'примерно грудной 7-8',
      blocked: 'Широкий абдоминальный блок: брюшная стенка, таз, тазовые конечности; возможна симпатическая блокада.',
    };
  }

  return {
    boundary: 'примерно грудной 5-6 и выше',
    blocked:
      'Высокое краниальное распространение: значимая часть брюшной стенки и грудопоясничных сегментов; выше риск гипотензии и дыхательных эффектов.',
  };
}
