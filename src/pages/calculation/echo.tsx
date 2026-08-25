import { useMemo, useState, type ChangeEvent, type CSSProperties } from 'react'
import {
  calculateDogEchoDerivedValues,
  calculateEchoDerivedValues,
  catEchoIndicatorOrder,
  dogEchoIndicatorOrder,
  echoSpeciesKeys,
  ferretEchoIndicatorOrder,
  formatEchoNorm,
  getCatEchoNorms,
  getDogEchoNorms,
  getEchoIndicatorLabel,
  getEchoIndicatorUnit,
  getEchoStatus,
  getFerretEchoNorms,
  getHorseEchoNorms,
  horseEchoIndicatorOrder,
  ponyEchoIndicatorOrder,
  ponyEchoNorms,
  rabbitEchoIndicatorOrder,
  rabbitEchoNorms,
} from '../../domain/echoNorms'
import {
  CalculatorForm,
  CalculatorNumberField,
  CalculatorSelectField,
} from '../../ui/CalculatorForm'
import type {
  EchoIndicatorId,
  EchoMeasurements,
  EchoNorm,
  EchoSpecies,
  EchoStatus,
} from '../../domain/echoNorms'

type EchoNormLookup = Partial<Record<EchoIndicatorId, EchoNorm>>

type EchoStrategy = {
  label: string
  order: readonly EchoIndicatorId[]
  getNorms: (weightKg: number) => EchoNormLookup | undefined
  getMeasurements: (weightKg: number, measurements: EchoMeasurements) => EchoMeasurements
}

type MeasurementInputs = Partial<Record<EchoIndicatorId, string>>

const names = {
  title: 'Нормы ЭхоКГ',
  labels: {
    species: 'Вид животного',
    weight: 'Масса животного',
  },
  columns: {
    indicator: 'Показатель',
    value: 'Значение',
    norm: 'Норма',
  },
} as const

const speciesLabels: Record<EchoSpecies, string> = {
  cat: 'Кошка',
  dog: 'Собака',
  horse: 'Лошадь',
  pony: 'Пони',
  ferret: 'Хорек',
  rabbit: 'Кролик',
}

const echoSpeciesOptions = echoSpeciesKeys.map((key) => ({
  id: `echo-species-${key}`,
  label: speciesLabels[key],
  value: key,
}))

const echoSpeciesSet = new Set<EchoSpecies>(echoSpeciesKeys)

const echoStrategies: Record<EchoSpecies, EchoStrategy> = {
  cat: {
    label: speciesLabels.cat,
    order: catEchoIndicatorOrder,
    getNorms: getCatEchoNorms,
    getMeasurements: (_weightKg, measurements) => calculateEchoDerivedValues(measurements),
  },
  dog: {
    label: speciesLabels.dog,
    order: dogEchoIndicatorOrder,
    getNorms: getDogEchoNorms,
    getMeasurements: calculateDogEchoDerivedValues,
  },
  horse: {
    label: speciesLabels.horse,
    order: horseEchoIndicatorOrder,
    getNorms: getHorseEchoNorms,
    getMeasurements: (_weightKg, measurements) => calculateEchoDerivedValues(measurements),
  },
  pony: {
    label: speciesLabels.pony,
    order: ponyEchoIndicatorOrder,
    getNorms: () => ponyEchoNorms,
    getMeasurements: (_weightKg, measurements) => calculateEchoDerivedValues(measurements),
  },
  ferret: {
    label: speciesLabels.ferret,
    order: ferretEchoIndicatorOrder,
    getNorms: () => getFerretEchoNorms('unknown'),
    getMeasurements: (_weightKg, measurements) => calculateEchoDerivedValues(measurements),
  },
  rabbit: {
    label: speciesLabels.rabbit,
    order: rabbitEchoIndicatorOrder,
    getNorms: () => rabbitEchoNorms,
    getMeasurements: (_weightKg, measurements) => calculateEchoDerivedValues(measurements),
  },
}

const decimalWeightPattern = /^\d*(?:\.\d{0,3})?$/

const hasPositiveNumber = (value: unknown): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value > 0
)

const isEchoSpecies = (value: string): value is EchoSpecies => (
  echoSpeciesSet.has(value as EchoSpecies)
)

const readNumberInput = (value: string): number | undefined => {
  if (value === '') return undefined

  const parsedValue = Number(value.replace(',', '.'))

  return Number.isFinite(parsedValue) ? parsedValue : undefined
}

const formatEchoValue = (value: number | undefined) => (
  value === undefined || !Number.isFinite(value) ? '' : String(value)
)

const formatIndicatorLabel = (id: EchoIndicatorId, norm: EchoNorm | undefined) => {
  const label = norm?.label ?? getEchoIndicatorLabel(id)
  const unit = norm?.unit ?? getEchoIndicatorUnit(id)

  return unit ? `${label},${unit}` : label
}

