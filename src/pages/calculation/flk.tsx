import { useMemo, useState, type ChangeEvent, type CSSProperties } from 'react'
import {
  calculateFlk,
  flkDrugById,
  flkDrugDefinitions,
  flkSpeciesLabels,
  formatFlkNumber,
  getFlkDoseHint,
  getFlkDoseRangeLabel,
  type FlkDrugResult,
  type FlkSpecies,
} from '../../domain/flk'
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
  | 'fentanylRateMcgKgMin'
  | 'ketamineRateMcgKgMin'
  | 'lidocaineRateMcgKgMin'
  | 'syringeSizeMl'
  | 'weightKg'

type NumberInputs = Record<NumberFieldKey, string>
type LidocaineConcentrationMgMl = 20 | 100

const names = {
  title: 'Расчет FLK',
  labels: {
    durationHours: 'Время ИПС, часы',
    durationMinutes: 'Время ИПС, минуты',
    fentanylRateMcgKgMin: 'Фентанил, мкг/кг/мин',
    ketamineRateMcgKgMin: 'Кетамин, мкг/кг/мин',
    lidocaineConcentration: 'Концентрация лидокаина',
    lidocaineRateMcgKgMin: 'Лидокаин, мкг/кг/мин',
    species: 'Вид животного',
    syringeSizeMl: 'Размер шприца, мл',
    weightKg: 'Масса пациента, кг',
  },
  resultLabels: {
    drugVolume: 'Общий объем препаратов в растворе',
    finalRate: 'Конечная скорость подачи',
    saline: 'Добавить физ. раствор',
  },
  syringeWarning: 'Взять шприц большего объема или сократить длительность ИПС.',
} as const

const numberInputDefaults: NumberInputs = {
  durationHours: '3',
  durationMinutes: '0',
  fentanylRateMcgKgMin: '0.02',
  ketamineRateMcgKgMin: '10',
  lidocaineRateMcgKgMin: '17',
  syringeSizeMl: '20',
  weightKg: '',
}

const lidocaineConcentrationOptions = [
  {
    id: 'flk-lidocaine-20',
    label: 'Лидокаин 20 мг/мл',
    value: '20',
  },
  {
    id: 'flk-lidocaine-100',
    label: 'Лидокаин 100 мг/мл',
    value: '100',
  },
] as const

const lidocaineConcentrationSet = new Set<LidocaineConcentrationMgMl>([20, 100])
const speciesSet = new Set<FlkSpecies>(['cat', 'dog'])

const speciesOptions = [
  {
    id: 'flk-species-cat',
    label: flkSpeciesLabels.cat,
    value: 'cat',
  },
  {
    id: 'flk-species-dog',
    label: flkSpeciesLabels.dog,
    value: 'dog',
  },
] as const

const numberInputPatterns = {
  durationHours: /^\d*$/,
  durationMinutes: /^\d{0,2}$/,
  fentanylRateMcgKgMin: /^\d*(?:\.\d{0,2})?$/,
  ketamineRateMcgKgMin: /^\d*$/,
  lidocaineRateMcgKgMin: /^\d*$/,
  syringeSizeMl: /^\d*$/,
  weightKg: /^\d*(?:\.\d{0,2})?$/,
} as const satisfies Record<NumberFieldKey, RegExp>

const flkStyles = {
  resultTable: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 0.9fr 0.9fr',
    gap: '1px',
    border: '1px solid #9ee3dd',
    backgroundColor: '#9ee3dd',
    fontSize: '11px',
    fontWeight: 700,
    lineHeight: 1.25,
  },
  resultCell: {
    minHeight: '34px',
    padding: '7px 6px',
    backgroundColor: '#0a2a3a',
    color: '#d8f3f2',
    display: 'flex',
    alignItems: 'center',
  },
  resultCellWarn: {
    minHeight: '34px',
    padding: '7px 6px',
    backgroundColor: '#3b1c19',
    color: '#ffb4a8',
    display: 'flex',
    alignItems: 'center',
  },
  resultHeader: {
    minHeight: '30px',
    padding: '7px 6px',
    backgroundColor: '#0d4b5f',
    color: '#f6fbfc',
    display: 'flex',
    alignItems: 'center',
  },
  inlineFields: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
} as const satisfies Record<string, CSSProperties>

