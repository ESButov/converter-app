export type ConversionCategory = {
  id: string
  label: string
}

export type ConversionUnit = {
  fromBase: (value: number) => number
  id: string
  label: string
  toBase: (value: number) => number
}

export type ConversionMetric = {
  categoryId: string
  defaultFromUnitId: string
  defaultToUnitId: string
  id: string
  label: string
  units: readonly ConversionUnit[]
}

export type UnitConversionInput = {
  fromUnitId: string
  metricId: string
  toUnitId: string
  value?: number
}

export type UnitConversionResult = {
  fromUnit: ConversionUnit
  metric: ConversionMetric
  toUnit: ConversionUnit
  value: number
}

export const conversionCategories = [
  {
    id: 'general',
    label: 'Общие единицы',
  },
  {
    id: 'concentrations',
    label: 'Концентрации препаратов и растворов',
  },
  {
    id: 'hematology',
    label: 'Гематология',
  },
  {
    id: 'biochemistry',
    label: 'Биохимия крови',
  },
  {
    id: 'hormones',
    label: 'Гормоны и специальные показатели',
  },
] as const satisfies readonly ConversionCategory[]

const linearUnit = (
  id: string,
  label: string,
  toBaseFactor: number,
): ConversionUnit => ({
  fromBase: (value) => value / toBaseFactor,
  id,
  label,
  toBase: (value) => value * toBaseFactor,
})

const celsiusUnit: ConversionUnit = {
  fromBase: (value) => value,
  id: 'celsius',
  label: '°C',
  toBase: (value) => value,
}

const fahrenheitUnit: ConversionUnit = {
  fromBase: (value) => value * 9 / 5 + 32,
  id: 'fahrenheit',
  label: '°F',
  toBase: (value) => (value - 32) * 5 / 9,
}