const echoStyles = {
  table: {
    display: 'grid',
    gap: '8px',
  },
  headerRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(72px, 1fr) 80px 108px',
    gap: '8px',
    alignItems: 'center',
    color: '#b8d6da',
    fontSize: '11px',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'minmax(72px, 1fr) 80px 108px',
    gap: '8px',
    alignItems: 'center',
  },
  indicatorLabel: {
    color: '#f6fbfc',
    fontSize: '13px',
    fontWeight: 700,
    lineHeight: 1.15,
  },
  measurementInput: {
    width: '100%',
    height: '30px',
    padding: '2px 8px',
    border: '1.5px solid #d8f3f2',
    borderRadius: 0,
    backgroundColor: '#0a2a3a',
    color: '#f6fbfc',
    fontSize: '14px',
    fontWeight: 700,
    textAlign: 'center',
    outline: 'none',
    boxSizing: 'border-box',
  },
  measurementInputDisabled: {
    color: '#87aab1',
    opacity: 0.78,
  },
  normText: {
    minHeight: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px 6px',
    border: '1px solid #426b75',
    backgroundColor: '#061b27',
    color: '#d8f3f2',
    fontSize: '11px',
    fontWeight: 700,
    lineHeight: 1.15,
    textAlign: 'center',
    boxSizing: 'border-box',
  },
} as const satisfies Record<string, CSSProperties>

const statusStyles = {
  empty: {},
  normal: {
    borderColor: '#8fded5',
    backgroundColor: '#103a37',
    color: '#f0fffd',
    boxShadow: '0 0 0 1px rgba(143, 222, 213, 0.28)',
  },
  abnormal: {
    borderColor: '#ff9d8e',
    backgroundColor: '#3a1d24',
    color: '#fff3f0',
    boxShadow: '0 0 0 1px rgba(255, 157, 142, 0.28)',
  },
} as const satisfies Record<EchoStatus, CSSProperties>

export default function EchoPage() {
  const [selectedSpecies, setSelectedSpecies] = useState<EchoSpecies>()
  const [weightInput, setWeightInput] = useState('')
  const [weight, setWeight] = useState<number>()
  const [measurementInputs, setMeasurementInputs] = useState<MeasurementInputs>({})

  const strategy = useMemo(
    () => selectedSpecies ? echoStrategies[selectedSpecies] : undefined,
    [selectedSpecies],
  )

  const canCalculateNorms = hasPositiveNumber(weight)

  const norms = useMemo(() => {
    if (!strategy || !canCalculateNorms) return undefined

    return strategy.getNorms(weight)
  }, [canCalculateNorms, strategy, weight])

  const directMeasurements = useMemo((): EchoMeasurements => {
    const result: EchoMeasurements = {}

    Object.entries(measurementInputs).forEach(([id, input]) => {
      const value = readNumberInput(input)

      if (value !== undefined) {
        result[id as EchoIndicatorId] = value
      }
    })

    return result
  }, [measurementInputs])

  const calculatedMeasurements = useMemo((): EchoMeasurements => {
    if (!strategy || !canCalculateNorms) return {}

    return strategy.getMeasurements(weight, directMeasurements)
  }, [canCalculateNorms, directMeasurements, strategy, weight])

  const handleSpeciesSelection = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextSpecies = e.target.value

    setSelectedSpecies(isEchoSpecies(nextSpecies) ? nextSpecies : undefined)
    setMeasurementInputs({})
  }

  const handleWeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextInput = e.target.value
    const normalizedInput = nextInput.replace(',', '.')

    if (!decimalWeightPattern.test(normalizedInput)) {
      return
    }

    setWeightInput(nextInput)
    setWeight(readNumberInput(normalizedInput))
  }

  const handleMeasurementChange = (
    e: ChangeEvent<HTMLInputElement>,
    id: EchoIndicatorId,
  ) => {
    const nextInput = e.target.value

    setMeasurementInputs((prev) => ({
      ...prev,
      [id]: nextInput,
    }))
  }

  return (
    <CalculatorForm title={names.title}>
      <CalculatorSelectField
        label={names.labels.species}
        options={echoSpeciesOptions}
        value={selectedSpecies ?? ''}
        onChange={handleSpeciesSelection}
      />
      <CalculatorNumberField
        label={names.labels.weight}
        min="0"
        step="0.001"
        value={weightInput}
        onChange={handleWeightChange}
      />
      {strategy &&
        <section
          aria-label="Показатели ЭхоКГ"
          style={echoStyles.table}
        >
          <div style={echoStyles.headerRow}>
            <span>{names.columns.indicator}</span>
            <span>{names.columns.value}</span>
            <span>{names.columns.norm}</span>
          </div>
          {strategy.order.map((id) => {
            const norm = norms?.[id]
            const label = formatIndicatorLabel(id, norm)
            const inputDisabled = !canCalculateNorms || norm?.input === false
            const value = norm?.input === false
              ? formatEchoValue(calculatedMeasurements[id])
              : measurementInputs[id] ?? ''
            const status = getEchoStatus(calculatedMeasurements[id], norm)
            const fieldId = `echo-${id}`

            return (
              <div
                key={id}
                style={echoStyles.row}
              >
                <label
                  htmlFor={fieldId}
                  style={echoStyles.indicatorLabel}
                >
                  {label}
                </label>
                <input
                  data-status={status}
                  disabled={inputDisabled}
                  id={fieldId}
                  min="0"
                  step="0.01"
                  style={{
                    ...echoStyles.measurementInput,
                    ...statusStyles[status],
                    ...(inputDisabled ? echoStyles.measurementInputDisabled : undefined),
                  }}
                  type="number"
                  value={value}
                  onChange={(e) => handleMeasurementChange(e, id)}
                />
                <span style={echoStyles.normText}>
                  {formatEchoNorm(norm) || '-'}
                </span>
              </div>
            )
          })}
        </section>}
    </CalculatorForm>
  )
}
