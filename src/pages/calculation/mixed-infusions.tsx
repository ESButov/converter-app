import { useMemo, useState, type ChangeEvent, type CSSProperties } from 'react'
import {
  calculateMixedInfusion,
  formatMixedInfusionNumber,
  getMixedInfusionDoseInputPattern,
  getMixedInfusionDoseHint,
  mixedInfusionDoseUnitLabels,
  mixedInfusionDrugById,
  mixedInfusionDrugDefinitions,
  mixedInfusionSpeciesLabels,
  type MixedInfusionDrugId,
  type MixedInfusionDrugResult,
  type MixedInfusionSpecies,
} from '../../domain/mixedInfusions'
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
  | 'durationHours'
  | 'durationMinutes'
  | 'infusionRateMlHour'
  | 'syringeSizeMl'
  | 'weightKg'
type NumberInputs = Record<NumberFieldKey, string>
type InfusionParameterKey = 'duration' | 'infusionRateMlHour' | 'syringeSizeMl'
type DrugSlot = {
  dose: string
  drugId: '' | MixedInfusionDrugId
}

const names = {
  title: 'Расчеты смешанных инфузий',
  labels: {
    durationHours: 'Время, часы',
    durationMinutes: 'Время, минуты',
    infusionRateMlHour: 'Скорость введения раствора, мл/ч',
    species: 'Вид животного',
    syringeSizeMl: 'Размер шприца, мл',
    weightKg: 'Масса, кг',
  },
  resultLabels: {
    drugVolume: 'Общий объем препаратов в растворе',
    finalRate: 'Конечная скорость подачи',
    saline: 'Добавить физ. раствор',
  },
  errors: {
    minDrugs: 'Для расчета выберите и заполните минимум 2 препарата.',
    parameterPair: 'Для расчета заполните любые 2 параметра: время, размер шприца, скорость введения раствора.',
    syringe: 'Взять шприц большего объема или сократить длительность инфузии.',
  },
  doseSpeed: 'Скорость введения дозы',
} as const

const numberInputDefaults: NumberInputs = {
  durationHours: '3',
  durationMinutes: '0',
  infusionRateMlHour: '',
  syringeSizeMl: '20',
  weightKg: '',
}

const emptyDrugSlots = [
  { drugId: '', dose: '' },
  { drugId: '', dose: '' },
  { drugId: '', dose: '' },
  { drugId: '', dose: '' },
] as const satisfies readonly DrugSlot[]

const speciesOptions = [
  {
    id: 'mixed-infusion-species-cat',
    label: mixedInfusionSpeciesLabels.cat,
    value: 'cat',
  },
  {
    id: 'mixed-infusion-species-dog',
    label: mixedInfusionSpeciesLabels.dog,
    value: 'dog',
  },
] as const

const drugOptions = mixedInfusionDrugDefinitions.map((drug) => ({
  id: `mixed-infusion-drug-${drug.id}`,
  label: drug.name,
  value: drug.id,
}))

const speciesSet = new Set<MixedInfusionSpecies>(['cat', 'dog'])
const drugIdSet = new Set<MixedInfusionDrugId>(
  mixedInfusionDrugDefinitions.map((drug) => drug.id),
)

const numberInputPatterns = {
  durationHours: /^\d*$/,
  durationMinutes: /^\d{0,2}$/,
  infusionRateMlHour: /^\d*(?:\.\d{0,2})?$/,
  syringeSizeMl: /^\d*$/,
  weightKg: /^\d*(?:\.\d{0,2})?$/,
} as const satisfies Record<NumberFieldKey, RegExp>

const doseInputPattern = /^\d*(?:\.\d{0,3})?$/

