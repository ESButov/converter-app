import { useMemo, useState, type ChangeEvent } from 'react'
import {
  calculateEnteralNutrition,
  formatEnteralNumber,
  getDerCoefficientOptions,
  getEnteralNeed,
  getEnteralNeedsForSpecies,
  isFixedDerCoefficient,
  isRefeedingNeed,
  type EnteralNeedId,
  type EnteralSpecies,
  type FeedType,
  type TherapyDay,
} from '../../domain/enteralNutrition'
import {
  CalculatorDescription,
  CalculatorForm,
  CalculatorNumberField,
  CalculatorResult,
  CalculatorSelectField,
} from '../../ui/CalculatorForm'

type NumberFieldKey = 'foodCaloriesKcalPer100g' | 'weightKg'
type NumberInputs = Record<NumberFieldKey, string>

const names = {
  title: 'Энтеральное питание/НЭП',
  labels: {
    derCoefficient: 'Коэффициент DER',
    feedType: 'Тип корма',
    foodCaloriesKcalPer100g: 'Калорийность корма, ккал/100 г',
    need: 'Потребности',
    species: 'Вид животного',
    therapyDay: 'День терапии',
    weightKg: 'Масса, кг',
  },
  descriptions: {
    refeeding: 'Для рефидинг-расчета укажите день терапии, тип корма и калорийность.',
  },
  resultLabels: {
    bolus4: 'При кормлении каждые 4 часа (6 раз в сутки)',
    bolus6: 'При кормлении каждые 6 часов (4 раза в сутки)',
    der: 'DER',
    derFoodMass: 'Масса корма по DER',
    foodMass: 'Масса корма на сутки',
    maxDailyVolume: 'Max безопасный суточный объем для НЭП',
    maxRate: 'Max безопасная скорость',
    nepRate: 'Расчетная скорость НЭП',
    rer: 'RER',
    rerFoodMass: 'Масса корма по RER',
    safeRate: 'Скорость инфузии',
    supplementalBolus: 'Объем докорма (болюсы) в сутки',
    totalMixture: 'Общий объем смеси на сутки',
    waterVolume: 'Объем воды для разведения смеси',
  },
  safety: {
    safe: 'Расчетная скорость НЭП ≤ 3 мл/кг/ч',
    unsafe: `Расчетная скорость НЭП > 3 мл/кг/ч
Скорость превышает безопасный порог (3 мл/кг/ч).
Рекомендовано комбинированное кормление`,
  },
} as const

const speciesOptions = [
  {
    id: 'enteral-species-dog',
    label: 'Собака',
    value: 'dog',
  },
  {
    id: 'enteral-species-cat',
    label: 'Кошка',
    value: 'cat',
  },
] as const

const feedTypeOptions = [
  {
    id: 'enteral-feed-wet',
    label: 'Влажный корм',
    value: 'wet',
  },
  {
    id: 'enteral-feed-dry',
    label: 'Сухой корм',
    value: 'dry',
  },
] as const

const therapyDayOptions = [
  {
    id: 'enteral-day-1',
    label: '1',
    value: 'day1',
  },
  {
    id: 'enteral-day-2',
    label: '2',
    value: 'day2',
  },
  {
    id: 'enteral-day-3',
    label: '3',
    value: 'day3',
  },
  {
    id: 'enteral-day-4',
    label: '4',
    value: 'day4',
  },
  {
    id: 'enteral-day-5',
    label: '5',
    value: 'day5',
  },
  {
    id: 'enteral-day-6',
    label: '6',
    value: 'day6',
  },
  {
    id: 'enteral-day-7-plus',
    label: '7+',
    value: 'day7Plus',
  },
] as const

const numberInputDefaults: NumberInputs = {
  foodCaloriesKcalPer100g: '',
  weightKg: '',
}

const decimalNumberPattern = /^\d*(?:\.\d{0,3})?$/
const speciesSet = new Set<EnteralSpecies>(['dog', 'cat'])
const feedTypeSet = new Set<FeedType>(['wet', 'dry'])
const therapyDaySet = new Set<TherapyDay>([
  'day1',
  'day2',
  'day3',
  'day4',
  'day5',
  'day6',
  'day7Plus',
])

const readNumberInput = (value: string): number | undefined => {
  if (value === '') return undefined

  const parsedValue = Number(value.replace(',', '.'))

  return Number.isFinite(parsedValue) ? parsedValue : undefined
}

const isEnteralSpecies = (value: string): value is EnteralSpecies => (
  speciesSet.has(value as EnteralSpecies)
)