const readNumberInput = (value: string): number | undefined => {
  if (value === '') return undefined

  const parsedValue = Number(value.replace(',', '.'))

  return Number.isFinite(parsedValue) ? parsedValue : undefined
}

const getDoseDigits = (value: number) => {
  if (value > 0 && value < 0.1) return 4
  if (value > 0 && value < 1) return 3

  return 2
}

const formatDose = (value: number) => formatFlkNumber(value, getDoseDigits(value))

const readLidocaineConcentration = (value: string): LidocaineConcentrationMgMl | undefined => {
  const nextValue = Number(value)

  return lidocaineConcentrationSet.has(nextValue as LidocaineConcentrationMgMl)
    ? nextValue as LidocaineConcentrationMgMl
    : undefined
}

const readSpecies = (value: string): FlkSpecies | undefined => (
  speciesSet.has(value as FlkSpecies) ? value as FlkSpecies : undefined
)

function FlkDrugResultTable({ drugs }: { drugs: readonly FlkDrugResult[] }) {
  return (
    <section
      aria-label="Расчет препаратов FLK"
      style={flkStyles.resultTable}
    >
      <span style={flkStyles.resultHeader}>Препарат</span>
      <span style={flkStyles.resultHeader}>Количество</span>
      <span style={flkStyles.resultHeader}>Объем</span>
      <span style={flkStyles.resultHeader}>Оценка</span>

      {drugs.flatMap((drug) => [
        <span
          key={`${drug.definition.id}-label`}
          style={flkStyles.resultCell}
        >
          {drug.definition.label}
        </span>,
        <span
          key={`${drug.definition.id}-dose`}
          style={flkStyles.resultCell}
        >
          {formatDose(drug.totalDoseMg)} мг
        </span>,
        <span
          key={`${drug.definition.id}-volume`}
          style={flkStyles.resultCell}
        >
          {formatFlkNumber(drug.volumeMl)} мл
        </span>,
        <span
          key={`${drug.definition.id}-status`}
          style={drug.isHighRate ? flkStyles.resultCellWarn : flkStyles.resultCell}
        >
          {drug.isHighRate ? 'высокая доза' : '-'}
        </span>,
      ])}
    </section>
  )
}

