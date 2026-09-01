import { useMemo, useState, type ChangeEvent } from 'react'
import {
  calculatePdr,
  formatPdrDate,
  formatPdrNumber,
  pdrGroupIds,
  pdrGroups,
  type PdrGroupId,
} from '../../domain/pdr'
import {
  CalculatorDateField,
  CalculatorDescription,
  CalculatorError,
  CalculatorForm,
  CalculatorNumberField,
  CalculatorPanel,
  CalculatorResult,
  CalculatorSelectField,
} from '../../ui/CalculatorForm'

const names = {
  title: 'Калькулятор ПДР',
  labels: {
    bpMm: 'Средний BP / БПД, мм',
    examDate: 'Дата УЗИ',
    group: 'Вид/размер животного',
  },
  note: `BP / БПД - бипариетальный диаметр головы плода.
Для расчета желательно использовать среднее значение минимум по 2-3 плодам, если это возможно.
Для планового кесарева одного BP недостаточно: учитывайте дату овуляции/вязки, прогестерон, ЧСС и зрелость плодов.`,
  source: 'Источник: Luvoni & Grioni, 2000; Beccaglia & Luvoni, 2012/2016; Socha & Janowski, Alonge et al.',
} as const

const groupOptions = pdrGroups.map((group) => ({
  id: `pdr-group-${group.id}`,
  label: group.label,
  value: group.id,
}))

const decimalNumberPattern = /^\d*(?:\.\d{0,2})?$/
const pdrGroupSet = new Set<PdrGroupId>(pdrGroupIds)

const isPdrGroupId = (value: string): value is PdrGroupId => (
  pdrGroupSet.has(value as PdrGroupId)
)

const readNumberInput = (value: string): number | undefined => {
  if (value === '') return undefined

  const parsedValue = Number(value.replace(',', '.'))

  return Number.isFinite(parsedValue) ? parsedValue : undefined
}

export default function PdrPage() {
  const [bpInput, setBpInput] = useState('')
  const [examDateIso, setExamDateIso] = useState('')
  const [groupId, setGroupId] = useState<PdrGroupId>()

  const bpMm = useMemo(() => readNumberInput(bpInput), [bpInput])
  const result = useMemo(() => calculatePdr({
    bpMm,
    examDateIso,
    groupId,
  }), [bpMm, examDateIso, groupId])

  const handleBpChange = (e: ChangeEvent<HTMLInputElement>) => {
    const normalizedInput = e.target.value.replace(',', '.')

    if (!decimalNumberPattern.test(normalizedInput)) {
      return
    }

    setBpInput(e.target.value)
  }

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setExamDateIso(e.target.value)
  }

  const handleGroupChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setGroupId(isPdrGroupId(e.target.value) ? e.target.value : undefined)
  }

  const warningText = result === undefined
    ? undefined
    : [
      result.daysBeforeParturition < 0
        ? 'Расчетная дата родов получается раньше даты УЗИ: проверьте BP и выбранную группу.'
        : undefined,
      result.isOutsideRecommendedPeriod
        ? `Значение вне рекомендованного периода применения BP для этой группы: примерно ${result.group.recommendedDbpMin}-${result.group.recommendedDbpMax} дней до родов.`
        : undefined,
    ].filter(Boolean).join('\n')

  const resultText = result === undefined
    ? undefined
    : `Группа: ${result.group.label}
Формула: (${formatPdrNumber(result.group.bpConstantMm, 2)} - BPмм) / ${formatPdrNumber(result.group.bpCoefficient, 2)}
Дней до родов: ${formatPdrNumber(result.daysBeforeParturition)} дн.
Округлено для даты: ${result.roundedDaysBeforeParturition} дн.
Предполагаемая дата родов: ${formatPdrDate(result.dueDateIso)}
Ориентировочный диапазон: ${formatPdrDate(result.rangeStartIso)} - ${formatPdrDate(result.rangeEndIso)}`

  return (
    <CalculatorForm title={names.title}>
      <CalculatorSelectField
        label={names.labels.group}
        options={groupOptions}
        value={groupId ?? ''}
        onChange={handleGroupChange}
      />
      <CalculatorDateField
        label={names.labels.examDate}
        value={examDateIso}
        onChange={handleDateChange}
      />
      <CalculatorNumberField
        label={names.labels.bpMm}
        min="0"
        step="0.01"
        value={bpInput}
        onChange={handleBpChange}
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
