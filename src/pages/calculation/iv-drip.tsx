import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import {
  calculateIvDripRate,
  dropFactorOptions,
  formatInfusionDuration,
  formatInfusionNumber,
  type InfusionSpeedUnit,
} from '../../domain/ivDripRate'
import AppScreen from '../../ui/AppScreen'
import './iv-drip.css'

type NumberFieldKey = 'volumeMl' | 'timeHours' | 'timeMinutes' | 'speed'
type NumberInputs = Record<NumberFieldKey, string>

const names = {
  title: 'Расчет капельного введения',
  labels: {
    volume: 'Общий объем, мл',
    timeHours: 'Время инфузии, часы',
    timeMinutes: 'Время инфузии, минуты',
    speed: 'Скорость инфузии',
    speedUnit: 'Единица скорости',
    dropFactor: 'Фактор капель / Drop Factor',
  },
  descriptions: {
    time: 'Если время не заполнено, расчет проходит по объему и скорости.',
    speed: 'Если скорость не заполнена, расчет проходит объему и времени.',
  },
  factorColumns: {
    system: 'Тип системы',
    factor: 'Фактор',
    usage: 'Применение',
  },
  resultLabels: {
    tempo: 'Темп',
    interval: 'Интервал',
    pump: 'Инфузомат',
    time: 'Время',
    factor: 'Drop Factor',
  },
} as const

const numberInputDefaults: NumberInputs = {
  volumeMl: '',
  timeHours: '',
  timeMinutes: '',
  speed: '',
}

const speedUnitOptions = [
  {
    id: 'infusion-speed-ml-hour',
    label: 'мл/ч',
    value: 'mlPerHour',
  },
  {
    id: 'infusion-speed-drops-minute',
    label: 'кап/мин',
    value: 'dropsPerMinute',
  },
] as const

const dropFactorSelectOptions = dropFactorOptions.map((option) => ({
  id: `drop-factor-${option.value}`,
  label: `${option.value} кап/мл`,
  value: String(option.value),
}))

const decimalNumberPattern = /^\d*(?:\.\d{0,2})?$/

const readNumberInput = (value: string): number | undefined => {
  if (value === '') return undefined

  const parsedValue = Number(value.replace(',', '.'))

  return Number.isFinite(parsedValue) ? parsedValue : undefined
}

const isSpeedUnit = (value: string): value is InfusionSpeedUnit => (
  value === 'mlPerHour' || value === 'dropsPerMinute'
)

type NumberFieldProps = {
  label: string
  min: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  step: string
  value: string
}

type SelectFieldProps = {
  label: string
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
  options: readonly {
    id: string
    label: string
    value: string
  }[]
  value: string | number
}

type TimeFieldProps = {
  hoursValue: string
  minutesValue: string
  onHoursChange: (event: ChangeEvent<HTMLInputElement>) => void
  onMinutesChange: (event: ChangeEvent<HTMLInputElement>) => void
}

function IvDripTimeField({
  hoursValue,
  minutesValue,
  onHoursChange,
  onMinutesChange,
}: TimeFieldProps) {
  return (
    <section
      aria-labelledby="iv-drip-time-title"
      className="app-iv-drip-time-card"
      role="group"
    >
      <h2 id="iv-drip-time-title">Время инфузии</h2>
      <div className="app-iv-drip-time-grid">
        <label>
          <span>часы</span>
          <input
            aria-label={names.labels.timeHours}
            min="0"
            onChange={onHoursChange}
            step="1"
            type="number"
            value={hoursValue}
          />
        </label>
        <label>
          <span>минуты</span>
          <input
            aria-label={names.labels.timeMinutes}
            min="0"
            onChange={onMinutesChange}
            step="1"
            type="number"
            value={minutesValue}
          />
        </label>
      </div>
    </section>
  )
}

function IvDripNumberField({
  label,
  min,
  onChange,
  step,
  value,
}: NumberFieldProps) {
  return (
    <label className="app-iv-drip-field">
      <span>{label}</span>
      <input
        min={min}
        onChange={onChange}
        step={step}
        type="number"
        value={value}
      />
    </label>
  )
}

