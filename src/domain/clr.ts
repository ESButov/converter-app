export type ClrSpecies = 'cat' | 'dog' | 'exotic'

type DoseUnit = 'mg' | 'mcg' | 'U' | 'mEq'
type ConcentrationUnit = 'mg/ml' | 'U/ml' | 'mEq/ml'

type BaseClrDrugDefinition = {
  id: string
  label: string
  concentration: number
  concentrationLabel: string
  concentrationUnit: ConcentrationUnit
  doseLabel: string
  intratrachealDoseLabel?: string
  intratrachealDose?: {
    value: number
    unit: DoseUnit
  }
  intratrachealDoseRange?: {
    min: number
    max: number
    unit: DoseUnit
  }
  note: string
  route: string
  speciesRestriction?: ClrSpecies
}

export type SingleClrDrugDefinition = BaseClrDrugDefinition & {
  dose: number
  doseUnit: DoseUnit
}

export type RangeClrDrugDefinition = BaseClrDrugDefinition & {
  doseRange: {
    min: number
    max: number
  }
  doseUnit: DoseUnit
}

export type EsmololClrDrugDefinition = BaseClrDrugDefinition & {
  bolusDoseMgKg: number
  criDoseMcgKgMin: number
}

export type ClrDrugDefinition =
  | EsmololClrDrugDefinition
  | RangeClrDrugDefinition
  | SingleClrDrugDefinition

export type ClrDrugCalculation = {
  amountLabel: string
  definition: ClrDrugDefinition
  dilutionLabel?: string
  dilutionVolumeLabel?: string
  intratrachealLabel?: string
  isAvailableForSpecies: boolean
  specialDilutionLabel?: string
  volumeLabel: string
}

export const clrSpeciesLabels: Record<ClrSpecies, string> = {
  cat: 'Кошка',
  dog: 'Собака',
  exotic: 'Экзотическое животное',
}

const drugIdsWithOneToTenDilution = new Set(['epinephrine', 'atropine', 'lidocaine'])
const exoticDrugIds = new Set(['epinephrine', 'atropine', 'naloxone', 'atipamezole'])
const exoticDilutionDrugIds = new Set(['epinephrine', 'atropine'])

