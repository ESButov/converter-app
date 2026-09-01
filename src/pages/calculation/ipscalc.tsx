import { useMemo, useState, type ChangeEvent } from 'react'
import {
  calculateIpscalc,
  formatIpscalcNumber,
  type IpscalcSpecies,
} from '../../domain/ipscalc'
import {
  CalculatorDescription,
  CalculatorError,
  CalculatorForm,
  CalculatorNumberField,
  CalculatorPanel,
  CalculatorResult,
  CalculatorSelectField,
} from '../../ui/CalculatorForm'

type NumberFieldKey =
  | 'dehydrationPercent'
  | 'diarrheaMl'
  | 'drainMl'
  | 'lossesPeriodHours'
  | 'otherMl'
  | 'polyuriaMl'
  | 'rehydrationHours'
  | 'vomitingMl'
  | 'weightKg'
type NumberInputs = Record<NumberFieldKey, string>

const names = {
  title: 'Калькулятор расчета инфузионной терапии',
  labels: {
    dehydrationPercent: 'Дегидратация, %',
    diarrheaMl: 'Диарея, мл за период',
    drainMl: 'Дренажи/аспирация, мл за период',
    lossesPeriodHours: 'Период, за который измерены потери, ч',
    otherMl: 'Прочие потери, мл за период',
    polyuriaMl: 'Полиурия, мл за период',
    rehydrationHours: 'Восполнить дефицит за, ч',
    species: 'Вид животного',
    vomitingMl: 'Рвота, мл за период',
    weightKg: 'Масса, кг',
  },
  lossesTitle: 'Продолжающиеся потери',
  note: `При гиповолемии сначала восстановить перфузию болюсами, затем пересчитать дефицит и план инфузии.
Дефицит восполняют медленно, с регулярной переоценкой гидратации, массы тела, диуреза, электролитов и признаков перегрузки объемом.
Продолжающиеся потери рекомендуется компенсировать на следующий такой же период наблюдения, затем снова пересчитывать по фактическим потерям.
Учитывайте энтеральную воду, жидкие диеты, промывки катетеров и препараты в общем суточном объеме.`,
  source: 'Источник: 2024 AAHA Fluid Therapy Guidelines for Dogs and Cats; Merck Veterinary Manual, Maintenance Fluid Plan in Animals.',
} as const

const speciesLabels = {
  cat: 'Кошка',
  dog: 'Собака',
} as const satisfies Record<IpscalcSpecies, string>

const speciesOptions = [
  {
    id: 'ipscalc-species-dog',
    label: speciesLabels.dog,
    value: 'dog',
  },
  {
    id: 'ipscalc-species-cat',
    label: speciesLabels.cat,
    value: 'cat',
  },
] as const

const numberInputDefaults: NumberInputs = {
  dehydrationPercent: '',
  diarrheaMl: '',
  drainMl: '',
  lossesPeriodHours: '24',
  otherMl: '',
  polyuriaMl: '',
  rehydrationHours: '',
  vomitingMl: '',
  weightKg: '',
}

const decimalNumberPattern = /^\d*(?:\.\d{0,2})?$/
const integerNumberPattern = /^\d*$/
const ipscalcSpeciesSet = new Set<IpscalcSpecies>(['cat', 'dog'])

const isIpscalcSpecies = (value: string): value is IpscalcSpecies => (
  ipscalcSpeciesSet.has(value as IpscalcSpecies)
)

const readNumberInput = (value: string): number | undefined => {
  if (value === '') return undefined

  const parsedValue = Number(value.replace(',', '.'))

  return Number.isFinite(parsedValue) ? parsedValue : undefined
}

const hasPositiveNumber = (value: unknown): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value > 0
)