const styles = {
  doseGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '10px',
  },
  inlineFields: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  slot: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  slotHint: {
    marginTop: '-2px',
    color: 'var(--app-home-muted)',
    fontSize: '12px',
    fontWeight: 700,
    lineHeight: 1.35,
  },
  resultTable: {
    display: 'grid',
    gridTemplateColumns: '1fr 0.85fr 0.75fr 0.85fr',
    gap: '1px',
    overflow: 'hidden',
    border: '1px solid var(--app-home-card-border)',
    borderRadius: '14px',
    backgroundColor: 'var(--app-home-card-border)',
    boxShadow: 'var(--app-home-card-shadow)',
    fontSize: '11px',
    fontWeight: 700,
    lineHeight: 1.25,
  },
  resultCell: {
    minHeight: '34px',
    padding: '7px 6px',
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    color: 'var(--app-home-text)',
    display: 'flex',
    alignItems: 'center',
  },
  resultCellWarn: {
    minHeight: '34px',
    padding: '7px 6px',
    backgroundColor: 'rgba(255, 245, 242, 0.9)',
    color: '#a53d2d',
    display: 'flex',
    alignItems: 'center',
  },
  resultHeader: {
    minHeight: '30px',
    padding: '7px 6px',
    backgroundColor: 'rgba(47, 200, 196, 0.18)',
    color: 'var(--app-home-text)',
    display: 'flex',
    alignItems: 'center',
  },
} as const satisfies Record<string, CSSProperties>

const isSpecies = (value: string): value is MixedInfusionSpecies => (
  speciesSet.has(value as MixedInfusionSpecies)
)

const isDrugId = (value: string): value is MixedInfusionDrugId => (
  drugIdSet.has(value as MixedInfusionDrugId)
)

const readNumberInput = (value: string): number | undefined => {
  if (value === '') return undefined

  const parsedValue = Number(value.replace(',', '.'))

  return Number.isFinite(parsedValue) ? parsedValue : undefined
}

const infusionParameterByField: Partial<Record<NumberFieldKey, InfusionParameterKey>> = {
  durationHours: 'duration',
  durationMinutes: 'duration',
  infusionRateMlHour: 'infusionRateMlHour',
  syringeSizeMl: 'syringeSizeMl',
}

const getDurationFromInputs = (inputs: NumberInputs) => {
  const hours = readNumberInput(inputs.durationHours)
  const minutes = readNumberInput(inputs.durationMinutes)
  const safeHours = hours !== undefined && Number.isFinite(hours) ? hours : 0
  const safeMinutes = minutes !== undefined && Number.isFinite(minutes) ? minutes : 0
  const totalHours = safeHours + safeMinutes / 60

  return totalHours > 0 ? totalHours : undefined
}

const hasPositiveInfusionParameter = (
  inputs: NumberInputs,
  parameter: InfusionParameterKey,
) => {
  if (parameter === 'duration') {
    return getDurationFromInputs(inputs) !== undefined
  }

  return hasPositiveInput(inputs[parameter])
}

const clearInfusionParameter = (
  inputs: NumberInputs,
  parameter: InfusionParameterKey,
): NumberInputs => {
  if (parameter === 'duration') {
    return {
      ...inputs,
      durationHours: '',
      durationMinutes: '',
    }
  }

  return {
    ...inputs,
    [parameter]: '',
  }
}

const hasPositiveInput = (value: string) => {
  const parsedValue = readNumberInput(value)

  return parsedValue !== undefined && parsedValue > 0
}

const getDoseStatusLabel = (drug: MixedInfusionDrugResult) => {
  const status = drug.doseStatus

  if (status === 'above') return 'выше диапазона'
  if (status === 'below') return 'ниже диапазона'
  if (drug.isHighRate) return 'высокая доза'

  return '-'
}

const getDoseDigits = (value: number) => {
  if (value > 0 && value < 0.1) return 4
  if (value > 0 && value < 1) return 3

  return 2
}

const formatDose = (value: number) => (
  formatMixedInfusionNumber(value, getDoseDigits(value))
)

