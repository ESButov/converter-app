import { useMemo, useState, type ChangeEvent } from 'react'
import {
  calculatePdr,
  formatPdrDate,
  formatPdrNumber,
  pdrGroupIds,
  pdrGroups,
  pdrStageIds,
  pdrStages,
  type PdrGroupId,
  type PdrStageId,
} from '../../domain/pdr'
import {
  AppCalculationDateField,
  AppCalculationError,
  AppCalculationNote,
  AppCalculationNumberField,
  AppCalculationPanel,
  AppCalculationResult,
  AppCalculationSelectField,
} from '../../ui/AppCalculatorFields'
import AppScreen from '../../ui/AppScreen'

const names = {
  title: 'Калькулятор ПДР',
  labels: {
    examDate: 'Дата УЗИ',
    group: 'Вид/размер животного',
    stage: 'Срок беременности',
  },
  note: `ВДХП - внутренний диаметр хориальной полости, используется на ранних сроках.
БПД - бипариетальный диаметр головы плода, используется после 5 недели.
Для расчета желательно использовать среднее значение минимум по 2-3 плодам, если это возможно.
Для планового кесарева одного БПД недостаточно: учитывайте дату овуляции/вязки, прогестерон, ЧСС и зрелость плодов.`,
  source: 'Источник: Luvoni & Grioni, 2000; Beccaglia & Luvoni, 2012/2016; Alonge et al., 2016; Socha & Janowski, 2018/2019; Lopate, 2023.',
} as const

const groupOptions = pdrGroups.map((group) => ({
  id: `pdr-group-${group.id}`,
  label: group.label,
  value: group.id,
}))

const stageOptions = pdrStages.map((stage) => ({
  id: `pdr-stage-${stage.id}`,
  label: stage.label,
  value: stage.id,
}))

const decimalNumberPattern = /^\d*(?:\.\d{0,2})?$/
const pdrGroupSet = new Set<PdrGroupId>(pdrGroupIds)
const pdrStageSet = new Set<PdrStageId>(pdrStageIds)

const isPdrGroupId = (value: string): value is PdrGroupId => (
  pdrGroupSet.has(value as PdrGroupId)
)

const isPdrStageId = (value: string): value is PdrStageId => (
  pdrStageSet.has(value as PdrStageId)
)

const readNumberInput = (value: string): number | undefined => {
  if (value === '') return undefined

  const parsedValue = Number(value.replace(',', '.'))

  return Number.isFinite(parsedValue) ? parsedValue : undefined
}

export default function PdrPage() {
  const [measurementInput, setMeasurementInput] = useState('')
  const [examDateIso, setExamDateIso] = useState('')
  const [groupId, setGroupId] = useState<PdrGroupId>()
  const [stageId, setStageId] = useState<PdrStageId>('afterFiveWeeks')

  const selectedGroup = useMemo(() => (
    groupId === undefined
      ? undefined
      : pdrGroups.find((group) => group.id === groupId)
  ), [groupId])
  const selectedFormula = selectedGroup?.formulas[stageId]
  const measurementLabel = selectedFormula === undefined
    ? 'Показатель, мм'
    : `${selectedFormula.measurementLabel}, мм`
  const measurementMm = useMemo(() => readNumberInput(measurementInput), [measurementInput])
  const result = useMemo(() => calculatePdr({
    examDateIso,
    groupId,
    measurementMm,
    stageId,
  }), [measurementMm, examDateIso, groupId, stageId])

  const handleMeasurementChange = (e: ChangeEvent<HTMLInputElement>) => {
    const normalizedInput = e.target.value.replace(',', '.')

    if (!decimalNumberPattern.test(normalizedInput)) {
      return
    }

    setMeasurementInput(e.target.value)
  }

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setExamDateIso(e.target.value)
  }

  const handleGroupChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setGroupId(isPdrGroupId(e.target.value) ? e.target.value : undefined)
  }

  const handleStageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (isPdrStageId(e.target.value)) {
      setStageId(e.target.value)
    }
  }

  const warningText = result === undefined
    ? undefined
    : [
      result.daysBeforeParturition < 0
        ? 'Расчетная дата родов получается раньше даты УЗИ: проверьте показатель и выбранную группу.'
        : undefined,
      result.isOutsideRecommendedPeriod
        ? `Значение вне рекомендованного периода применения выбранного показателя для этой группы: примерно ${result.formula.recommendedDbpMin}-${result.formula.recommendedDbpMax} дней до родов.`
        : undefined,
    ].filter(Boolean).join('\n')

  const resultText = result === undefined
    ? undefined
    : `Группа: ${result.group.label}
Расчет: ${result.stage.label}
Показатель: ${result.formula.measurementShortLabel} ${formatPdrNumber(result.measurementMm, 2)} мм
Формула: ${result.formulaText}
Дней до родов: ${formatPdrNumber(result.daysBeforeParturition)} дн.
Округлено для даты: ${result.roundedDaysBeforeParturition} дн.
Предполагаемая дата родов: ${formatPdrDate(result.dueDateIso)}
Ориентировочный диапазон: ${formatPdrDate(result.rangeStartIso)} - ${formatPdrDate(result.rangeEndIso)}`

  return (
    <AppScreen
      ariaLabel="Калькулятор ПДР VetTools"
      backLabel="Назад на главную"
      backTo="/home"
      title={names.title}
    >
      <form
        className="app-calculation-scroll app-calculation-form"
        onSubmit={(event) => event.preventDefault()}
      >
        <AppCalculationSelectField
          label={names.labels.group}
          options={groupOptions}
          value={groupId ?? ''}
          onChange={handleGroupChange}
        />
        <AppCalculationSelectField
          label={names.labels.stage}
          options={stageOptions}
          value={stageId}
          onChange={handleStageChange}
        />
        <AppCalculationDateField
          label={names.labels.examDate}
          value={examDateIso}
          onChange={handleDateChange}
        />
        <AppCalculationNumberField
          label={measurementLabel}
          min="0"
          step="0.01"
          value={measurementInput}
          onChange={handleMeasurementChange}
        />

        <AppCalculationError>{warningText}</AppCalculationError>
        <AppCalculationResult>{resultText}</AppCalculationResult>
        <AppCalculationPanel>{names.note}</AppCalculationPanel>
        <AppCalculationNote>{names.source}</AppCalculationNote>
      </form>
    </AppScreen>
  )
}
