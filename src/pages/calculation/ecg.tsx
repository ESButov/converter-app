import { useMemo, useState, type ChangeEvent, type CSSProperties } from 'react'
import {
  calculateEcg,
  formatEcgNumber,
  type EcgInput,
  type EcgSpecies,
} from '../../domain/ecg'
import {
  CalculatorDescription,
  CalculatorForm,
  CalculatorResult,
  CalculatorSelectField,
} from '../../ui/CalculatorForm'

type NumberFieldKey =
  | 'pAmplitudeMm'
  | 'pDurationMm'
  | 'qAmplitudeMm'
  | 'qrsDurationMm'
  | 'qtIntervalMm'
  | 'rAmplitudeMm'
  | 'rrIntervalMm'
  | 'sAmplitudeMm'
  | 'stDeviationMm'
  | 'tAmplitudeMm'

type NumberInputs = Record<NumberFieldKey, string>

const names = {
  title: 'ЭКГ',
  labels: {
    pAmplitudeMm: 'P высота, мм',
    pDurationMm: 'P ширина, мм',
    qAmplitudeMm: 'Q, мм',
    qrsDurationMm: 'QRS, мм',
    qtIntervalMm: 'QT, мм',
    rAmplitudeMm: 'R, мм',
    rrIntervalMm: 'R-R, мм',
    sAmplitudeMm: 'S, мм',
    species: 'Вид животного',
    speed: 'Скорость, мм/с',
    stDeviationMm: 'ST, мм',
    tAmplitudeMm: 'T, мм',
    voltage: 'Вольтаж, мм/1 мВ',
  },
  sections: {
    amplitudes: 'Амплитуды',
    calibration: 'Настройки записи',
    durations: 'Временные интервалы',
  },
  resultLabels: {
    heartRate: 'ЧСС',
    p: 'P',
    q: 'Q',
    qrs: 'QRS',
    qt: 'QT',
    r: 'R',
    s: 'S',
    st: 'ST',
    t: 'T',
  },
} as const

const STANDARD_SPEED_MM_SEC = 50
const STANDARD_VOLTAGE_MM_PER_MV = 10

const speciesOptions = [
  {
    id: 'ecg-species-cat',
    label: 'Кошка',
    value: 'cat',
  },
  {
    id: 'ecg-species-dog',
    label: 'Собака',
    value: 'dog',
  },
] as const

const speedOptions = [
  {
    id: 'ecg-speed-25',
    label: '25',
    value: '25',
  },
  {
    id: 'ecg-speed-50',
    label: '50',
    value: '50',
  },
  {
    id: 'ecg-speed-75',
    label: '75',
    value: '75',
  },
  {
    id: 'ecg-speed-100',
    label: '100',
    value: '100',
  },
] as const

const voltageOptions = [
  {
    id: 'ecg-voltage-5',
    label: '5',
    value: '5',
  },
  {
    id: 'ecg-voltage-10',
    label: '10',
    value: '10',
  },
  {
    id: 'ecg-voltage-20',
    label: '20',
    value: '20',
  },
] as const

const numberInputDefaults: NumberInputs = {
  pAmplitudeMm: '',
  pDurationMm: '',
  qAmplitudeMm: '',
  qrsDurationMm: '',
  qtIntervalMm: '',
  rAmplitudeMm: '',
  rrIntervalMm: '',
  sAmplitudeMm: '',
  stDeviationMm: '',
  tAmplitudeMm: '',
}

const decimalNumberPattern = /^\d*(?:\.\d{0,2})?$/
const speciesSet = new Set<EcgSpecies>(['dog', 'cat'])

const ecgStyles = {
  rows: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '86px minmax(76px, 1fr) minmax(98px, 1.1fr)',
    alignItems: 'center',
    gap: '8px',
  },
  rowLabel: {
    color: '#f6fbfc',
    fontSize: '14px',
    fontWeight: 700,
    lineHeight: 1.15,
  },
  rowInput: {
    width: '100%',
    height: '30px',
    padding: '2px 8px',
    border: '1.5px solid #d8f3f2',
    borderRadius: 0,
    backgroundColor: '#0a2a3a',
    color: '#f6fbfc',
    fontSize: '16px',
    fontWeight: 700,
    textAlign: 'center',
    outline: 'none',
    boxSizing: 'border-box',
  },
  rowResult: {
    minHeight: '30px',
    padding: '5px 8px',
    border: '1px solid #9ee3dd',
    backgroundColor: '#0a2a3a',
    boxSizing: 'border-box',
    color: '#d8f3f2',
    fontSize: '13px',
    fontWeight: 700,
    lineHeight: 1.25,
    textAlign: 'center',
  },
} as const satisfies Record<string, CSSProperties>