export default function FlkPage() {
  const [inputs, setInputs] = useState<NumberInputs>(numberInputDefaults)
  const [lidocaineConcentrationMgMl, setLidocaineConcentrationMgMl] =
    useState<LidocaineConcentrationMgMl>(20)
  const [species, setSpecies] = useState<FlkSpecies>()

  const numericValues = useMemo(() => ({
    durationHours: readNumberInput(inputs.durationHours),
    durationMinutes: readNumberInput(inputs.durationMinutes),
    fentanylRateMcgKgMin: readNumberInput(inputs.fentanylRateMcgKgMin),
    ketamineRateMcgKgMin: readNumberInput(inputs.ketamineRateMcgKgMin),
    lidocaineConcentrationMgMl,
    lidocaineRateMcgKgMin: readNumberInput(inputs.lidocaineRateMcgKgMin),
    syringeSizeMl: readNumberInput(inputs.syringeSizeMl),
    weightKg: readNumberInput(inputs.weightKg),
  }), [inputs, lidocaineConcentrationMgMl])

  const result = useMemo(() => calculateFlk(numericValues), [numericValues])

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

    setInputs((prev) => ({
      ...prev,
      [key]: e.target.value,
    }))
  }

  const handleLidocaineConcentrationChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextConcentration = readLidocaineConcentration(e.target.value)

    if (nextConcentration !== undefined) {
      setLidocaineConcentrationMgMl(nextConcentration)
    }
  }

  const handleSpeciesChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSpecies(readSpecies(e.target.value))
  }

  const highDoseWarning = result?.drugs
    .filter((drug) => drug.isHighRate)
    .map((drug) => drug.definition.label)
    .join(', ')

  const resultText = result === undefined
    ? undefined
    : `${names.resultLabels.drugVolume}: ${formatFlkNumber(result.drugVolumeMl)} мл
${names.resultLabels.saline}: ${result.salineVolumeMl >= 0 ? `${formatFlkNumber(result.salineVolumeMl)} мл` : `не хватает ${formatFlkNumber(Math.abs(result.salineVolumeMl))} мл`}
${names.resultLabels.finalRate}: ${formatFlkNumber(result.finalRateMlHour)} мл/ч`

  const doseRangesText = species === undefined
    ? 'Выберите вид животного, чтобы увидеть подсказки по дозам.'
    : `Диапазон доз препаратов для ИПС:
${flkDrugDefinitions.map((drug) => `${drug.label}: ${getFlkDoseRangeLabel(drug, species)}`).join('\n')}

Концентрации препаратов:
Фентанил: 0.05 мг/мл
Лидокаин: ${lidocaineConcentrationMgMl} мг/мл
Кетамин: 100 мг/мл`

  const loadingDosesText = result === undefined
    ? undefined
    : `Нагрузочные дозы:
${result.drugs.map((drug) => `${drug.definition.label} ${drug.definition.routeLabel}: ${drug.loadingDoses.map((dose) => `${formatDose(dose.doseMgKg)} мг/кг = ${formatFlkNumber(dose.volumeMl)} мл`).join('; ')}`).join('\n')}`

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
      <div style={flkStyles.inlineFields}>
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

      <CalculatorDescription>
        Скорость введения дозы
      </CalculatorDescription>

      <CalculatorNumberField
        label={names.labels.fentanylRateMcgKgMin}
        min="0"
        step="0.01"
        value={inputs.fentanylRateMcgKgMin}
        onChange={(e) => handleNumberChange(e, 'fentanylRateMcgKgMin')}
      />
      <CalculatorDescription>
        {getFlkDoseHint(flkDrugById.get('fentanyl')!, species)}
      </CalculatorDescription>
      <CalculatorNumberField
        label={names.labels.lidocaineRateMcgKgMin}
        min="0"
        step="1"
        value={inputs.lidocaineRateMcgKgMin}
        onChange={(e) => handleNumberChange(e, 'lidocaineRateMcgKgMin')}
      />
      <CalculatorDescription>
        {getFlkDoseHint(flkDrugById.get('lidocaine')!, species)}
      </CalculatorDescription>
      <CalculatorSelectField
        label={names.labels.lidocaineConcentration}
        options={lidocaineConcentrationOptions}
        value={String(lidocaineConcentrationMgMl)}
        onChange={handleLidocaineConcentrationChange}
      />
      <CalculatorNumberField
        label={names.labels.ketamineRateMcgKgMin}
        min="0"
        step="1"
        value={inputs.ketamineRateMcgKgMin}
        onChange={(e) => handleNumberChange(e, 'ketamineRateMcgKgMin')}
      />
      <CalculatorDescription>
        {getFlkDoseHint(flkDrugById.get('ketamine')!, species)}
      </CalculatorDescription>

      <CalculatorPanel>{doseRangesText}</CalculatorPanel>

      {result !== undefined &&
        <FlkDrugResultTable drugs={result.drugs} />}

      <CalculatorResult
        align="start"
        multiline
      >
        {resultText}
      </CalculatorResult>

      <CalculatorError>
        {result !== undefined && result.salineVolumeMl < 0 ? names.syringeWarning : undefined}
      </CalculatorError>

      <CalculatorError>
        {highDoseWarning ? `Проверьте дозы: ${highDoseWarning}.` : undefined}
      </CalculatorError>

      <CalculatorPanel>{loadingDosesText}</CalculatorPanel>
    </CalculatorForm>
  )
}