const isEnteralNeedId = (
  value: string,
  species: EnteralSpecies | undefined,
): value is EnteralNeedId => (
  getEnteralNeedsForSpecies(species).some((need) => need.id === value)
)

const isFeedType = (value: string): value is FeedType => (
  feedTypeSet.has(value as FeedType)
)

const isTherapyDay = (value: string): value is TherapyDay => (
  therapyDaySet.has(value as TherapyDay)
)

const formatDerCoefficient = (value: number) => formatEnteralNumber(value, 2)
const formatResultNumber = (value: number) => formatEnteralNumber(value)

export default function EnteralNutritionPage() {
  const [derCoefficient, setDerCoefficient] = useState('')
  const [feedType, setFeedType] = useState<FeedType>('wet')
  const [inputs, setInputs] = useState<NumberInputs>(numberInputDefaults)
  const [needId, setNeedId] = useState<EnteralNeedId>()
  const [species, setSpecies] = useState<EnteralSpecies>()
  const [therapyDay, setTherapyDay] = useState<TherapyDay>('day1')

  const needOptions = useMemo(() => (
    getEnteralNeedsForSpecies(species).map((need) => ({
      id: `enteral-need-${need.id}`,
      label: `${need.label} (${formatDerCoefficient(need.coefficient.min)}${need.coefficient.min === need.coefficient.max ? '' : `-${formatDerCoefficient(need.coefficient.max)}`})`,
      value: need.id,
    }))
  ), [species])

  const selectedNeed = useMemo(() => (
    getEnteralNeed(needId, species)
  ), [needId, species])

  const coefficientOptions = useMemo(() => (
    selectedNeed === undefined
      ? []
      : getDerCoefficientOptions(selectedNeed.coefficient).map((coefficient) => ({
        id: `enteral-der-${coefficient}`,
        label: formatDerCoefficient(coefficient),
        value: String(coefficient),
      }))
  ), [selectedNeed])

  const numericValues = useMemo(() => ({
    derCoefficient: readNumberInput(derCoefficient),
    foodCaloriesKcalPer100g: readNumberInput(inputs.foodCaloriesKcalPer100g),
    weightKg: readNumberInput(inputs.weightKg),
  }), [derCoefficient, inputs])

  const shouldShowRefeedingFields = isRefeedingNeed(needId)

  const result = useMemo(() => calculateEnteralNutrition({
    derCoefficient: numericValues.derCoefficient,
    feedType: shouldShowRefeedingFields ? feedType : undefined,
    foodCaloriesKcalPer100g: numericValues.foodCaloriesKcalPer100g,
    needId,
    species,
    therapyDay: shouldShowRefeedingFields ? therapyDay : undefined,
    weightKg: numericValues.weightKg,
  }), [
    feedType,
    needId,
    numericValues,
    shouldShowRefeedingFields,
    species,
    therapyDay,
  ])

  const setNeedWithDefaultCoefficient = (
    nextNeedId: EnteralNeedId | undefined,
    nextSpecies: EnteralSpecies | undefined,
  ) => {
    const nextNeed = getEnteralNeed(nextNeedId, nextSpecies)

    setNeedId(nextNeed?.id)
    setDerCoefficient(nextNeed === undefined ? '' : String(nextNeed.coefficient.min))
  }

  const handleSpeciesChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextSpecies = isEnteralSpecies(e.target.value) ? e.target.value : undefined
    const firstSpeciesNeed = getEnteralNeedsForSpecies(nextSpecies)
      .find((need) => need.species === nextSpecies)

    setSpecies(nextSpecies)
    setNeedWithDefaultCoefficient(firstSpeciesNeed?.id, nextSpecies)
  }

  const handleNeedChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setNeedWithDefaultCoefficient(
      isEnteralNeedId(e.target.value, species) ? e.target.value : undefined,
      species,
    )
  }

  const handleNumberChange = (
    e: ChangeEvent<HTMLInputElement>,
    key: NumberFieldKey,
  ) => {
    const normalizedInput = e.target.value.replace(',', '.')

    if (!decimalNumberPattern.test(normalizedInput)) {
      return
    }

    setInputs((prev) => ({
      ...prev,
      [key]: e.target.value,
    }))
  }

  const handleCoefficientChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setDerCoefficient(e.target.value)
  }

  const handleFeedTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (isFeedType(e.target.value)) {
      setFeedType(e.target.value)
    }
  }

  const handleTherapyDayChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (isTherapyDay(e.target.value)) {
      setTherapyDay(e.target.value)
    }
  }

  const resultText = useMemo(() => {
    if (result === undefined) {
      return undefined
    }

    const rerFoodMassText = result.foodMassRerGDay === undefined
      ? ''
      : `
${names.resultLabels.rerFoodMass}: ${formatResultNumber(result.foodMassRerGDay)} г/сутки`
    const derFoodMassText = result.foodMassDerGDay === undefined
      ? ''
      : `
${names.resultLabels.derFoodMass}: ${formatResultNumber(result.foodMassDerGDay)} г/сутки`
    const baseResult = `${names.resultLabels.rer}: ${formatResultNumber(result.rerKcalDay)} ккал/день${rerFoodMassText}
${names.resultLabels.der}: ${formatResultNumber(result.derKcalDay)} ккал/день${derFoodMassText}`

    if (result.refeeding === undefined) {
      return baseResult
    }

    const refeeding = result.refeeding
    const rateConclusion = refeeding.isRateSafe
      ? `${names.safety.safe}
${names.resultLabels.safeRate}: ${formatResultNumber(refeeding.calculatedNepRateMlHour)} мл/ч.`
      : `${names.safety.unsafe}
${names.resultLabels.supplementalBolus}: ${formatResultNumber(refeeding.supplementalBolusVolumeMlDay ?? 0)} мл
Объем одного болюса:
${names.resultLabels.bolus4}: ${formatResultNumber(refeeding.bolusEvery4HoursMl ?? 0)} мл
${names.resultLabels.bolus6}: ${formatResultNumber(refeeding.bolusEvery6HoursMl ?? 0)} мл`

    return `${baseResult}
${names.resultLabels.foodMass}: ${formatResultNumber(refeeding.foodMassGDay)} г
${names.resultLabels.waterVolume}: ${formatResultNumber(refeeding.waterVolumeMlDay)} мл
${names.resultLabels.totalMixture}: ${formatResultNumber(refeeding.totalMixtureMlDay)} мл
${names.resultLabels.nepRate}: ${formatResultNumber(refeeding.calculatedNepRateMlHour)} мл/ч
${names.resultLabels.maxRate}: ${formatResultNumber(refeeding.maxSafeRateMlHour)} мл/ч
${names.resultLabels.maxDailyVolume}: ${formatResultNumber(refeeding.maxSafeDailyVolumeMl)} мл
${rateConclusion}`
  }, [result])

  return (
    <CalculatorForm title={names.title}>
      <CalculatorSelectField
        label={names.labels.species}
        options={speciesOptions}
        value={species ?? ''}
        onChange={handleSpeciesChange}
      />
      <CalculatorNumberField
        label={names.labels.weightKg}
        min="0"
        step="0.01"
        value={inputs.weightKg}
        onChange={(e) => handleNumberChange(e, 'weightKg')}
      />
      <CalculatorSelectField
        disabled={species === undefined}
        label={names.labels.need}
        options={needOptions}
        value={needId ?? ''}
        onChange={handleNeedChange}
      />
      {selectedNeed !== undefined && isFixedDerCoefficient(selectedNeed.coefficient) &&
        <CalculatorNumberField
          disabled
          label={names.labels.derCoefficient}
          step="0.01"
          value={formatDerCoefficient(selectedNeed.coefficient.min)}
          onChange={() => undefined}
        />}
      {selectedNeed !== undefined && !isFixedDerCoefficient(selectedNeed.coefficient) &&
        <CalculatorSelectField
          label={names.labels.derCoefficient}
          options={coefficientOptions}
          value={derCoefficient}
          onChange={handleCoefficientChange}
        />}

      <CalculatorNumberField
        label={names.labels.foodCaloriesKcalPer100g}
        min="0"
        step="0.1"
        value={inputs.foodCaloriesKcalPer100g}
        onChange={(e) => handleNumberChange(e, 'foodCaloriesKcalPer100g')}
      />

      {shouldShowRefeedingFields &&
        <>
          <CalculatorDescription>{names.descriptions.refeeding}</CalculatorDescription>
          <CalculatorSelectField
            label={names.labels.therapyDay}
            options={therapyDayOptions}
            value={therapyDay}
            onChange={handleTherapyDayChange}
          />
          <CalculatorSelectField
            label={names.labels.feedType}
            options={feedTypeOptions}
            value={feedType}
            onChange={handleFeedTypeChange}
          />
        </>}

      <CalculatorResult
        align="start"
        multiline
      >
        {resultText}
      </CalculatorResult>
    </CalculatorForm>
  )
}