type EcgMeasurementRowProps = {
  inputId: string
  label: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  result?: string
  value: string
}

const readNumberInput = (value: string): number | undefined => {
  if (value === '') return undefined

  const parsedValue = Number(value.replace(',', '.'))

  return Number.isFinite(parsedValue) ? parsedValue : undefined
}

const isEcgSpecies = (value: string): value is EcgSpecies => (
  speciesSet.has(value as EcgSpecies)
)

const hasValue = (value: number | undefined): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value)
)

const hasPositiveValue = (value: number | undefined): value is number => (
  hasValue(value) && value > 0
)

const formatMeasurement = (
  value: number | undefined,
  unit: string,
  digits = 1,
) => (
  hasValue(value) ? `${formatEcgNumber(value, digits)} ${unit}` : undefined
)

const joinDefined = (parts: Array<string | undefined>) => (
  parts.filter(Boolean).join(' / ')
)

const normalizeDurationMmToStandard = (
  mm: number | undefined,
  speedMmSec: number | undefined,
) => (
  hasValue(mm) && hasPositiveValue(speedMmSec)
    ? mm * STANDARD_SPEED_MM_SEC / speedMmSec
    : undefined
)

const normalizeAmplitudeMmToStandard = (
  mm: number | undefined,
  voltageMmPerMv: number | undefined,
) => (
  hasValue(mm) && hasPositiveValue(voltageMmPerMv)
    ? mm * STANDARD_VOLTAGE_MM_PER_MV / voltageMmPerMv
    : undefined
)

function EcgMeasurementRow({
  inputId,
  label,
  onChange,
  result,
  value,
}: EcgMeasurementRowProps) {
  return (
    <div style={ecgStyles.row}>
      <label
        htmlFor={inputId}
        style={ecgStyles.rowLabel}
      >
        {label}
      </label>
      <input
        id={inputId}
        min="0"
        step="0.1"
        style={ecgStyles.rowInput}
        type="number"
        value={value}
        onChange={onChange}
      />
      <span style={ecgStyles.rowResult}>{result ?? '-'}</span>
    </div>
  )
}