export const clrDrugDefinitions: readonly ClrDrugDefinition[] = [
  {
    id: 'epinephrine',
    label: 'Адреналин',
    concentration: 1,
    concentrationLabel: '1 мг/мл',
    concentrationUnit: 'mg/ml',
    dose: 0.01,
    doseLabel: '0.01 мг/кг',
    doseUnit: 'mg',
    intratrachealDoseLabel: '0.02-0.1 мг/кг',
    intratrachealDoseRange: {
      min: 0.02,
      max: 0.1,
      unit: 'mg',
    },
    note: 'В/в или внутрикостно каждые 3-5 мин. Высокая доза 0.1 мг/кг рутинно не рассчитывается по рекомендациям 2024 года.',
    route: 'В/в или внутрикостно',
  },
  {
    id: 'vasopressin',
    label: 'Вазопрессин',
    concentration: 20,
    concentrationLabel: '20 ЕД/мл',
    concentrationUnit: 'U/ml',
    dose: 0.8,
    doseLabel: '0.8 ЕД/кг',
    doseUnit: 'U',
    intratrachealDoseLabel: '1.2 ЕД/кг',
    intratrachealDose: {
      value: 1.2,
      unit: 'U',
    },
    note: 'Альтернатива адреналину; в/в или внутрикостно каждые 3-5 мин по алгоритму СЛР.',
    route: 'В/в или внутрикостно',
  },
  {
    id: 'atropine',
    label: 'Атропин',
    concentration: 0.5,
    concentrationLabel: '0.5 мг/мл',
    concentrationUnit: 'mg/ml',
    doseLabel: '0.04-0.054 мг/кг',
    doseRange: {
      min: 0.04,
      max: 0.054,
    },
    doseUnit: 'mg',
    intratrachealDoseLabel: '0.15-0.2 мг/кг',
    intratrachealDoseRange: {
      min: 0.15,
      max: 0.2,
      unit: 'mg',
    },
    note: 'Однократно как можно раньше при нешоковом ритме, если вероятен высокий вагусный тонус. Не повторять рутинно.',
    route: 'В/в или внутрикостно',
  },
  {
    id: 'lidocaine',
    label: 'Лидокаин',
    concentration: 20,
    concentrationLabel: '20 мг/мл',
    concentrationUnit: 'mg/ml',
    dose: 2,
    doseLabel: '2 мг/кг',
    doseUnit: 'mg',
    note: 'Только собаки: рефрактерная фибрилляция желудочков или желудочковая тахикардия без пульса после неуспешного первого разряда, вводить за 2-4 мин. У кошек не рекомендован.',
    route: 'В/в или внутрикостно',
    speciesRestriction: 'dog',
  },
  {
    id: 'amiodarone',
    label: 'Амиодарон',
    concentration: 50,
    concentrationLabel: '50 мг/мл',
    concentrationUnit: 'mg/ml',
    dose: 5,
    doseLabel: '5 мг/кг',
    doseUnit: 'mg',
    note: 'Рефрактерная фибрилляция желудочков или желудочковая тахикардия без пульса, вводить за 2-4 мин. У кошек предпочтительнее лидокаина; у собак избегать форм с полисорбатом-80.',
    route: 'Медленно в/в или внутрикостно',
  },
  {
    id: 'esmolol',
    label: 'Эсмолол',
    concentration: 10,
    concentrationLabel: '10 мг/мл',
    concentrationUnit: 'mg/ml',
    bolusDoseMgKg: 0.5,
    criDoseMcgKgMin: 50,
    doseLabel: '0.5 мг/кг + 50 мкг/кг/мин',
    note: 'При рефрактерных шоковых ритмах: нагрузочная доза за 3-5 мин, затем постоянная инфузия.',
    route: 'В/в или внутрикостно',
  },
  {
    id: 'naloxone',
    label: 'Налоксон',
    concentration: 0.4,
    concentrationLabel: '0.4 мг/мл',
    concentrationUnit: 'mg/ml',
    dose: 0.04,
    doseLabel: '0.04 мг/кг',
    doseUnit: 'mg',
    note: 'Реверсия опиоидов при подозрении на вклад опиоидной депрессии.',
    route: 'В/в или внутрикостно',
  },
  {
    id: 'flumazenil',
    label: 'Флумазенил',
    concentration: 0.1,
    concentrationLabel: '0.1 мг/мл',
    concentrationUnit: 'mg/ml',
    dose: 0.01,
    doseLabel: '0.01 мг/кг',
    doseUnit: 'mg',
    note: 'Реверсия бензодиазепинов при подозрении на вклад седации.',
    route: 'В/в или внутрикостно',
  },
  {
    id: 'atipamezole',
    label: 'Атипамезол',
    concentration: 5,
    concentrationLabel: '5 мг/мл',
    concentrationUnit: 'mg/ml',
    dose: 100,
    doseLabel: '100 мкг/кг',
    doseUnit: 'mcg',
    note: 'Реверсия альфа-2-агонистов при подозрении на вклад дексмедетомидина/медетомидина.',
    route: 'В/в или внутрикостно',
  },
  {
    id: 'sodium_bicarbonate',
    label: 'Натрия бикарбонат 8.4%',
    concentration: 1,
    concentrationLabel: '1 мЭкв/мл',
    concentrationUnit: 'mEq/ml',
    dose: 1,
    doseLabel: '1 мЭкв/кг',
    doseUnit: 'mEq',
    note: 'Рассмотреть при длительной СЛР более 15 мин, особенно если рН < 7.0.',
    route: 'В/в или внутрикостно',
  },
]

const round = (value: number, digits = 2) => Number(value.toFixed(digits))

const isRangeDrug = (drug: ClrDrugDefinition): drug is RangeClrDrugDefinition => (
  'doseRange' in drug
)

const isEsmololDrug = (drug: ClrDrugDefinition): drug is EsmololClrDrugDefinition => (
  'bolusDoseMgKg' in drug
)

const hasPositiveNumber = (value: number | undefined): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value > 0
)

const getAmountUnitLabel = (unit: DoseUnit) => {
  if (unit === 'mg') return 'мг'
  if (unit === 'mcg') return 'мкг'
  if (unit === 'U') return 'ЕД'
  if (unit === 'mEq') return 'мЭкв'

  return unit
}

const convertAmountToConcentrationUnit = (
  amount: number,
  doseUnit: DoseUnit,
  concentrationUnit: ConcentrationUnit,
) => {
  if (doseUnit === 'mcg' && concentrationUnit === 'mg/ml') {
    return amount / 1000
  }

  return amount
}

export const formatClrNumber = (value: number, digits = 2): string => (
  value.toFixed(digits).replace(/\.?0+$/, '')
)

const formatAmount = (amount: number, unit: DoseUnit) => (
  `${formatClrNumber(round(amount, unit === 'mcg' ? 0 : 3), unit === 'mcg' ? 0 : 3)} ${getAmountUnitLabel(unit)}`
)

const getVolumeDigits = (volumeMl: number) => {
  if (volumeMl > 0 && volumeMl < 0.01) return 4
  if (volumeMl > 0 && volumeMl < 0.1) return 3

  return 2
}

const formatVolume = (volumeMl: number) => {
  const digits = getVolumeDigits(volumeMl)

  return `${formatClrNumber(round(volumeMl, digits), digits)} мл`
}