function MixedInfusionResultTable({ drugs }: { drugs: readonly MixedInfusionDrugResult[] }) {
  return (
    <section
      aria-label="Расчет препаратов смешанной инфузии"
      style={styles.resultTable}
    >
      <span style={styles.resultHeader}>Препарат</span>
      <span style={styles.resultHeader}>Доза</span>
      <span style={styles.resultHeader}>Объем</span>
      <span style={styles.resultHeader}>Оценка</span>

      {drugs.flatMap((drug, index) => [
        <span
          key={`${index}-${drug.definition.id}-label`}
          style={styles.resultCell}
        >
          {drug.definition.name}
        </span>,
        <span
          key={`${index}-${drug.definition.id}-dose`}
          style={styles.resultCell}
        >
          {formatMixedInfusionNumber(drug.dose)} {mixedInfusionDoseUnitLabels[drug.definition.doseUnit]}
        </span>,
        <span
          key={`${index}-${drug.definition.id}-volume`}
          style={styles.resultCell}
        >
          {formatMixedInfusionNumber(drug.volumeMl)} мл
        </span>,
        <span
          key={`${index}-${drug.definition.id}-status`}
          style={drug.doseStatus === 'ok' && !drug.isHighRate
            ? styles.resultCell
            : styles.resultCellWarn}
        >
          {getDoseStatusLabel(drug)}
        </span>,
      ])}
    </section>
  )
}

