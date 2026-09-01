import { useMemo, useState, type ChangeEvent } from 'react'
import {
  conversionCategories,
  convertUnitValue,
  formatConvertedValue,
  getConversionMetricById,
  getConversionMetricsByCategory,
  getConversionUnitById,
} from '../../domain/unitConversion'
import {
  CalculatorDescription,
  CalculatorForm,
  CalculatorNumberField,
  CalculatorPanel,
  CalculatorResult,
  CalculatorSelectField,
} from '../../ui/CalculatorForm'
import type { ConversionMetric } from '../../domain/unitConversion'

const names = {
  title: 'Конвертер едениц измерения',
  labels: {
    category: 'Раздел',
    fromUnit: 'Из единицы',
    metric: 'Показатель',
    toUnit: 'В единицу',
    value: 'Значение',
  },
  note: `Для перевода дозировок в скорость шприцевого дозатора используйте калькулятор смешанных инфузий.
Раздел NaCl показывает расчетную концентрацию Na+ в растворе NaCl.`,
  source: 'Источник коэффициентов: MSD Veterinary Manual, Clinical Chemistry SI Conversion Factors; eClinPath Cornell.',
} as const

const defaultMetric = getConversionMetricsByCategory(conversionCategories[0].id)[0]
const decimalNumberPattern = /^-?\d*(?:\.\d{0,4})?$/

const categoryOptions = conversionCategories.map((category) => ({
  id: `convert-category-${category.id}`,
  label: category.label,
  value: category.id,
}))

const readNumberInput = (value: string): number | undefined => {
  if (value === '' || value === '-') return undefined

  const parsedValue = Number(value.replace(',', '.'))

  return Number.isFinite(parsedValue) ? parsedValue : undefined
}

const metricToOption = (metric: ConversionMetric) => ({
  id: `convert-metric-${metric.id}`,
  label: metric.label,
  value: metric.id,
})

const getMetricOrDefault = (metricId: string) => (
  getConversionMetricById(metricId) ?? defaultMetric
)

export default function ConvertPage() {
  const [categoryId, setCategoryId] = useState<string>(defaultMetric.categoryId)
  const [fromUnitId, setFromUnitId] = useState<string>(defaultMetric.defaultFromUnitId)
  const [metricId, setMetricId] = useState<string>(defaultMetric.id)
  const [toUnitId, setToUnitId] = useState<string>(defaultMetric.defaultToUnitId)
  const [valueInput, setValueInput] = useState('')

  const selectedMetric = useMemo(() => getMetricOrDefault(metricId), [metricId])
  const numericValue = useMemo(() => readNumberInput(valueInput), [valueInput])
  const metricOptions = useMemo(() => (
    getConversionMetricsByCategory(categoryId).map(metricToOption)
  ), [categoryId])
  const unitOptions = useMemo(() => selectedMetric.units.map((unit) => ({
    id: `convert-unit-${unit.id}`,
    label: unit.label,
    value: unit.id,
  })), [selectedMetric])

  const result = useMemo(() => convertUnitValue({
    fromUnitId,
    metricId: selectedMetric.id,
    toUnitId,
    value: numericValue,
  }), [fromUnitId, numericValue, selectedMetric.id, toUnitId])

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextCategoryId = e.target.value
    const nextMetric = getConversionMetricsByCategory(nextCategoryId)[0] ?? defaultMetric

    setCategoryId(nextCategoryId)
    setMetricId(nextMetric.id)
    setFromUnitId(nextMetric.defaultFromUnitId)
    setToUnitId(nextMetric.defaultToUnitId)
  }

  const handleMetricChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextMetric = getMetricOrDefault(e.target.value)

    setMetricId(nextMetric.id)
    setFromUnitId(nextMetric.defaultFromUnitId)
    setToUnitId(nextMetric.defaultToUnitId)
  }

  const handleFromUnitChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (getConversionUnitById(selectedMetric, e.target.value) !== undefined) {
      setFromUnitId(e.target.value)
    }
  }

  const handleToUnitChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (getConversionUnitById(selectedMetric, e.target.value) !== undefined) {
      setToUnitId(e.target.value)
    }
  }

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const normalizedInput = e.target.value.replace(',', '.')

    if (!decimalNumberPattern.test(normalizedInput)) {
      return
    }

    setValueInput(e.target.value)
  }

  const resultText = result === undefined
    ? undefined
    : `${selectedMetric.label}: ${formatConvertedValue(numericValue ?? 0)} ${result.fromUnit.label} = ${formatConvertedValue(result.value)} ${result.toUnit.label}`

  return (
    <CalculatorForm title={names.title}>
      <CalculatorSelectField
        label={names.labels.category}
        options={categoryOptions}
        value={categoryId}
        onChange={handleCategoryChange}
      />
      <CalculatorSelectField
        label={names.labels.metric}
        options={metricOptions}
        value={selectedMetric.id}
        onChange={handleMetricChange}
      />
      <CalculatorNumberField
        label={names.labels.value}
        step="0.0001"
        value={valueInput}
        onChange={handleValueChange}
      />
      <CalculatorSelectField
        label={names.labels.fromUnit}
        options={unitOptions}
        value={fromUnitId}
        onChange={handleFromUnitChange}
      />
      <CalculatorSelectField
        label={names.labels.toUnit}
        options={unitOptions}
        value={toUnitId}
        onChange={handleToUnitChange}
      />

      <CalculatorResult align="start">
        {resultText}
      </CalculatorResult>
      <CalculatorPanel>{names.note}</CalculatorPanel>
      <CalculatorDescription>{names.source}</CalculatorDescription>
    </CalculatorForm>
  )
}
