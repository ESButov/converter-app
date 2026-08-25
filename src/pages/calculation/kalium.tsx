import { useMemo, useState, type ChangeEvent } from 'react'
import {
  calculateKaliumReplacement,
  formatKaliumNumber,
  type KaliumDoseRange,
} from '../../domain/kaliumReplacement'
import {
  CalculatorDescription,
  CalculatorForm,
  CalculatorNumberField,
  CalculatorPanel,
  CalculatorResult,
  CalculatorSelectField,
} from '../../ui/CalculatorForm'

type KaliumSpecies = 'dog' | 'cat'
type NumberFieldKey = 'currentKaliumMmolL' | 'kclConcentrationPercent' | 'weightKg'
type NumberInputs = Record<NumberFieldKey, string>

const names = {
  title: 'Расчет восполнения калия',
  labels: {
    currentKaliumMmolL: 'Текущий K+, mmol/L',
    kclConcentrationPercent: 'Концентрация KCl, %',
    species: 'Вид животного',
    weightKg: 'Масса, кг',
  },
  resultLabels: {
    concentration: 'Концентрация KCl',
    dose: 'Доза калия',
    kaliumRate: 'Потребность калия',
  },
  safety: `Правила безопасности:
KCl не вводить болюсно. Раствор после добавления тщательно перемешивать. Не использовать KCl-содержащий раствор для быстрой противошоковой инфузии. При тяжелой гипокалиемии нужен мониторинг K+, ЭКГ и контроль диуреза/функции почек.`,
  source: 'Источник: AAHA 2024.',
} as const

const speciesLabels: Record<KaliumSpecies, string> = {
  dog: 'Собака',
  cat: 'Кошка',
}

const speciesOptions = [
  {
    id: 'kalium-species-dog',
    label: speciesLabels.dog,
    value: 'dog',
  },
  {
    id: 'kalium-species-cat',
    label: speciesLabels.cat,
    value: 'cat',
  },
] as const

const numberInputDefaults: NumberInputs = {
  currentKaliumMmolL: '',
  kclConcentrationPercent: '4',
  weightKg: '',
}

const decimalNumberPattern = /^\d*(?:\.\d{0,3})?$/
const kaliumSpeciesSet = new Set<KaliumSpecies>(['dog', 'cat'])

const isKaliumSpecies = (value: string): value is KaliumSpecies => (
  kaliumSpeciesSet.has(value as KaliumSpecies)
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

const formatRange = (
  range: KaliumDoseRange,
  unit: string,
  digits = 1,
) => (
  range.min === range.max
    ? `${formatKaliumNumber(range.max, digits)} ${unit}`
    : `${formatKaliumNumber(range.min, digits)}-${formatKaliumNumber(range.max, digits)} ${unit}`
)

export default function KaliumPage() {
  const [inputs, setInputs] = useState<NumberInputs>(numberInputDefaults)
  const [species, setSpecies] = useState<KaliumSpecies>()

  const numericValues = useMemo(() => ({
    currentKaliumMmolL: readNumberInput(inputs.currentKaliumMmolL),
    kclConcentrationPercent: readNumberInput(inputs.kclConcentrationPercent),
    weightKg: readNumberInput(inputs.weightKg),
  }), [inputs])

  const result = useMemo(() => {
    if (species === undefined) {
      return undefined
    }

    return calculateKaliumReplacement(numericValues)
  }, [numericValues, species])

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

  const handleSpeciesChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSpecies(
      isKaliumSpecies(e.target.value) ? e.target.value : undefined,
    )
  }

  const resultText = useMemo(() => {
    if (
      result === undefined ||
      species === undefined ||
      !hasPositiveNumber(numericValues.kclConcentrationPercent)
    ) {
      return undefined
    }

    return `${names.resultLabels.dose}: ${formatRange(result.kclDoseMlKgHour, 'мл/кг/ч', 2)}
${names.resultLabels.kaliumRate}: ${formatRange(result.kclRateMlHour, 'мл/ч')}
${names.resultLabels.concentration}: ${formatKaliumNumber(numericValues.kclConcentrationPercent)}%`
  }, [numericValues.kclConcentrationPercent, result, species])

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
        label={names.labels.currentKaliumMmolL}
        min="0"
        step="0.1"
        value={inputs.currentKaliumMmolL}
        onChange={(e) => handleNumberChange(e, 'currentKaliumMmolL')}
      />
      <CalculatorNumberField
        label={names.labels.kclConcentrationPercent}
        min="0"
        step="0.1"
        value={inputs.kclConcentrationPercent}
        onChange={(e) => handleNumberChange(e, 'kclConcentrationPercent')}
      />

      <CalculatorResult
        align="start"
        multiline
      >
        {resultText}
      </CalculatorResult>
      <CalculatorPanel>{names.safety}</CalculatorPanel>
      <CalculatorDescription>{names.source}</CalculatorDescription>
    </CalculatorForm>
  )
}