export default function MixedInfusionsPage() {
  const [inputs, setInputs] = useState<NumberInputs>(numberInputDefaults)
  const [infusionParameterOrder, setInfusionParameterOrder] =
    useState<InfusionParameterKey[]>(['duration', 'syringeSizeMl'])
  const [species, setSpecies] = useState<MixedInfusionSpecies>()
  const [drugSlots, setDrugSlots] = useState<DrugSlot[]>(() => [...emptyDrugSlots])

  const numericValues = useMemo(() => ({
    durationHours: readNumberInput(inputs.durationHours),
    durationMinutes: readNumberInput(inputs.durationMinutes),
    infusionRateMlHour: readNumberInput(inputs.infusionRateMlHour),
    syringeSizeMl: readNumberInput(inputs.syringeSizeMl),
    weightKg: readNumberInput(inputs.weightKg),
  }), [inputs])

  const result = useMemo(() => {
    if (species === undefined) {
      return undefined
    }

    return calculateMixedInfusion({
      ...numericValues,
      drugs: drugSlots.map((slot) => ({
        dose: readNumberInput(slot.dose),
        drugId: slot.drugId || undefined,
      })),
    }, species)
  }, [drugSlots, numericValues, species])

  const filledDrugCount = useMemo(() => (
    drugSlots.filter((slot) => slot.drugId && hasPositiveInput(slot.dose)).length
  ), [drugSlots])

  const hasInfusionParameterPair = useMemo(() => (
    [
      getDurationFromInputs(inputs),
      numericValues.infusionRateMlHour,
      numericValues.syringeSizeMl,
    ].filter((value) => value !== undefined && value > 0).length >= 2
  ), [inputs, numericValues])

  const hasStartedDrugInput = useMemo(() => (
    drugSlots.some((slot) => slot.drugId || slot.dose)
  ), [drugSlots])

  const handleNumberChange = (
    e: ChangeEvent<HTMLInputElement>,
    key: NumberFieldKey,
  ) => {
    const normalizedInput = e.target.value.replace(',', '.')

    if (!numberInputPatterns[key].test(normalizedInput)) {
      return
    }

    if (key === 'durationMinutes' && Number(normalizedInput) > 59) {
      return
    }

    const nextInputs = {
      ...inputs,
      [key]: e.target.value,
    }

    const changedParameter = infusionParameterByField[key]

    if (changedParameter === undefined) {
      setInputs(nextInputs)
      return
    }

    let nextParameterOrder = infusionParameterOrder.filter((parameter) => (
      parameter !== changedParameter
    ))

    if (hasPositiveInfusionParameter(nextInputs, changedParameter)) {
      nextParameterOrder = [...nextParameterOrder, changedParameter]
    }

    const sourceToClear = nextParameterOrder.length > 2
      ? nextParameterOrder[0]
      : undefined

    setInputs(sourceToClear === undefined
      ? nextInputs
      : clearInfusionParameter(nextInputs, sourceToClear))
    setInfusionParameterOrder(sourceToClear === undefined
      ? nextParameterOrder
      : nextParameterOrder.slice(1))
  }

  const formatDuration = (totalHours: number) => {
    const totalMinutes = Math.round(totalHours * 60)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return `${hours} ч${minutes > 0 ? ` ${minutes} мин` : ''}`
  }

  const resultText = result === undefined
    ? undefined
    : `Время инфузии: ${formatDuration(result.totalDurationHours)}
Размер шприца: ${formatMixedInfusionNumber(result.syringeSizeMl)} мл
${names.resultLabels.finalRate}: ${formatMixedInfusionNumber(result.finalRateMlHour)} мл/ч
${names.resultLabels.drugVolume}: ${formatMixedInfusionNumber(result.drugVolumeMl)} мл
${names.resultLabels.saline}: ${result.salineVolumeMl >= 0 ? `${formatMixedInfusionNumber(result.salineVolumeMl)} мл` : `не хватает ${formatMixedInfusionNumber(Math.abs(result.salineVolumeMl))} мл`}`

  const handleSpeciesChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSpecies(isSpecies(e.target.value) ? e.target.value : undefined)
  }

  const handleDrugChange = (slotIndex: number, value: string) => {
    setDrugSlots((prev) => prev.map((slot, index) => (
      index === slotIndex
        ? { ...slot, drugId: isDrugId(value) ? value : '' }
        : slot
    )))
  }

  const handleDoseChange = (slotIndex: number, value: string) => {
    const normalizedInput = value.replace(',', '.')
    const currentDrugId = drugSlots[slotIndex]?.drugId
    const currentDefinition = currentDrugId ? mixedInfusionDrugById.get(currentDrugId) : undefined
    const currentDoseInputPattern = getMixedInfusionDoseInputPattern(currentDefinition)

    if (!doseInputPattern.test(normalizedInput) || !currentDoseInputPattern.test(normalizedInput)) {
      return
    }

    setDrugSlots((prev) => prev.map((slot, index) => (
      index === slotIndex
        ? { ...slot, dose: value }
        : slot
    )))
  }

  const doseWarnings = result?.drugs
    .filter((drug) => drug.doseStatus !== 'ok')
    .map((drug) => `${drug.definition.name}: ${getDoseStatusLabel(drug)}`)
    .join('\n')

  const highDoseWarning = result?.drugs
    .filter((drug) => drug.isHighRate)
    .map((drug) => drug.definition.name)
    .join(', ')

  const selectedDrugDoseRangesText = useMemo(() => {
    const selectedDefinitions = drugSlots.flatMap((slot) => {
      if (!slot.drugId) {
        return []
      }

      const definition = mixedInfusionDrugById.get(slot.drugId)

      return definition === undefined ? [] : [definition]
    })

    if (selectedDefinitions.length === 0) {
      return undefined
    }

    if (species === undefined) {
      return 'Выберите вид животного, чтобы увидеть подсказки по дозам.'
    }

    return `Диапазон доз выбранных препаратов:
${selectedDefinitions.map((definition) => `${definition.name}: ${getMixedInfusionDoseHint(definition, species)}`).join('\n')}`
  }, [drugSlots, species])

  const loadingDoseRows = result?.drugs
    .filter((drug) => drug.loadingDoses.length > 0)
    .map((drug) => `${drug.definition.name} ${drug.definition.routeLabel ?? ''}: ${drug.loadingDoses.map((dose) => `${formatDose(dose.doseMgKg)} мг/кг = ${formatMixedInfusionNumber(dose.volumeMl)} мл`).join('; ')}`) ?? []

  const loadingDosesText = loadingDoseRows.length === 0
    ? undefined
    : `Нагрузочные дозы:
${loadingDoseRows.join('\n')}`

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
      <div style={styles.inlineFields}>
        <CalculatorNumberField
          label={names.labels.durationHours}
          min="0"
          step="1"
          value={inputs.durationHours}
          onChange={(e) => handleNumberChange(e, 'durationHours')}
        />
        <CalculatorNumberField
          label={names.labels.durationMinutes}
          max="59"
          min="0"
          step="1"
          value={inputs.durationMinutes}
          onChange={(e) => handleNumberChange(e, 'durationMinutes')}
        />
      </div>
      <CalculatorNumberField
        label={names.labels.syringeSizeMl}
        min="0"
        step="1"
        value={inputs.syringeSizeMl}
        onChange={(e) => handleNumberChange(e, 'syringeSizeMl')}
      />
      <CalculatorNumberField
        label={names.labels.infusionRateMlHour}
        min="0"
        step="0.01"
        value={inputs.infusionRateMlHour}
        onChange={(e) => handleNumberChange(e, 'infusionRateMlHour')}
      />

      <CalculatorDescription>
        {names.doseSpeed}
      </CalculatorDescription>

      <CalculatorError>
        {hasStartedDrugInput && !hasInfusionParameterPair ? names.errors.parameterPair : undefined}
      </CalculatorError>

      {drugSlots.map((slot, index) => {
        const definition = slot.drugId ? mixedInfusionDrugById.get(slot.drugId) : undefined
        const doseUnit = definition ? mixedInfusionDoseUnitLabels[definition.doseUnit] : ''
        const hint = definition === undefined
          ? 'Выберите препарат.'
          : species === undefined
            ? 'Выберите вид животного, чтобы увидеть подсказку по дозе.'
            : getMixedInfusionDoseHint(definition, species)

        return (
          <section
            key={`drug-slot-${index + 1}`}
            aria-label={`Блок препарата ${index + 1}`}
            style={styles.slot}
          >
            <div style={styles.doseGrid}>
              <CalculatorSelectField
                disabled={species === undefined}
                label={`Препарат ${index + 1}`}
                options={drugOptions}
                value={slot.drugId}
                onChange={(e) => handleDrugChange(index, e.target.value)}
              />
              <CalculatorNumberField
                aria-label={`Доза введения препарата ${index + 1}`}
                disabled={!slot.drugId}
                label={doseUnit || ' '}
                min="0"
                step={definition?.doseStep ?? '0.01'}
                value={slot.dose}
                onChange={(e) => handleDoseChange(index, e.target.value)}
              />
            </div>
            <span style={styles.slotHint}>{hint}</span>
          </section>
        )
      })}

      <CalculatorError>
        {hasStartedDrugInput && filledDrugCount < 2 ? names.errors.minDrugs : undefined}
      </CalculatorError>

      {result !== undefined &&
        <MixedInfusionResultTable drugs={result.drugs} />}

      <CalculatorResult
        align="start"
        multiline
      >
        {resultText}
      </CalculatorResult>

      <CalculatorError>
        {result !== undefined && !result.isSyringeVolumeEnough ? names.errors.syringe : undefined}
      </CalculatorError>

      <CalculatorError>
        {doseWarnings}
      </CalculatorError>

      <CalculatorError>
        {highDoseWarning ? `Проверьте дозы: ${highDoseWarning}.` : undefined}
      </CalculatorError>

      <CalculatorPanel>{selectedDrugDoseRangesText}</CalculatorPanel>

      <CalculatorPanel>
        Заполните любые 2 параметра из 3: время, размер шприца и скорость введения раствора. Третий параметр будет рассчитан автоматически.
      </CalculatorPanel>

      <CalculatorPanel>{loadingDosesText}</CalculatorPanel>
    </CalculatorForm>
  )
}