const getOneToTenDilutionLabel = (
  drug: ClrDrugDefinition,
) => {
  if (!drugIdsWithOneToTenDilution.has(drug.id)) {
    return undefined
  }

  return `Разведение: 1 мл препарата ${drug.concentrationLabel} + 9 мл 0.9% раствора натрия хлорида`
}

const getOneToTenSingleDilutionVolumeLabel = (
  drug: ClrDrugDefinition,
  volumeLabel: string,
) => {
  if (!drugIdsWithOneToTenDilution.has(drug.id)) {
    return undefined
  }

  if (isRangeDrug(drug)) {
    return undefined
  }

  return formatVolume(Number(volumeLabel.replace(' мл', '')) * 10)
}

const getOneToTenRangeDilutionVolumeLabel = (
  drug: RangeClrDrugDefinition,
  weightKg: number,
) => {
  if (!drugIdsWithOneToTenDilution.has(drug.id)) {
    return undefined
  }

  const dilutedConcentration = drug.concentration / 10
  const amountMin = weightKg * drug.doseRange.min
  const amountMax = weightKg * drug.doseRange.max

  return `${formatVolume(amountMin / dilutedConcentration)}-${formatVolume(amountMax / dilutedConcentration)}`
}

const getExoticEpinephrineDilutionLabel = (
  drug: ClrDrugDefinition,
  species: ClrSpecies,
) => {
  if (drug.id !== 'epinephrine' || species !== 'exotic') {
    return undefined
  }

  return `Разведение: 0.1 мл адреналина 1 мг/мл + 9.9 мл 0.9% раствора натрия хлорида`
}

const getExoticAtropineDilutionLabel = (
  drug: ClrDrugDefinition,
  species: ClrSpecies,
) => {
  if (drug.id !== 'atropine' || species !== 'exotic') {
    return undefined
  }

  return `Разведение: 0.1 мл атропина 0.5 мг/мл + 9.9 мл 0.9% раствора натрия хлорида`
}

const getSpecialDilutionLabel = (
  drug: ClrDrugDefinition,
  species: ClrSpecies,
) => (
  getExoticEpinephrineDilutionLabel(drug, species) ??
  getExoticAtropineDilutionLabel(drug, species)
)

const calculateExoticSingleDrug = (
  drug: SingleClrDrugDefinition,
  weightKg: number,
): Pick<ClrDrugCalculation, 'amountLabel' | 'volumeLabel'> => {
  const amount = weightKg * drug.dose
  const dilutedConcentration = drug.concentration * 0.1 / 10
  const concentrationAmount = convertAmountToConcentrationUnit(
    amount,
    drug.doseUnit,
    drug.concentrationUnit,
  )

  return {
    amountLabel: formatAmount(amount, drug.doseUnit),
    volumeLabel: formatVolume(concentrationAmount / dilutedConcentration),
  }
}

const calculateExoticRangeDrug = (
  drug: RangeClrDrugDefinition,
  weightKg: number,
): Pick<ClrDrugCalculation, 'amountLabel' | 'volumeLabel'> => {
  const amountMin = weightKg * drug.doseRange.min
  const amountMax = weightKg * drug.doseRange.max
  const dilutedConcentration = drug.concentration * 0.1 / 10

  return {
    amountLabel: `${formatAmount(amountMin, drug.doseUnit)}-${formatAmount(amountMax, drug.doseUnit)}`,
    volumeLabel: `${formatVolume(amountMin / dilutedConcentration)}-${formatVolume(amountMax / dilutedConcentration)}`,
  }
}

const calculateIntratrachealLabel = (
  drug: ClrDrugDefinition,
  weightKg: number,
) => {
  if (drug.intratrachealDose !== undefined) {
    const amount = weightKg * drug.intratrachealDose.value
    const concentrationAmount = convertAmountToConcentrationUnit(
      amount,
      drug.intratrachealDose.unit,
      drug.concentrationUnit,
    )

    return `Интратрахеально: ${formatVolume(concentrationAmount / drug.concentration)} (${formatAmount(amount, drug.intratrachealDose.unit)})`
  }

  if (drug.intratrachealDoseRange !== undefined) {
    const amountMin = weightKg * drug.intratrachealDoseRange.min
    const amountMax = weightKg * drug.intratrachealDoseRange.max
    const concentrationAmountMin = convertAmountToConcentrationUnit(
      amountMin,
      drug.intratrachealDoseRange.unit,
      drug.concentrationUnit,
    )
    const concentrationAmountMax = convertAmountToConcentrationUnit(
      amountMax,
      drug.intratrachealDoseRange.unit,
      drug.concentrationUnit,
    )

    return `Интратрахеально: ${formatVolume(concentrationAmountMin / drug.concentration)}-${formatVolume(concentrationAmountMax / drug.concentration)} (${formatAmount(amountMin, drug.intratrachealDoseRange.unit)}-${formatAmount(amountMax, drug.intratrachealDoseRange.unit)})`
  }

  return undefined
}