export default function IpscalcPage() {
  const [inputs, setInputs] = useState<NumberInputs>(numberInputDefaults)
  const [species, setSpecies] = useState<IpscalcSpecies>()

  const numericValues = useMemo(() => ({
    dehydrationPercent: readNumberInput(inputs.dehydrationPercent),
    diarrheaMl: readNumberInput(inputs.diarrheaMl),
    drainMl: readNumberInput(inputs.drainMl),
    lossesPeriodHours: readNumberInput(inputs.lossesPeriodHours),
    otherMl: readNumberInput(inputs.otherMl),
    polyuriaMl: readNumberInput(inputs.polyuriaMl),
    rehydrationHours: readNumberInput(inputs.rehydrationHours),
    vomitingMl: readNumberInput(inputs.vomitingMl),
    weightKg: readNumberInput(inputs.weightKg),
  }), [inputs])

  const result = useMemo(() => calculateIpscalc({
    dehydrationPercent: numericValues.dehydrationPercent,
    losses: {
      diarrheaMl: numericValues.diarrheaMl,
      drainMl: numericValues.drainMl,
      otherMl: numericValues.otherMl,
      polyuriaMl: numericValues.polyuriaMl,
      vomitingMl: numericValues.vomitingMl,
    },
    lossesPeriodHours: numericValues.lossesPeriodHours,
    rehydrationHours: numericValues.rehydrationHours,
    species,
    weightKg: numericValues.weightKg,
  }), [numericValues, species])

  const handleNumberChange = (
    e: ChangeEvent<HTMLInputElement>,
    key: NumberFieldKey,
  ) => {
    const normalizedInput = e.target.value.replace(',', '.')
    const isIntegerField = key === 'rehydrationHours' || key === 'lossesPeriodHours'
    const pattern = isIntegerField ? integerNumberPattern : decimalNumberPattern

    if (!pattern.test(normalizedInput)) {
      return
    }

    setInputs((prev) => ({
      ...prev,
      [key]: e.target.value,
    }))
  }

  const handleSpeciesChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSpecies(isIpscalcSpecies(e.target.value) ? e.target.value : undefined)
  }

  const warningText = [
    hasPositiveNumber(numericValues.dehydrationPercent) &&
      numericValues.dehydrationPercent >= 10
      ? 'Дегидратация 10% и выше: оцените признаки гиповолемии и необходимость первичной ресусцитации.'
      : undefined,
    hasPositiveNumber(numericValues.rehydrationHours) &&
      numericValues.rehydrationHours < 12
      ? 'Восполнение дефицита быстрее 12 часов требует более частой переоценки пациента.'
      : undefined,
  ].filter(Boolean).join('\n')

  const resultText = result === undefined
    ? undefined
    : `Дефицит жидкости: ${formatIpscalcNumber(result.dehydrationDeficitMl)} мл
Скорость восполнения дефицита: ${formatIpscalcNumber(result.deficitRateMlHour, 2)} мл/ч
Поддерживающий объем: ${formatIpscalcNumber(result.maintenanceMlDay)} мл/сут
Поддерживающий объем: ${formatIpscalcNumber(result.maintenanceMlHour, 2)} мл/ч
Продолжающиеся потери: ${formatIpscalcNumber(result.ongoingLossesTotalMl)} мл за ${formatIpscalcNumber(numericValues.lossesPeriodHours ?? 24)} ч
Добавить для компенсации потерь: ${formatIpscalcNumber(result.ongoingLossesMlHour, 2)} мл/ч на следующие ${formatIpscalcNumber(numericValues.lossesPeriodHours ?? 24)} ч, затем переоценить
Эквивалент при сохранении потерь: ${formatIpscalcNumber(result.ongoingLossesMlDay)} мл/сут
Итоговая скорость на период восполнения дефицита: ${formatIpscalcNumber(result.totalRateDuringRehydrationMlHour, 2)} мл/ч
Скорость после закрытия дефицита: ${formatIpscalcNumber(result.rateAfterDeficitMlHour, 2)} мл/ч
Объем за первые 24 часа: ${formatIpscalcNumber(result.firstDayVolumeMl)} мл
Объем за период восполнения дефицита (${result.rehydrationHours} ч): ${formatIpscalcNumber(result.rehydrationPeriodVolumeMl)} мл`

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
      <CalculatorNumberField
        label={names.labels.dehydrationPercent}
        min="0"
        step="0.1"
        value={inputs.dehydrationPercent}
        onChange={(e) => handleNumberChange(e, 'dehydrationPercent')}
      />
      <CalculatorNumberField
        label={names.labels.rehydrationHours}
        min="1"
        step="1"
        value={inputs.rehydrationHours}
        onChange={(e) => handleNumberChange(e, 'rehydrationHours')}
      />

      <CalculatorPanel>{names.lossesTitle}</CalculatorPanel>
      <CalculatorNumberField
        label={names.labels.lossesPeriodHours}
        min="1"
        step="1"
        value={inputs.lossesPeriodHours}
        onChange={(e) => handleNumberChange(e, 'lossesPeriodHours')}
      />
      <CalculatorNumberField
        label={names.labels.vomitingMl}
        min="0"
        step="0.1"
        value={inputs.vomitingMl}
        onChange={(e) => handleNumberChange(e, 'vomitingMl')}
      />
      <CalculatorNumberField
        label={names.labels.diarrheaMl}
        min="0"
        step="0.1"
        value={inputs.diarrheaMl}
        onChange={(e) => handleNumberChange(e, 'diarrheaMl')}
      />
      <CalculatorNumberField
        label={names.labels.polyuriaMl}
        min="0"
        step="0.1"
        value={inputs.polyuriaMl}
        onChange={(e) => handleNumberChange(e, 'polyuriaMl')}
      />
      <CalculatorNumberField
        label={names.labels.drainMl}
        min="0"
        step="0.1"
        value={inputs.drainMl}
        onChange={(e) => handleNumberChange(e, 'drainMl')}
      />
      <CalculatorNumberField
        label={names.labels.otherMl}
        min="0"
        step="0.1"
        value={inputs.otherMl}
        onChange={(e) => handleNumberChange(e, 'otherMl')}
      />

      <CalculatorError>{warningText}</CalculatorError>

      <CalculatorResult
        align="start"
        multiline
      >
        {resultText}
      </CalculatorResult>
      <CalculatorPanel>{names.note}</CalculatorPanel>
      <CalculatorDescription>{names.source}</CalculatorDescription>
    </CalculatorForm>
  )
}
