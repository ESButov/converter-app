import { useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties } from 'react'
import {
  calculateIvDripRate,
  dropFactorOptions,
  formatInfusionDuration,
  formatInfusionNumber,
  type InfusionSpeedUnit,
} from '../../domain/ivDripRate'
import {
  CalculatorDescription,
  CalculatorForm,
  CalculatorNumberField,
  CalculatorResult,
  CalculatorSelectField,
} from '../../ui/CalculatorForm'

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
    time: 'Если время оставить пустым, оно будет рассчитано по общему объему и скорости.',
    speed: 'Если скорость оставить пустой, она будет рассчитана по общему объему и времени.',
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

const dripStyles = {
  inlineFields: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  factorTable: {
    display: 'grid',
    gridTemplateColumns: '1.3fr 58px 1.7fr',
    gap: '1px',
    border: '1px solid #9ee3dd',
    backgroundColor: '#9ee3dd',
    color: '#f6fbfc',
    fontSize: '10px',
    fontWeight: 700,
    lineHeight: 1.25,
  },
  factorCell: {
    padding: '6px',
    backgroundColor: '#0a2a3a',
  },
  factorHeader: {
    padding: '6px',
    backgroundColor: '#0d4b5f',
    color: '#f6fbfc',
  },
  factorControl: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '9px',
    fontSize: '16px',
    lineHeight: '1.2',
    fontWeight: 700,
  },
  factorLabelRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    color: '#f6fbfc',
  },
  factorSelect: {
    width: '100%',
    height: '30px',
    padding: '2px 10px',
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
  helpButton: {
    width: '24px',
    height: '24px',
    padding: 0,
    border: '1.5px solid #d8f3f2',
    borderRadius: '50%',
    backgroundColor: '#0a2a3a',
    color: '#d8f3f2',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 800,
    lineHeight: 1,
  },
  helpPopup: {
    position: 'absolute',
    top: '60px',
    right: 0,
    left: 0,
    zIndex: 5,
    padding: '10px',
    border: '1.5px solid #d8f3f2',
    backgroundColor: '#082332',
    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.36)',
  },
  visualization: {
    position: 'relative',
    height: '156px',
    border: '1px solid #9ee3dd',
    backgroundColor: '#061b27',
    overflow: 'hidden',
  },
  bottle: {
    position: 'absolute',
    top: '14px',
    left: '50%',
    width: '78px',
    height: '56px',
    border: '2px solid #d8f3f2',
    borderRadius: '5px 5px 10px 10px',
    transform: 'translateX(-50%)',
    backgroundColor: '#0a2a3a',
  },
  bottleFluid: {
    position: 'absolute',
    right: '7px',
    bottom: '7px',
    left: '7px',
    height: '25px',
    backgroundColor: '#8fded5',
    opacity: 0.6,
  },
  line: {
    position: 'absolute',
    top: '72px',
    left: '50%',
    width: '2px',
    height: '72px',
    backgroundColor: '#d8f3f2',
    transform: 'translateX(-50%)',
  },
  chamber: {
    position: 'absolute',
    top: '86px',
    left: '50%',
    width: '30px',
    height: '48px',
    border: '2px solid #d8f3f2',
    borderRadius: '14px',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(10, 42, 58, 0.7)',
  },
  drop: {
    position: 'absolute',
    top: '76px',
    left: '50%',
    width: '12px',
    height: '16px',
    borderRadius: '10px 10px 10px 2px',
    backgroundColor: '#8fded5',
    transform: 'translateX(-50%) rotate(45deg)',
    boxShadow: '0 0 10px rgba(143, 222, 213, 0.58)',
  },
  rhythm: {
    position: 'absolute',
    right: '14px',
    bottom: '12px',
    left: '14px',
    color: '#d8f3f2',
    fontSize: '12px',
    fontWeight: 700,
    lineHeight: 1.25,
    textAlign: 'center',
  },
} as const satisfies Record<string, CSSProperties>

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
    <CalculatorForm title={names.title}>
      <style>
        {`@keyframes infusionDrop {
          0% { opacity: 0; top: 76px; }
          12% { opacity: 1; }
          78% { opacity: 1; top: 120px; }
          100% { opacity: 0; top: 120px; }
        }`}
      </style>

      <CalculatorNumberField
        label={names.labels.volume}
        min="0"
        step="0.01"
        value={inputs.volumeMl}
        onChange={(e) => handleNumberChange(e, 'volumeMl')}
      />

      <CalculatorDescription>{names.descriptions.time}</CalculatorDescription>
      <div style={dripStyles.inlineFields}>
        <CalculatorNumberField
          label={names.labels.timeHours}
          min="0"
          step="1"
          value={inputs.timeHours}
          onChange={(e) => handleNumberChange(e, 'timeHours')}
        />
        <CalculatorNumberField
          label={names.labels.timeMinutes}
          min="0"
          step="1"
          value={inputs.timeMinutes}
          onChange={(e) => handleNumberChange(e, 'timeMinutes')}
        />
      </div>

      <CalculatorDescription>{names.descriptions.speed}</CalculatorDescription>
      <CalculatorNumberField
        label={names.labels.speed}
        min="0"
        step="0.01"
        value={inputs.speed}
        onChange={(e) => handleNumberChange(e, 'speed')}
      />
      <CalculatorSelectField
        label={names.labels.speedUnit}
        options={speedUnitOptions}
        value={speedUnit}
        onChange={handleSpeedUnitChange}
      />

      <div
        ref={factorHelpRef}
        style={dripStyles.factorControl}
      >
        <span style={dripStyles.factorLabelRow}>
          <label htmlFor="drop-factor-select">
            {names.labels.dropFactor}
          </label>
          <button
            aria-controls="drop-factor-help"
            aria-expanded={isFactorHelpOpen}
            aria-label="Показать справку по Drop Factor"
            style={dripStyles.helpButton}
            type="button"
            onClick={() => setIsFactorHelpOpen((isOpen) => !isOpen)}
          >
            ?
          </button>
        </span>
        <select
          id="drop-factor-select"
          style={dripStyles.factorSelect}
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

        {isFactorHelpOpen &&
          <div
            aria-label="Справка по Drop Factor"
            id="drop-factor-help"
            role="dialog"
            style={dripStyles.helpPopup}
          >
            <span style={dripStyles.factorTable}>
              <span style={dripStyles.factorHeader}>{names.factorColumns.system}</span>
              <span style={dripStyles.factorHeader}>{names.factorColumns.factor}</span>
              <span style={dripStyles.factorHeader}>{names.factorColumns.usage}</span>
              {dropFactorOptions.flatMap((option) => [
                <span
                  key={`${option.value}-system`}
                  style={dripStyles.factorCell}
                >
                  {option.system}
                </span>,
                <span
                  key={`${option.value}-factor`}
                  style={dripStyles.factorCell}
                >
                  {option.value}
                </span>,
                <span
                  key={`${option.value}-usage`}
                  style={dripStyles.factorCell}
                >
                  {option.usage}
                </span>,
              ])}
            </span>
          </div>}
      </div>

      {result !== undefined &&
        <section
          aria-label="Визуализация капельного введения"
          style={dripStyles.visualization}
        >
          <span style={dripStyles.bottle}>
            <span style={dripStyles.bottleFluid} />
          </span>
          <span style={dripStyles.line} />
          <span style={dripStyles.chamber} />
          <span
            aria-hidden="true"
            style={{
              ...dripStyles.drop,
              animation: `infusionDrop ${dropAnimationDuration} linear infinite`,
            }}
          />
          <span style={dripStyles.rhythm}>
            {result.roundedDropsPerMinute} кап/мин · {formatInfusionNumber(result.secondsPerDrop)} сек/капля
          </span>
        </section>}

      <CalculatorResult
        align="start"
        multiline
      >
        {resultText}
      </CalculatorResult>
    </CalculatorForm>
  )
}