const calculateSingleDrug = (
  drug: SingleClrDrugDefinition,
  weightKg: number,
): Pick<ClrDrugCalculation, 'amountLabel' | 'volumeLabel'> => {
  const amount = weightKg * drug.dose
  const concentrationAmount = convertAmountToConcentrationUnit(
    amount,
    drug.doseUnit,
    drug.concentrationUnit,
  )

  return {
    amountLabel: formatAmount(amount, drug.doseUnit),
    volumeLabel: formatVolume(concentrationAmount / drug.concentration),
  }
}

const calculateRangeDrug = (
  drug: RangeClrDrugDefinition,
  weightKg: number,
): Pick<ClrDrugCalculation, 'amountLabel' | 'volumeLabel'> => {
  const amountMin = weightKg * drug.doseRange.min
  const amountMax = weightKg * drug.doseRange.max

  return {
    amountLabel: `${formatAmount(amountMin, drug.doseUnit)}-${formatAmount(amountMax, drug.doseUnit)}`,
    volumeLabel: `${formatVolume(amountMin / drug.concentration)}-${formatVolume(amountMax / drug.concentration)}`,
  }
}

const calculateEsmololDrug = (
  drug: EsmololClrDrugDefinition,
  weightKg: number,
): Pick<ClrDrugCalculation, 'amountLabel' | 'volumeLabel'> => {
  const bolusMg = weightKg * drug.bolusDoseMgKg
  const criMgHour = weightKg * drug.criDoseMcgKgMin * 60 / 1000
  const bolusVolumeMl = bolusMg / drug.concentration
  const criVolumeMlHour = criMgHour / drug.concentration

  return {
    amountLabel: `${formatAmount(bolusMg, 'mg')}; постоянная инфузия ${formatAmount(criMgHour, 'mg')}/ч`,
    volumeLabel: `${formatVolume(bolusVolumeMl)}; постоянная инфузия ${formatVolume(criVolumeMlHour)}/ч`,
  }
}

export const calculateClrDrugs = (
  species: ClrSpecies | undefined,
  weightKg: number | undefined,
): readonly ClrDrugCalculation[] => {
  if (species === undefined || !hasPositiveNumber(weightKg)) {
    return []
  }

  const definitions = species === 'exotic'
    ? clrDrugDefinitions.filter((definition) => exoticDrugIds.has(definition.id))
    : clrDrugDefinitions

  return definitions.map((definition) => {
    const isAvailableForSpecies = (
      definition.speciesRestriction === undefined ||
      definition.speciesRestriction === species
    )

    if (!isAvailableForSpecies) {
      return {
        amountLabel: 'не рассчитывается',
        definition,
        isAvailableForSpecies,
        volumeLabel: definition.speciesRestriction === undefined
          ? 'нет дозы для выбранного вида'
          : 'не рекомендован для выбранного вида',
      }
    }

    if (isEsmololDrug(definition)) {
      return {
        ...calculateEsmololDrug(definition, weightKg),
        definition,
        intratrachealLabel: calculateIntratrachealLabel(definition, weightKg),
        isAvailableForSpecies,
      }
    }

    if (isRangeDrug(definition)) {
      const calculatedDrug = species === 'exotic'
        ? calculateExoticRangeDrug(definition, weightKg)
        : calculateRangeDrug(definition, weightKg)

      return {
        ...calculatedDrug,
        definition,
        dilutionLabel: species === 'exotic'
          ? undefined
          : getOneToTenDilutionLabel(definition),
        dilutionVolumeLabel: species === 'exotic'
          ? undefined
          : getOneToTenRangeDilutionVolumeLabel(definition, weightKg),
        intratrachealLabel: calculateIntratrachealLabel(definition, weightKg),
        isAvailableForSpecies,
        specialDilutionLabel: getSpecialDilutionLabel(definition, species),
      }
    }

    const calculatedDrug = species === 'exotic' && exoticDilutionDrugIds.has(definition.id)
      ? calculateExoticSingleDrug(definition, weightKg)
      : calculateSingleDrug(definition, weightKg)

    return {
      ...calculatedDrug,
      definition,
      dilutionLabel: species === 'exotic'
        ? undefined
        : getOneToTenDilutionLabel(definition),
      dilutionVolumeLabel: species === 'exotic'
        ? undefined
        : getOneToTenSingleDilutionVolumeLabel(definition, calculatedDrug.volumeLabel),
      intratrachealLabel: calculateIntratrachealLabel(definition, weightKg),
      isAvailableForSpecies,
      specialDilutionLabel: getSpecialDilutionLabel(definition, species),
    }
  })
}