export const conversionMetrics = [
  {
    categoryId: 'general',
    defaultFromUnitId: 'kg',
    defaultToUnitId: 'g',
    id: 'mass',
    label: 'Масса',
    units: [
      linearUnit('kg', 'кг', 1000),
      linearUnit('g', 'г', 1),
      linearUnit('mg', 'мг', 0.001),
      linearUnit('mcg', 'мкг', 0.000001),
      linearUnit('lb', 'lb', 453.59237),
    ],
  },
  {
    categoryId: 'general',
    defaultFromUnitId: 'l',
    defaultToUnitId: 'ml',
    id: 'volume',
    label: 'Объем',
    units: [
      linearUnit('l', 'л', 1000),
      linearUnit('ml', 'мл', 1),
      linearUnit('mcl', 'мкл', 0.001),
    ],
  },
  {
    categoryId: 'general',
    defaultFromUnitId: 'celsius',
    defaultToUnitId: 'fahrenheit',
    id: 'temperature',
    label: 'Температура',
    units: [
      celsiusUnit,
      fahrenheitUnit,
    ],
  },
  {
    categoryId: 'general',
    defaultFromUnitId: 'kcal',
    defaultToUnitId: 'kj',
    id: 'energy',
    label: 'Энергия',
    units: [
      linearUnit('kcal', 'ккал', 4.184),
      linearUnit('kj', 'кДж', 1),
    ],
  },
  {
    categoryId: 'general',
    defaultFromUnitId: 'ml_h',
    defaultToUnitId: 'ml_min',
    id: 'volume_rate',
    label: 'Объемная скорость',
    units: [
      linearUnit('ml_h', 'мл/ч', 1),
      linearUnit('ml_min', 'мл/мин', 60),
      linearUnit('ml_day', 'мл/сут', 1 / 24),
      linearUnit('l_h', 'л/ч', 1000),
    ],
  },
  {
    categoryId: 'general',
    defaultFromUnitId: 'ml_kg_h',
    defaultToUnitId: 'ml_kg_day',
    id: 'weight_volume_rate',
    label: 'Скорость на массу',
    units: [
      linearUnit('ml_kg_h', 'мл/кг/ч', 1),
      linearUnit('ml_kg_day', 'мл/кг/сут', 1 / 24),
    ],
  },
  {
    categoryId: 'general',
    defaultFromUnitId: 'mcg_kg_min',
    defaultToUnitId: 'mg_kg_h',
    id: 'dose_rate',
    label: 'Доза на массу/время',
    units: [
      linearUnit('mcg_kg_min', 'мкг/кг/мин', 0.06),
      linearUnit('mcg_kg_h', 'мкг/кг/ч', 0.001),
      linearUnit('mg_kg_min', 'мг/кг/мин', 60),
      linearUnit('mg_kg_h', 'мг/кг/ч', 1),
    ],
  },
  {
    categoryId: 'concentrations',
    defaultFromUnitId: 'percent',
    defaultToUnitId: 'mg_ml',
    id: 'solution_percent',
    label: 'Концентрация раствора',
    units: [
      linearUnit('percent', '%', 10),
      linearUnit('mg_ml', 'мг/мл', 1),
      linearUnit('mcg_ml', 'мкг/мл', 0.001),
      linearUnit('g_l', 'г/л', 1),
      linearUnit('mg_l', 'мг/л', 0.001),
    ],
  },
  {
    categoryId: 'concentrations',
    defaultFromUnitId: 'glucose_percent',
    defaultToUnitId: 'g_ml',
    id: 'glucose_solution',
    label: 'Глюкоза',
    units: [
      linearUnit('glucose_percent', '%', 0.01),
      linearUnit('g_ml', 'г/мл', 1),
      linearUnit('mg_ml_glucose', 'мг/мл', 0.001),
    ],
  },
  {
    categoryId: 'concentrations',
    defaultFromUnitId: 'kcl_percent',
    defaultToUnitId: 'kcl_meq_ml',
    id: 'kcl',
    label: 'KCl',
    units: [
      linearUnit('kcl_percent', '%', 10 / 74.55),
      linearUnit('kcl_meq_ml', 'mEq/мл', 1),
      linearUnit('kcl_mmol_ml', 'mmol/мл', 1),
    ],
  },
  {
    categoryId: 'concentrations',
    defaultFromUnitId: 'nacl_percent',
    defaultToUnitId: 'na_mmol_l',
    id: 'nacl',
    label: 'NaCl -> Na+',
    units: [
      linearUnit('nacl_percent', '% NaCl', 10000 / 58.44),
      linearUnit('na_mmol_l', 'Na ммоль/л', 1),
      linearUnit('na_meq_l', 'Na mEq/л', 1),
    ],
  },
  {
    categoryId: 'concentrations',
    defaultFromUnitId: 'nahco3_percent',
    defaultToUnitId: 'nahco3_meq_ml',
    id: 'nahco3',
    label: 'NaHCO3',
    units: [
      linearUnit('nahco3_percent', '%', 10 / 84.01),
      linearUnit('nahco3_meq_ml', 'mEq/мл', 1),
      linearUnit('nahco3_mmol_ml', 'mmol/мл', 1),
    ],
  },
  {
    categoryId: 'concentrations',
    defaultFromUnitId: 'meq_monovalent',
    defaultToUnitId: 'mmol_monovalent',
    id: 'meq_mmol_monovalent',
    label: 'mEq <-> mmol, валентность 1',
    units: [
      linearUnit('meq_monovalent', 'mEq', 1),
      linearUnit('mmol_monovalent', 'mmol', 1),
    ],
  },
  {
    categoryId: 'concentrations',
    defaultFromUnitId: 'meq_divalent',
    defaultToUnitId: 'mmol_divalent',
    id: 'meq_mmol_divalent',
    label: 'mEq <-> mmol, валентность 2',
    units: [
      linearUnit('meq_divalent', 'mEq', 0.5),
      linearUnit('mmol_divalent', 'mmol', 1),
    ],
  },
  {
    categoryId: 'concentrations',
    defaultFromUnitId: 'insulin_units_ml',
    defaultToUnitId: 'insulin_units_0_01ml',
    id: 'insulin_concentration',
    label: 'Инсулин',
    units: [
      linearUnit('insulin_units_ml', 'ЕД/мл', 1),
      linearUnit('insulin_units_0_01ml', 'ЕД/0.01 мл', 100),
    ],
  },
  {
    categoryId: 'hematology',
    defaultFromUnitId: 'hematocrit_percent',
    defaultToUnitId: 'hematocrit_l_l',
    id: 'hematocrit',
    label: 'Гематокрит',
    units: [
      linearUnit('hematocrit_percent', '%', 0.01),
      linearUnit('hematocrit_l_l', 'л/л', 1),
    ],
  },
  {
    categoryId: 'hematology',
    defaultFromUnitId: 'hemoglobin_g_dl',
    defaultToUnitId: 'hemoglobin_g_l',
    id: 'hemoglobin',
    label: 'Гемоглобин',
    units: [
      linearUnit('hemoglobin_g_dl', 'г/дл', 10),
      linearUnit('hemoglobin_g_l', 'г/л', 1),
    ],
  },
  {
    categoryId: 'hematology',
    defaultFromUnitId: 'rbc_10e12_l',
    defaultToUnitId: 'rbc_mln_mcl',
    id: 'rbc',
    label: 'Эритроциты',
    units: [
      linearUnit('rbc_10e12_l', '10^12/л', 1),
      linearUnit('rbc_mln_mcl', 'млн/мкл', 1),
    ],
  },
  {
    categoryId: 'hematology',
    defaultFromUnitId: 'wbc_10e9_l',
    defaultToUnitId: 'wbc_thousand_mcl',
    id: 'wbc',
    label: 'Лейкоциты',
    units: [
      linearUnit('wbc_10e9_l', '10^9/л', 1),
      linearUnit('wbc_thousand_mcl', 'тыс/мкл', 1),
    ],
  },
  {
    categoryId: 'hematology',
    defaultFromUnitId: 'platelets_10e9_l',
    defaultToUnitId: 'platelets_thousand_mcl',
    id: 'platelets',
    label: 'Тромбоциты',
    units: [
      linearUnit('platelets_10e9_l', '10^9/л', 1),
      linearUnit('platelets_thousand_mcl', 'тыс/мкл', 1),
    ],
  },
  {
    categoryId: 'hematology',
    defaultFromUnitId: 'fibrinogen_mg_dl',
    defaultToUnitId: 'fibrinogen_g_l',
    id: 'fibrinogen',
    label: 'Фибриноген',
    units: [
      linearUnit('fibrinogen_mg_dl', 'мг/дл', 0.01),
      linearUnit('fibrinogen_g_l', 'г/л', 1),
    ],
  },
  {
    categoryId: 'biochemistry',
    defaultFromUnitId: 'glucose_mg_dl',
    defaultToUnitId: 'glucose_mmol_l',
    id: 'blood_glucose',
    label: 'Глюкоза крови',
    units: [
      linearUnit('glucose_mg_dl', 'мг/дл', 0.0555),
      linearUnit('glucose_mmol_l', 'ммоль/л', 1),
    ],
  },
  {
    categoryId: 'biochemistry',
    defaultFromUnitId: 'creatinine_mg_dl',
    defaultToUnitId: 'creatinine_mcmol_l',
    id: 'creatinine',
    label: 'Креатинин',
    units: [
      linearUnit('creatinine_mg_dl', 'мг/дл', 88.4),
      linearUnit('creatinine_mcmol_l', 'мкмоль/л', 1),
    ],
  },
  {
    categoryId: 'biochemistry',
    defaultFromUnitId: 'bun_mg_dl',
    defaultToUnitId: 'bun_mmol_l',
    id: 'bun',
    label: 'Азот мочевины / BUN',
    units: [
      linearUnit('bun_mg_dl', 'мг/дл', 0.357),
      linearUnit('bun_mmol_l', 'ммоль/л', 1),
    ],
  },
  {
    categoryId: 'biochemistry',
    defaultFromUnitId: 'urea_mg_dl',
    defaultToUnitId: 'urea_mmol_l',
    id: 'urea',
    label: 'Мочевина',
    units: [
      linearUnit('urea_mg_dl', 'мг/дл', 0.1665),
      linearUnit('urea_mmol_l', 'ммоль/л', 1),
    ],
  },
  {
    categoryId: 'biochemistry',
    defaultFromUnitId: 'bilirubin_mg_dl',
    defaultToUnitId: 'bilirubin_mcmol_l',
    id: 'bilirubin',
    label: 'Билирубин',
    units: [
      linearUnit('bilirubin_mg_dl', 'мг/дл', 17.1),
      linearUnit('bilirubin_mcmol_l', 'мкмоль/л', 1),
    ],
  },
  {
    categoryId: 'biochemistry',
    defaultFromUnitId: 'cholesterol_mg_dl',
    defaultToUnitId: 'cholesterol_mmol_l',
    id: 'cholesterol',
    label: 'Холестерин',
    units: [
      linearUnit('cholesterol_mg_dl', 'мг/дл', 0.0259),
      linearUnit('cholesterol_mmol_l', 'ммоль/л', 1),
    ],
  },
  {
    categoryId: 'biochemistry',
    defaultFromUnitId: 'triglycerides_mg_dl',
    defaultToUnitId: 'triglycerides_mmol_l',
    id: 'triglycerides',
    label: 'Триглицериды',
    units: [
      linearUnit('triglycerides_mg_dl', 'мг/дл', 0.0113),
      linearUnit('triglycerides_mmol_l', 'ммоль/л', 1),
    ],
  },
  {
    categoryId: 'biochemistry',
    defaultFromUnitId: 'protein_g_dl',
    defaultToUnitId: 'protein_g_l',
    id: 'protein',
    label: 'Общий белок / альбумин / глобулины',
    units: [
      linearUnit('protein_g_dl', 'г/дл', 10),
      linearUnit('protein_g_l', 'г/л', 1),
    ],
  },
  {
    categoryId: 'biochemistry',
    defaultFromUnitId: 'calcium_mg_dl',
    defaultToUnitId: 'calcium_mmol_l',
    id: 'calcium',
    label: 'Кальций',
    units: [
      linearUnit('calcium_mg_dl', 'мг/дл', 0.25),
      linearUnit('calcium_mmol_l', 'ммоль/л', 1),
    ],
  },
  {
    categoryId: 'biochemistry',
    defaultFromUnitId: 'phosphorus_mg_dl',
    defaultToUnitId: 'phosphorus_mmol_l',
    id: 'phosphorus',
    label: 'Фосфор',
    units: [
      linearUnit('phosphorus_mg_dl', 'мг/дл', 0.323),
      linearUnit('phosphorus_mmol_l', 'ммоль/л', 1),
    ],
  },
  {
    categoryId: 'biochemistry',
    defaultFromUnitId: 'magnesium_mg_dl',
    defaultToUnitId: 'magnesium_mmol_l',
    id: 'magnesium',
    label: 'Магний',
    units: [
      linearUnit('magnesium_mg_dl', 'мг/дл', 0.4114),
      linearUnit('magnesium_mmol_l', 'ммоль/л', 1),
      linearUnit('magnesium_meq_l', 'mEq/л', 0.5),
    ],
  },
  {
    categoryId: 'biochemistry',
    defaultFromUnitId: 'electrolyte_meq_l',
    defaultToUnitId: 'electrolyte_mmol_l',
    id: 'electrolytes_monovalent',
    label: 'Na+ / K+ / Cl-',
    units: [
      linearUnit('electrolyte_meq_l', 'mEq/л', 1),
      linearUnit('electrolyte_mmol_l', 'ммоль/л', 1),
    ],
  },
  {
    categoryId: 'biochemistry',
    defaultFromUnitId: 'lactate_mg_dl',
    defaultToUnitId: 'lactate_mmol_l',
    id: 'lactate',
    label: 'Лактат',
    units: [
      linearUnit('lactate_mg_dl', 'мг/дл', 0.111),
      linearUnit('lactate_mmol_l', 'ммоль/л', 1),
    ],
  },
  {
    categoryId: 'biochemistry',
    defaultFromUnitId: 'ammonia_mcg_dl',
    defaultToUnitId: 'ammonia_mcmol_l',
    id: 'ammonia',
    label: 'Аммиак',
    units: [
      linearUnit('ammonia_mcg_dl', 'мкг/дл', 0.5872),
      linearUnit('ammonia_mcmol_l', 'мкмоль/л', 1),
    ],
  },
  {
    categoryId: 'biochemistry',
    defaultFromUnitId: 'iron_mcg_dl',
    defaultToUnitId: 'iron_mcmol_l',
    id: 'iron',
    label: 'Железо',
    units: [
      linearUnit('iron_mcg_dl', 'мкг/дл', 0.179),
      linearUnit('iron_mcmol_l', 'мкмоль/л', 1),
    ],
  },
  {
    categoryId: 'hormones',
    defaultFromUnitId: 't4_mcg_dl',
    defaultToUnitId: 't4_nmol_l',
    id: 't4',
    label: 'Т4',
    units: [
      linearUnit('t4_mcg_dl', 'мкг/дл', 12.87),
      linearUnit('t4_nmol_l', 'нмоль/л', 1),
    ],
  },
  {
    categoryId: 'hormones',
    defaultFromUnitId: 'cortisol_mcg_dl',
    defaultToUnitId: 'cortisol_nmol_l',
    id: 'cortisol',
    label: 'Кортизол',
    units: [
      linearUnit('cortisol_mcg_dl', 'мкг/дл', 27.6),
      linearUnit('cortisol_nmol_l', 'нмоль/л', 1),
    ],
  },
  {
    categoryId: 'hormones',
    defaultFromUnitId: 'uric_acid_mg_dl',
    defaultToUnitId: 'uric_acid_mmol_l',
    id: 'uric_acid',
    label: 'Мочевая кислота',
    units: [
      linearUnit('uric_acid_mg_dl', 'мг/дл', 0.059),
      linearUnit('uric_acid_mmol_l', 'ммоль/л', 1),
    ],
  },
  {
    categoryId: 'hormones',
    defaultFromUnitId: 'urine_protein_creatinine_g_g',
    defaultToUnitId: 'urine_protein_creatinine_g_mmol',
    id: 'urine_protein_creatinine_ratio',
    label: 'Соотношение белок/креатинин в моче',
    units: [
      linearUnit('urine_protein_creatinine_g_g', 'г/г', 0.113),
      linearUnit('urine_protein_creatinine_g_mmol', 'г/ммоль', 1),
    ],
  },
] as const satisfies readonly ConversionMetric[]