export default function EcgPage() {
  const [inputs, setInputs] = useState<NumberInputs>(numberInputDefaults)
  const [species, setSpecies] = useState<EcgSpecies>()
  const [speedMmSec, setSpeedMmSec] = useState('50')
  const [voltageMmPerMv, setVoltageMmPerMv] = useState('10')

  const numericValues = useMemo(() => ({
    pAmplitudeMm: readNumberInput(inputs.pAmplitudeMm),
    pDurationMm: readNumberInput(inputs.pDurationMm),
    qAmplitudeMm: readNumberInput(inputs.qAmplitudeMm),
    qrsDurationMm: readNumberInput(inputs.qrsDurationMm),
    qtIntervalMm: readNumberInput(inputs.qtIntervalMm),
    rAmplitudeMm: readNumberInput(inputs.rAmplitudeMm),
    rrIntervalMm: readNumberInput(inputs.rrIntervalMm),
    sAmplitudeMm: readNumberInput(inputs.sAmplitudeMm),
    speedMmSec: readNumberInput(speedMmSec),
    stDeviationMm: readNumberInput(inputs.stDeviationMm),
    tAmplitudeMm: readNumberInput(inputs.tAmplitudeMm),
    voltageMmPerMv: readNumberInput(voltageMmPerMv),
  }), [inputs, speedMmSec, voltageMmPerMv])

  const result = useMemo(() => calculateEcg(numericValues), [numericValues])
  const standardNumericValues = useMemo(() => ({
    pAmplitudeMm: normalizeAmplitudeMmToStandard(
      numericValues.pAmplitudeMm,
      numericValues.voltageMmPerMv,
    ),
    pDurationMm: normalizeDurationMmToStandard(
      numericValues.pDurationMm,
      numericValues.speedMmSec,
    ),
    qAmplitudeMm: normalizeAmplitudeMmToStandard(
      numericValues.qAmplitudeMm,
      numericValues.voltageMmPerMv,
    ),
    qrsDurationMm: normalizeDurationMmToStandard(
      numericValues.qrsDurationMm,
      numericValues.speedMmSec,
    ),
    qtIntervalMm: normalizeDurationMmToStandard(
      numericValues.qtIntervalMm,
      numericValues.speedMmSec,
    ),
    rAmplitudeMm: normalizeAmplitudeMmToStandard(
      numericValues.rAmplitudeMm,
      numericValues.voltageMmPerMv,
    ),
    rrIntervalMm: normalizeDurationMmToStandard(
      numericValues.rrIntervalMm,
      numericValues.speedMmSec,
    ),
    sAmplitudeMm: normalizeAmplitudeMmToStandard(
      numericValues.sAmplitudeMm,
      numericValues.voltageMmPerMv,
    ),
    speedMmSec: STANDARD_SPEED_MM_SEC,
    stDeviationMm: normalizeAmplitudeMmToStandard(
      numericValues.stDeviationMm,
      numericValues.voltageMmPerMv,
    ),
    tAmplitudeMm: normalizeAmplitudeMmToStandard(
      numericValues.tAmplitudeMm,
      numericValues.voltageMmPerMv,
    ),
    voltageMmPerMv: STANDARD_VOLTAGE_MM_PER_MV,
  }) satisfies EcgInput, [numericValues])
  const standardResult = useMemo(() => calculateEcg(standardNumericValues), [standardNumericValues])

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
    setSpecies(isEcgSpecies(e.target.value) ? e.target.value : undefined)
  }

  const measurementResults: Record<NumberFieldKey, string | undefined> = {
    pAmplitudeMm: formatMeasurement(result?.pAmplitudeMv, 'мВ', 2),
    pDurationMm: formatMeasurement(result?.pDurationMs, 'мс'),
    qAmplitudeMm: formatMeasurement(result?.qAmplitudeMv, 'мВ', 2),
    qrsDurationMm: formatMeasurement(result?.qrsDurationMs, 'мс'),
    qtIntervalMm: formatMeasurement(result?.qtIntervalMs, 'мс'),
    rAmplitudeMm: formatMeasurement(result?.rAmplitudeMv, 'мВ', 2),
    rrIntervalMm: formatMeasurement(result?.heartRateBpm, 'уд/мин', 0),
    sAmplitudeMm: formatMeasurement(result?.sAmplitudeMv, 'мВ', 2),
    stDeviationMm: formatMeasurement(result?.stDeviationMv, 'мВ', 2),
    tAmplitudeMm: formatMeasurement(result?.tAmplitudeMv, 'мВ', 2),
  }

  const resultText = useMemo(() => {
    if (standardResult === undefined) {
      return undefined
    }

    const heartRate = formatMeasurement(standardResult.heartRateBpm, 'уд/мин', 0)
    const pResult = joinDefined([
      formatMeasurement(standardResult.pDurationMs, 'мс'),
      formatMeasurement(standardResult.pAmplitudeMv, 'мВ', 2),
    ])
    const qrsDuration = formatMeasurement(standardResult.qrsDurationMs, 'мс')
    const qAmplitude = formatMeasurement(standardResult.qAmplitudeMv, 'мВ', 2)
    const rAmplitude = formatMeasurement(standardResult.rAmplitudeMv, 'мВ', 2)
    const sAmplitude = formatMeasurement(standardResult.sAmplitudeMv, 'мВ', 2)
    const qtInterval = formatMeasurement(standardResult.qtIntervalMs, 'мс')
    const stDeviation = formatMeasurement(standardResult.stDeviationMv, 'мВ', 2)
    const tAmplitude = formatMeasurement(standardResult.tAmplitudeMv, 'мВ', 2)

    const rows = [
      heartRate === undefined ? undefined : `${names.resultLabels.heartRate}: ${heartRate}`,
      pResult === '' ? undefined : `${names.resultLabels.p}: ${pResult}`,
      qrsDuration === undefined ? undefined : `${names.resultLabels.qrs}: ${qrsDuration}`,
      qAmplitude === undefined ? undefined : `${names.resultLabels.q}: ${qAmplitude}`,
      rAmplitude === undefined ? undefined : `${names.resultLabels.r}: ${rAmplitude}`,
      sAmplitude === undefined ? undefined : `${names.resultLabels.s}: ${sAmplitude}`,
      qtInterval === undefined ? undefined : `${names.resultLabels.qt}: ${qtInterval}`,
      stDeviation === undefined ? undefined : `${names.resultLabels.st}: ${stDeviation}`,
      tAmplitude === undefined ? undefined : `${names.resultLabels.t}: ${tAmplitude}`,
    ].filter(Boolean)

    return rows.length > 0 ? `Заключение:\n${rows.join('\n')}` : undefined
  }, [standardResult])

  return (
    <CalculatorForm title={names.title}>
      <CalculatorDescription>{names.sections.calibration}</CalculatorDescription>
      <CalculatorSelectField
        label={names.labels.species}
        options={speciesOptions}
        value={species ?? ''}
        onChange={handleSpeciesChange}
      />
      <CalculatorSelectField
        label={names.labels.speed}
        options={speedOptions}
        value={speedMmSec}
        onChange={(e) => setSpeedMmSec(e.target.value)}
      />
      <CalculatorSelectField
        label={names.labels.voltage}
        options={voltageOptions}
        value={voltageMmPerMv}
        onChange={(e) => setVoltageMmPerMv(e.target.value)}
      />

      <CalculatorDescription>{names.sections.durations}</CalculatorDescription>
      <div style={ecgStyles.rows}>
        <EcgMeasurementRow
          inputId="ecg-rr-interval-mm"
          label={names.labels.rrIntervalMm}
          result={measurementResults.rrIntervalMm}
          value={inputs.rrIntervalMm}
          onChange={(e) => handleNumberChange(e, 'rrIntervalMm')}
        />
        <EcgMeasurementRow
          inputId="ecg-p-duration-mm"
          label={names.labels.pDurationMm}
          result={measurementResults.pDurationMm}
          value={inputs.pDurationMm}
          onChange={(e) => handleNumberChange(e, 'pDurationMm')}
        />
        <EcgMeasurementRow
          inputId="ecg-qrs-duration-mm"
          label={names.labels.qrsDurationMm}
          result={measurementResults.qrsDurationMm}
          value={inputs.qrsDurationMm}
          onChange={(e) => handleNumberChange(e, 'qrsDurationMm')}
        />
        <EcgMeasurementRow
          inputId="ecg-qt-interval-mm"
          label={names.labels.qtIntervalMm}
          result={measurementResults.qtIntervalMm}
          value={inputs.qtIntervalMm}
          onChange={(e) => handleNumberChange(e, 'qtIntervalMm')}
        />
      </div>

      <CalculatorDescription>{names.sections.amplitudes}</CalculatorDescription>
      <div style={ecgStyles.rows}>
        <EcgMeasurementRow
          inputId="ecg-p-amplitude-mm"
          label={names.labels.pAmplitudeMm}
          result={measurementResults.pAmplitudeMm}
          value={inputs.pAmplitudeMm}
          onChange={(e) => handleNumberChange(e, 'pAmplitudeMm')}
        />
        <EcgMeasurementRow
          inputId="ecg-q-amplitude-mm"
          label={names.labels.qAmplitudeMm}
          result={measurementResults.qAmplitudeMm}
          value={inputs.qAmplitudeMm}
          onChange={(e) => handleNumberChange(e, 'qAmplitudeMm')}
        />
        <EcgMeasurementRow
          inputId="ecg-r-amplitude-mm"
          label={names.labels.rAmplitudeMm}
          result={measurementResults.rAmplitudeMm}
          value={inputs.rAmplitudeMm}
          onChange={(e) => handleNumberChange(e, 'rAmplitudeMm')}
        />
        <EcgMeasurementRow
          inputId="ecg-s-amplitude-mm"
          label={names.labels.sAmplitudeMm}
          result={measurementResults.sAmplitudeMm}
          value={inputs.sAmplitudeMm}
          onChange={(e) => handleNumberChange(e, 'sAmplitudeMm')}
        />
        <EcgMeasurementRow
          inputId="ecg-st-deviation-mm"
          label={names.labels.stDeviationMm}
          result={measurementResults.stDeviationMm}
          value={inputs.stDeviationMm}
          onChange={(e) => handleNumberChange(e, 'stDeviationMm')}
        />
        <EcgMeasurementRow
          inputId="ecg-t-amplitude-mm"
          label={names.labels.tAmplitudeMm}
          result={measurementResults.tAmplitudeMm}
          value={inputs.tAmplitudeMm}
          onChange={(e) => handleNumberChange(e, 'tAmplitudeMm')}
        />
      </div>

      <CalculatorResult
        align="start"
        multiline
      >
        {resultText}
      </CalculatorResult>
    </CalculatorForm>
  )
}