function IvDripSelectField({
  label,
  onChange,
  options,
  value,
}: SelectFieldProps) {
  return (
    <label className="app-iv-drip-field">
      <span>{label}</span>
      <select onChange={onChange} value={value}>
        {options.map((option) => (
          <option
            id={option.id}
            key={option.id}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function IvDripNote({ children }: { children: ReactNode }) {
  return <span className="app-iv-drip-note">{children}</span>
}

export default function IvDripPage() {
  const [inputs, setInputs] = useState<NumberInputs>(numberInputDefaults)
  const [speedUnit, setSpeedUnit] = useState<InfusionSpeedUnit>('mlPerHour')
  const [dropFactor, setDropFactor] = useState<number>(dropFactorOptions[2].value)
  const [isFactorHelpOpen, setIsFactorHelpOpen] = useState(false)
  const factorHelpRef = useRef<HTMLDivElement | null>(null)

  const numericValues = useMemo(() => ({
    speed: readNumberInput(inputs.speed),
    timeHours: readNumberInput(inputs.timeHours),
    timeMinutes: readNumberInput(inputs.timeMinutes),
    volumeMl: readNumberInput(inputs.volumeMl),
  }), [inputs])

  const result = useMemo(() => calculateIvDripRate({
    ...numericValues,
    dropFactor,
    speedUnit,
  }), [dropFactor, numericValues, speedUnit])

  useEffect(() => {
    if (!isFactorHelpOpen) {
      return undefined
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node) || !factorHelpRef.current?.contains(target)) {
        setIsFactorHelpOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isFactorHelpOpen])

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

  const handleSpeedUnitChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (isSpeedUnit(e.target.value)) {
      setSpeedUnit(e.target.value)
    }
  }

  const handleDropFactorChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextDropFactor = Number(e.target.value)

    if (Number.isFinite(nextDropFactor) && nextDropFactor > 0) {
      setDropFactor(nextDropFactor)
    }
  }

  const dropAnimationDuration = result === undefined
    ? undefined
    : `${Math.max(result.secondsPerDrop, 0.25)}s`

  const resultText = result === undefined
    ? undefined
    : `${names.resultLabels.tempo}: ${result.roundedDropsPerMinute} кап/мин
${names.resultLabels.interval}: 1 капля каждые ${formatInfusionNumber(result.secondsPerDrop)} сек
${names.resultLabels.pump}: ${formatInfusionNumber(result.mlPerHour)} мл/ч
${names.resultLabels.time}: ${formatInfusionDuration(result.totalTimeMinutes)}
${names.resultLabels.factor}: ${dropFactor} кап/мл`

  return (
    <AppScreen
      ariaLabel="Расчет капельного введения VetTools"
      backLabel="Назад на главную"
      backTo="/home"
      screenClassName="app-iv-drip-screen"
      title={names.title}
    >
      <style>
        {`@keyframes infusionDrop {
          0% { opacity: 0; top: 166px; }
          12% { opacity: 1; }
          78% { opacity: 1; top: 194px; }
          100% { opacity: 0; top: 194px; }
        }`}
      </style>

      <form
        className="app-iv-drip-scroll"
        onSubmit={(event) => event.preventDefault()}
      >
            <IvDripNumberField
              label={names.labels.volume}
              min="0"
              step="0.01"
              value={inputs.volumeMl}
              onChange={(e) => handleNumberChange(e, 'volumeMl')}
            />

            <IvDripNote>{names.descriptions.time}</IvDripNote>
            <IvDripTimeField
              hoursValue={inputs.timeHours}
              minutesValue={inputs.timeMinutes}
              onHoursChange={(e) => handleNumberChange(e, 'timeHours')}
              onMinutesChange={(e) => handleNumberChange(e, 'timeMinutes')}
            />

            <IvDripNote>{names.descriptions.speed}</IvDripNote>
            <IvDripNumberField
              label={names.labels.speed}
              min="0"
              step="0.01"
              value={inputs.speed}
              onChange={(e) => handleNumberChange(e, 'speed')}
            />
            <IvDripSelectField
              label={names.labels.speedUnit}
              options={speedUnitOptions}
              value={speedUnit}
              onChange={handleSpeedUnitChange}
            />

            <div
              className="app-iv-drip-factor-control"
              ref={factorHelpRef}
            >
              <span className="app-iv-drip-factor-label-row">
                <label htmlFor="drop-factor-select">
                  {names.labels.dropFactor}
                </label>
                <button
                  aria-controls="drop-factor-help"
                  aria-expanded={isFactorHelpOpen}
                  aria-label="Показать справку по Drop Factor"
                  className="app-iv-drip-help-button"
                  type="button"
                  onClick={() => setIsFactorHelpOpen((isOpen) => !isOpen)}
                >
                  ?
                </button>
              </span>
              <select
                id="drop-factor-select"
                className="app-iv-drip-select"
                value={dropFactor}
                onChange={handleDropFactorChange}
              >
                {dropFactorSelectOptions.map((option) => (
                  <option
                    id={option.id}
                    key={option.id}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              {isFactorHelpOpen ? (
                <div
                  aria-label="Справка по Drop Factor"
                  className="app-iv-drip-help-popup"
                  id="drop-factor-help"
                  role="dialog"
                >
                  <span className="app-iv-drip-factor-table">
                    <span className="app-iv-drip-factor-header">{names.factorColumns.system}</span>
                    <span className="app-iv-drip-factor-header">{names.factorColumns.factor}</span>
                    <span className="app-iv-drip-factor-header">{names.factorColumns.usage}</span>
                    {dropFactorOptions.flatMap((option) => [
                      <span
                        className="app-iv-drip-factor-cell"
                        key={`${option.value}-system`}
                      >
                        {option.system}
                      </span>,
                      <span
                        className="app-iv-drip-factor-cell"
                        key={`${option.value}-factor`}
                      >
                        {option.value}
                      </span>,
                      <span
                        className="app-iv-drip-factor-cell"
                        key={`${option.value}-usage`}
                      >
                        {option.usage}
                      </span>,
                    ])}
                  </span>
                </div>
              ) : null}
            </div>

            {result !== undefined ? (
              <section
                aria-label="Визуализация капельного введения"
                className="app-iv-drip-visualization"
              >
                <span className="app-iv-drip-bag">
                  <span className="app-iv-drip-bag-cap" aria-hidden="true" />
                  <span className="app-iv-drip-bottle-fluid" />
                  <span className="app-iv-drip-bag-glare" aria-hidden="true" />
                </span>
                <span className="app-iv-drip-port" aria-hidden="true" />
                <span className="app-iv-drip-line app-iv-drip-line--upper" aria-hidden="true" />
                <span className="app-iv-drip-chamber" />
                <span
                  aria-hidden="true"
                  className="app-iv-drip-drop"
                  style={{
                    animation: `infusionDrop ${dropAnimationDuration} linear infinite`,
                  }}
                />
                <span className="app-iv-drip-chamber-fluid" aria-hidden="true" />
                <span className="app-iv-drip-line app-iv-drip-line--lower" aria-hidden="true" />
              </section>
            ) : null}

            {resultText !== undefined ? (
              <section className="app-iv-drip-result" aria-label="Результат расчета">
                {resultText}
              </section>
            ) : null}
          </form>
    </AppScreen>
  )
}
