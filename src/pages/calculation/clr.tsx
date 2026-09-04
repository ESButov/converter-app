import { useMemo, useState, type ChangeEvent, type CSSProperties } from 'react'
import {
  calculateClrDrugs,
  clrSpeciesLabels,
  type ClrDrugCalculation,
  type ClrSpecies,
} from '../../domain/clr'
import {
  CalculatorDescription,
  CalculatorForm,
  CalculatorNumberField,
  CalculatorPanel,
  CalculatorResult,
  CalculatorSelectField,
} from '../../ui/CalculatorForm'

type NumberFieldKey = 'weightKg'
type NumberInputs = Record<NumberFieldKey, string>

const names = {
  title: 'Расчет препаратов для СЛР',
  labels: {
    species: 'Вид животного',
    weightKg: 'Масса, кг',
  },
  empty: 'Укажите вид животного и массу пациента.',
  source: 'Источник: рекомендации по ветеринарной СЛР у собак и кошек, 2024.',
} as const

const speciesOptions = [
  {
    id: 'clr-species-dog',
    label: clrSpeciesLabels.dog,
    value: 'dog',
  },
  {
    id: 'clr-species-cat',
    label: clrSpeciesLabels.cat,
    value: 'cat',
  },
  {
    id: 'clr-species-exotic',
    label: clrSpeciesLabels.exotic,
    value: 'exotic',
  },
] as const

const speciesSet = new Set<ClrSpecies>(['cat', 'dog', 'exotic'])
const numberInputPatterns = {
  weightKg: /^\d*(?:\.\d{0,2})?$/,
} as const satisfies Record<NumberFieldKey, RegExp>

const styles = {
  drugList: {
    display: 'grid',
    gap: '10px',
  },
  drugCard: {
    display: 'grid',
    gap: '9px',
    padding: '12px 14px',
    border: '1px solid var(--app-home-card-border)',
    borderRadius: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.74)',
    boxShadow: 'var(--app-home-card-shadow)',
  },
  drugHeader: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: '8px',
    alignItems: 'baseline',
  },
  drugName: {
    color: 'var(--app-home-text)',
    fontSize: '15px',
    fontWeight: 800,
    lineHeight: 1.2,
  },
  drugDose: {
    color: 'var(--app-home-muted)',
    fontSize: '11px',
    fontWeight: 700,
    lineHeight: 1.2,
    textAlign: 'right',
  },
  volume: {
    color: 'var(--app-home-accent-strong)',
    fontSize: '17px',
    fontWeight: 800,
    lineHeight: 1.2,
  },
  unavailableVolume: {
    color: '#a53d2d',
    fontSize: '13px',
    fontWeight: 800,
    lineHeight: 1.25,
  },
  amount: {
    color: 'var(--app-home-text)',
    fontSize: '12px',
    fontWeight: 700,
    lineHeight: 1.25,
  },
  note: {
    color: 'var(--app-home-muted)',
    fontSize: '11px',
    fontWeight: 700,
    lineHeight: 1.35,
  },
} as const satisfies Record<string, CSSProperties>

const readNumberInput = (value: string): number | undefined => {
  if (value === '') return undefined

  const parsedValue = Number(value.replace(',', '.'))

  return Number.isFinite(parsedValue) ? parsedValue : undefined
}

const readSpecies = (value: string): ClrSpecies | undefined => (
  speciesSet.has(value as ClrSpecies) ? value as ClrSpecies : undefined
)

function ClrDrugCard({ drug }: { drug: ClrDrugCalculation }) {
  const dilutionLabel = drug.dilutionLabel ?? drug.specialDilutionLabel
  const hasDilutionPrimary = drug.isAvailableForSpecies && dilutionLabel !== undefined
  const primaryVolumeLabel = drug.dilutionVolumeLabel ?? drug.volumeLabel

  return (
    <section style={styles.drugCard}>
      <span style={styles.drugHeader}>
        <span style={styles.drugName}>{drug.definition.label}</span>
        <span style={styles.drugDose}>
          {drug.definition.doseLabel} - {drug.definition.concentrationLabel}
        </span>
      </span>
      {dilutionLabel ? (
        <span style={styles.amount}>{dilutionLabel}</span>
      ) : null}
      <span style={drug.isAvailableForSpecies ? styles.volume : styles.unavailableVolume}>
        {primaryVolumeLabel}
      </span>
      {drug.intratrachealLabel ? (
        <span style={styles.amount}>{drug.intratrachealLabel}</span>
      ) : null}
      {hasDilutionPrimary ? null : (
        <span style={styles.amount}>Доза: {drug.amountLabel}</span>
      )}
      <span style={styles.note}>{drug.definition.route}</span>
      <span style={styles.note}>{drug.definition.note}</span>
    </section>
  )
}

export default function ClrPage() {
  const [inputs, setInputs] = useState<NumberInputs>({ weightKg: '' })
  const [species, setSpecies] = useState<ClrSpecies>()

  const weightKg = useMemo(() => readNumberInput(inputs.weightKg), [inputs.weightKg])
  const result = useMemo(() => calculateClrDrugs(species, weightKg), [species, weightKg])

  const handleNumberChange = (
    e: ChangeEvent<HTMLInputElement>,
    key: NumberFieldKey,
  ) => {
    const normalizedInput = e.target.value.replace(',', '.')

    if (!numberInputPatterns[key].test(normalizedInput)) {
      return
    }

    setInputs((prev) => ({
      ...prev,
      [key]: e.target.value,
    }))
  }

  return (
    <CalculatorForm title={names.title}>
      <CalculatorSelectField
        label={names.labels.species}
        onChange={(e) => setSpecies(readSpecies(e.target.value))}
        options={speciesOptions}
        value={species ?? ''}
      />
      <CalculatorNumberField
        label={names.labels.weightKg}
        min="0"
        onChange={(e) => handleNumberChange(e, 'weightKg')}
        step="0.01"
        value={inputs.weightKg}
      />

      {result.length > 0 ? (
        <section style={styles.drugList}>
          {result.map((drug) => (
            <ClrDrugCard
              drug={drug}
              key={drug.definition.id}
            />
          ))}
        </section>
      ) : (
        <CalculatorResult>{names.empty}</CalculatorResult>
      )}

      <CalculatorPanel>
        Для собак и кошек использованы рекомендации по СЛР 2024 года. Препараты вводятся в/в или внутрикостно.
        Интратрахеально можно рассматривать только адреналин, вазопрессин и атропин, если в/в или внутрикостный
        доступ невозможен. Для интратрахеального введения препарат разводят 0.9% раствором натрия хлорида и вводят
        через катетер длиннее эндотрахеальной трубки. Концентрации фиксированы для быстрого расчета и должны быть
        сверены с препаратом, который используется в клинике.
      </CalculatorPanel>
      <CalculatorDescription>{names.source}</CalculatorDescription>
    </CalculatorForm>
  )
}