const conversionMetricById = new Map<string, ConversionMetric>(
  conversionMetrics.map((metric) => [metric.id, metric]),
)

const isFiniteNumber = (value: number | undefined): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value)
)

export const getConversionMetricById = (
  metricId: string,
) => conversionMetricById.get(metricId)

export const getConversionMetricsByCategory = (
  categoryId: string,
) => conversionMetrics.filter((metric) => metric.categoryId === categoryId)

export const getConversionUnitById = (
  metric: ConversionMetric,
  unitId: string,
) => metric.units.find((unit) => unit.id === unitId)

export const convertUnitValue = ({
  fromUnitId,
  metricId,
  toUnitId,
  value,
}: UnitConversionInput): UnitConversionResult | undefined => {
  if (!isFiniteNumber(value)) {
    return undefined
  }

  const metric = conversionMetricById.get(metricId)

  if (metric === undefined) {
    return undefined
  }

  const fromUnit = getConversionUnitById(metric, fromUnitId)
  const toUnit = getConversionUnitById(metric, toUnitId)

  if (fromUnit === undefined || toUnit === undefined) {
    return undefined
  }

  return {
    fromUnit,
    metric,
    toUnit,
    value: toUnit.fromBase(fromUnit.toBase(value)),
  }
}

export const formatConvertedValue = (value: number, digits = 4): string => {
  if (value !== 0 && Math.abs(value) < 0.0001) {
    return value.toPrecision(4)
  }

  const multiplier = 10 ** digits
  const roundedValue = Math.round((value + Number.EPSILON) * multiplier) / multiplier

  return roundedValue.toFixed(digits).replace(/\.?0+$/, '')
}
