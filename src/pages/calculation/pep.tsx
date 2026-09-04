import { useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties } from 'react'
import {
  calculatePep,
  formatPepNumber,
  pepDefaultInput,
  pepProtocolLabels,
  pepSpeciesLabels,
  type PepResult,
  type PepSpecies,
} from '../../domain/pep'
import {
  CalculatorError,
  CalculatorForm,
  CalculatorResult,
} from '../../ui/CalculatorForm'

type NumberFieldKey =
  | 'aminoOsmolarityMosmL'
  | 'aminoPotassiumMmolL'
  | 'aminoSolutionPercent'
  | 'carbohydrateEnergyPercent'
  | 'dehydrationPercent'
  | 'diarrheaLossMlKgDay'
  | 'energyFactor'
  | 'feverLossMlKgDay'
  | 'glucoseSolutionPercent'
  | 'insulinGlucoseGPerUnit'
  | 'intestinalLossMlKgDay'
  | 'lipidOsmolarityMosmL'
  | 'lipidSolutionPercent'
  | 'pepPercent'
  | 'proteinGPer100Kcal'
  | 'respiratoryLossMlKgDay'
  | 'targetPotassiumMmolL'
  | 'ventilationLossMlKgDay'
  | 'vomitingLossMlKgDay'
  | 'weightKg'

type NumberInputs = Record<NumberFieldKey, string>

type RowInputProps = {
  label: string
  max?: string
  min?: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  step?: string
  value: string
}

type RowSelectOption = {
  label: string
  value: string
}

type RowSelectProps = {
  label: string
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void
  options: readonly RowSelectOption[]
  value: string
}

const names = {
  title: 'Расчет ПЭП',
  errors: {
    dehydration: 'При гиповолемии ПЭП нельзя. Проверьте % дегидратации.',
    energyFactor: 'Коэффициент энергии обычно 1.0-1.2.',
    pepPercent: '% ПЭП обычно 25-100%.',
  },
  labels: {
    additionalFluid: 'Ввести еще жидкости, кроме ПЭП',
    aminoOsmolarityMosmL: 'Осмолярность аминокислот, мОсм/л',
    aminoPotassiumMmolL: 'Калий в аминокислотах, ммоль/л',
    aminoSolutionPercent: 'Раствор аминокислот, %',
    basalEnergy: 'BER/RER',
    carbohydrateEnergyPercent: 'Доля углеводов, %',
    dehydrationPercent: 'Дегидратация, %',
    diarrheaLossMlKgDay: 'Диарея, мл/кг/сут',
    energyFactor: 'Коэффициент энергии k',
    feverLossMlKgDay: 'Температура, мл/кг/сут',
    glucoseSolutionPercent: 'Раствор глюкозы, %',
    illEnergy: 'IER',
    insulinGlucoseGPerUnit: 'Инсулин, г глюкозы на 1 ЕД',
    intestinalLossMlKgDay: 'Парез/пиометра, мл/кг/сут',
    lipidOsmolarityMosmL: 'Осмолярность липидов, мОсм/л',
    lipidSolutionPercent: 'Раствор липидов, %',
    osmolarity: 'Теоретическая осмолярность',
    pepEnergy: 'Ккал для ПЭП',
    pepPercent: 'ПЭП от потребности, %',
    pepRate: 'Скорость ПЭП',
    proteinGPer100Kcal: 'Белок, г/100 ккал',
    respiratoryLossMlKgDay: 'Тахипноэ, мл/кг/сут',
    species: 'Вид животного',
    targetPotassiumMmolL: 'Калий в растворе ПЭП, ммоль/л',
    totalFluid: 'Общий объем инфузии',
    ventilationLossMlKgDay: 'ИВЛ, мл/кг/сут',
    vomitingLossMlKgDay: 'Рвота, мл/кг/сут',
    weightKg: 'Масса, кг',
  },
} as const

const sectionHelpTexts = {
  energy: `Масса животного вводится в килограммах (BW).
Режим выбирается автоматически: до 2 кг или более 2 кг.
Коэффициент k для вычисления IER: 1.0-1.2.
ПЭП от расчетной потребности: 25-100%.
BER/RER до 2 кг = 30 × BW + 70.
BER/RER более 2 кг = 70 × BW^0.75.
IER = RER × k.
Ккал для ПЭП = IER × % ПЭП / 100.`,
  protein: `% раствора аминокислот: смотреть на флаконе.
Калий в растворе аминокислот: ммоль/л, смотреть на флаконе.
Осмолярность раствора аминокислот: мОсм/л, смотреть на флаконе.
Белок в сутки = ккал для ПЭП × г белка/100 ккал / 100.
Объем аминокислот = белок в сутки × 100 / % раствора аминокислот.`,
  carbohydrateLipid: `Доля углеводов в восполнении энергетической потребности: обычно 50%.
Раствор глюкозы: 5-40%.
Инсулин: граммы глюкозы на 1 ЕД инсулина, обычно 4-6 г, по показаниям.
Раствор липидов: 10-20%, смотреть на флаконе.
Осмолярность раствора липидов: мОсм/л, смотреть на флаконе.
Доля липидов = 100 - доля углеводов.
Осмолярность глюкозы = % глюкозы × 55.5.`,
  potassiumFluid: `Калий в растворе для ПЭП: 15-30 ммоль/л.
Дегидратация: 0-5%; при гиповолемии ПЭП нельзя.
Дополнительные потери:
температура: 10 мл/кг на 1 градус повышения;
тахипноэ: 7-8 мл/кг на каждые +10/мин ЧДД;
парез кишечника, пиометра;
диарея;
рвота;
ИВЛ.
Дополнительные потребности = сумма дополнительных потерь, мл/кг/сут.
Общий объем инфузионной терапии = 30 × BW + 70 + BW × % дегидратации × 8 + дополнительные потери × BW.`,
  composition: `Состав ПЭП выводится на сутки и на 12 часов инфузии.
KCl 4% рассчитывается с учетом целевой концентрации калия и калия в аминокислотах.
Объем растворов ПЭП = аминокислоты + глюкоза + липиды.
Скорость введения ПЭП = объем растворов ПЭП / 24.
Теоретическая осмолярность = сумма вкладов аминокислот, глюкозы и липидов.
Если расчет дополнительной жидкости отрицательный, вводить дополнительную жидкость не надо.`,
} as const

const numberInputDefaults: NumberInputs = {
  aminoOsmolarityMosmL: String(pepDefaultInput.aminoOsmolarityMosmL),
  aminoPotassiumMmolL: String(pepDefaultInput.aminoPotassiumMmolL),
  aminoSolutionPercent: String(pepDefaultInput.aminoSolutionPercent),
  carbohydrateEnergyPercent: String(pepDefaultInput.carbohydrateEnergyPercent),
  dehydrationPercent: String(pepDefaultInput.dehydrationPercent),
  diarrheaLossMlKgDay: String(pepDefaultInput.diarrheaLossMlKgDay),
  energyFactor: String(pepDefaultInput.energyFactor),
  feverLossMlKgDay: String(pepDefaultInput.feverLossMlKgDay),
  glucoseSolutionPercent: String(pepDefaultInput.glucoseSolutionPercent),
  insulinGlucoseGPerUnit: String(pepDefaultInput.insulinGlucoseGPerUnit),
  intestinalLossMlKgDay: String(pepDefaultInput.intestinalLossMlKgDay),
  lipidOsmolarityMosmL: String(pepDefaultInput.lipidOsmolarityMosmL),
  lipidSolutionPercent: String(pepDefaultInput.lipidSolutionPercent),
  pepPercent: String(pepDefaultInput.pepPercent),
  proteinGPer100Kcal: String(pepDefaultInput.proteinGPer100Kcal),
  respiratoryLossMlKgDay: String(pepDefaultInput.respiratoryLossMlKgDay),
  targetPotassiumMmolL: String(pepDefaultInput.targetPotassiumMmolL),
  ventilationLossMlKgDay: String(pepDefaultInput.ventilationLossMlKgDay),
  vomitingLossMlKgDay: String(pepDefaultInput.vomitingLossMlKgDay),
  weightKg: '',
}

const speciesOptions = [
  {
    label: pepSpeciesLabels.dog,
    value: 'dog',
  },
  {
    label: pepSpeciesLabels.cat,
    value: 'cat',
  },
] as const

const speciesSet = new Set<PepSpecies>(['cat', 'dog'])
const numberInputPattern = /^\d*(?:\.\d{0,3})?$/

const styles = {
  compactGrid: {
    display: 'grid',
    gap: '9px 10px',
    gridTemplateColumns: 'minmax(0, 1.45fr) minmax(92px, 0.8fr)',
    padding: '12px 14px',
    border: '1px solid var(--app-home-card-border)',
    borderRadius: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.74)',
    boxShadow: 'var(--app-home-card-shadow)',
  },
  input: {
    width: '100%',
    height: '40px',
    padding: '0 10px',
    border: '1px solid var(--app-home-card-border)',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    color: 'var(--app-home-text)',
    fontSize: '13px',
    fontWeight: 800,
    outline: 'none',
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  row: {
    display: 'contents',
  },
  rowLabel: {
    alignSelf: 'center',
    color: 'var(--app-home-text)',
    fontSize: '13px',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  rowLabelWithHelp: {
    position: 'relative',
    alignSelf: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    color: 'var(--app-home-text)',
    fontSize: '13px',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  helpButton: {
    flex: '0 0 auto',
    width: '22px',
    height: '22px',
    padding: 0,
    border: '1px solid var(--app-home-card-border)',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    color: 'var(--app-home-accent-strong)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 800,
    lineHeight: 1,
  },
  helpPopup: {
    position: 'absolute',
    top: '28px',
    left: 0,
    zIndex: 5,
    width: 'min(280px, 74vw)',
    padding: '10px',
    border: '1px solid var(--app-home-card-border)',
    borderRadius: '14px',
    backgroundColor: '#f8ffff',
    boxShadow: '0 12px 28px rgba(6, 43, 55, 0.18)',
    color: 'var(--app-home-text)',
    fontSize: '12px',
    fontWeight: 700,
    lineHeight: 1.35,
    whiteSpace: 'pre-line',
  },
  sectionTitle: {
    position: 'relative',
    gridColumn: '1 / -1',
    width: '100%',
    marginTop: '4px',
    padding: '5px 0 0',
    borderTop: '1px solid var(--app-home-card-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    color: 'var(--app-home-accent-strong)',
    fontSize: '12px',
    fontWeight: 800,
    lineHeight: 1.2,
    textTransform: 'uppercase',
    boxSizing: 'border-box',
  },
  table: {
    display: 'grid',
    gridTemplateColumns: '1.25fr 0.8fr 0.8fr',
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
  tableCell: {
    minHeight: '33px',
    padding: '7px 6px',
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    color: 'var(--app-home-text)',
    display: 'flex',
    alignItems: 'center',
  },
  tableHeader: {
    minHeight: '30px',
    padding: '7px 6px',
    backgroundColor: 'rgba(47, 200, 196, 0.18)',
    color: 'var(--app-home-text)',
    display: 'flex',
    alignItems: 'center',
  },
} as const satisfies Record<string, CSSProperties>

const readNumberInput = (value: string): number | undefined => {
  if (value === '') return undefined

  const parsedValue = Number(value.replace(',', '.'))

  return Number.isFinite(parsedValue) ? parsedValue : undefined
}

const readSpecies = (value: string): PepSpecies | undefined => (
  speciesSet.has(value as PepSpecies) ? value as PepSpecies : undefined
)

function SectionTitle({
  children,
  helpId,
  helpText,
}: {
  children: string
  helpId?: string
  helpText?: string
}) {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const helpRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    if (!isHelpOpen) {
      return undefined
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node) || !helpRef.current?.contains(target)) {
        setIsHelpOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isHelpOpen])

  return (
    <span
      ref={helpRef}
      style={styles.sectionTitle}
    >
      <span>{children}</span>
      {helpText !== undefined &&
        <>
          <button
            aria-controls={helpId}
            aria-expanded={isHelpOpen}
            aria-label={`Показать подсказку: ${children}`}
            style={styles.helpButton}
            type="button"
            onClick={() => setIsHelpOpen((isOpen) => !isOpen)}
          >
            ?
          </button>
          {isHelpOpen &&
            <span
              aria-label={children}
              id={helpId}
              role="dialog"
              style={styles.helpPopup}
            >
              {helpText}
            </span>}
        </>}
    </span>
  )
}

function RowNumberField({
  label,
  max,
  min = '0',
  onChange,
  step = '0.01',
  value,
}: RowInputProps) {
  return (
    <label style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <input
        aria-label={label}
        max={max}
        min={min}
        step={step}
        style={styles.input}
        type="number"
        value={value}
        onChange={onChange}
      />
    </label>
  )
}

function RowSelectField({
  label,
  onChange,
  options,
  value,
}: RowSelectProps) {
  return (
    <label style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <select
        aria-label={label}
        style={styles.input}
        value={value}
        onChange={onChange}
      >
        <option value="">-</option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function PepCompositionTable({ inputs, result }: {
  inputs: NumberInputs
  result: PepResult
}) {
  const rows = [
    {
      label: `Аминокислоты ${inputs.aminoSolutionPercent}%`,
      day: `${formatPepNumber(result.aminoVolumeMlDay)} мл`,
      halfDay: `${formatPepNumber(result.aminoVolumeMl12h)} мл`,
    },
    {
      label: `Глюкоза ${inputs.glucoseSolutionPercent}%`,
      day: `${formatPepNumber(result.glucoseVolumeMlDay)} мл`,
      halfDay: `${formatPepNumber(result.glucoseVolumeMl12h)} мл`,
    },
    {
      label: 'Актрапид',
      day: result.insulinUnitsDay === undefined ? '-' : `${formatPepNumber(result.insulinUnitsDay, 3)} ЕД`,
      halfDay: result.insulinUnits12h === undefined ? '-' : `${formatPepNumber(result.insulinUnits12h, 3)} ЕД`,
    },
    {
      label: `Липиды ${inputs.lipidSolutionPercent}%`,
      day: `${formatPepNumber(result.lipidVolumeMlDay)} мл`,
      halfDay: `${formatPepNumber(result.lipidVolumeMl12h)} мл`,
    },
    {
      label: 'KCl 4%',
      day: `${formatPepNumber(result.potassiumChlorideVolumeMlDay, 3)} мл`,
      halfDay: `${formatPepNumber(result.potassiumChlorideVolumeMl12h, 3)} мл`,
    },
    {
      label: 'Объем растворов ПЭП',
      day: `${formatPepNumber(result.totalPepVolumeMlDay)} мл`,
      halfDay: `${formatPepNumber(result.totalPepVolumeMl12h)} мл`,
    },
  ]

  return (
    <section
      aria-label="Состав ПЭП"
      style={styles.table}
    >
      <span style={styles.tableHeader}>Компонент</span>
      <span style={styles.tableHeader}>На сутки</span>
      <span style={styles.tableHeader}>На 12 часов</span>

      {rows.flatMap((row) => [
        <span
          key={`${row.label}-label`}
          style={styles.tableCell}
        >
          {row.label}
        </span>,
        <span
          key={`${row.label}-day`}
          style={styles.tableCell}
        >
          {row.day}
        </span>,
        <span
          key={`${row.label}-half`}
          style={styles.tableCell}
        >
          {row.halfDay}
        </span>,
      ])}
    </section>
  )
}

export default function PepPage() {
  const [inputs, setInputs] = useState<NumberInputs>(numberInputDefaults)
  const [isProteinHelpOpen, setIsProteinHelpOpen] = useState(false)
  const [species, setSpecies] = useState<PepSpecies>()
  const proteinHelpRef = useRef<HTMLSpanElement | null>(null)

  const numericValues = useMemo(() => ({
    aminoOsmolarityMosmL: readNumberInput(inputs.aminoOsmolarityMosmL),
    aminoPotassiumMmolL: readNumberInput(inputs.aminoPotassiumMmolL),
    aminoSolutionPercent: readNumberInput(inputs.aminoSolutionPercent),
    carbohydrateEnergyPercent: readNumberInput(inputs.carbohydrateEnergyPercent),
    dehydrationPercent: readNumberInput(inputs.dehydrationPercent),
    diarrheaLossMlKgDay: readNumberInput(inputs.diarrheaLossMlKgDay),
    energyFactor: readNumberInput(inputs.energyFactor),
    feverLossMlKgDay: readNumberInput(inputs.feverLossMlKgDay),
    glucoseSolutionPercent: readNumberInput(inputs.glucoseSolutionPercent),
    insulinGlucoseGPerUnit: readNumberInput(inputs.insulinGlucoseGPerUnit),
    intestinalLossMlKgDay: readNumberInput(inputs.intestinalLossMlKgDay),
    lipidOsmolarityMosmL: readNumberInput(inputs.lipidOsmolarityMosmL),
    lipidSolutionPercent: readNumberInput(inputs.lipidSolutionPercent),
    pepPercent: readNumberInput(inputs.pepPercent),
    proteinGPer100Kcal: readNumberInput(inputs.proteinGPer100Kcal),
    respiratoryLossMlKgDay: readNumberInput(inputs.respiratoryLossMlKgDay),
    targetPotassiumMmolL: readNumberInput(inputs.targetPotassiumMmolL),
    ventilationLossMlKgDay: readNumberInput(inputs.ventilationLossMlKgDay),
    vomitingLossMlKgDay: readNumberInput(inputs.vomitingLossMlKgDay),
    weightKg: readNumberInput(inputs.weightKg),
  }), [inputs])

  const result = useMemo(() => calculatePep(numericValues), [numericValues])

  const handleNumberChange = (
    e: ChangeEvent<HTMLInputElement>,
    key: NumberFieldKey,
  ) => {
    const normalizedInput = e.target.value.replace(',', '.')

    if (!numberInputPattern.test(normalizedInput)) {
      return
    }

    setInputs((prev) => ({
      ...prev,
      [key]: e.target.value,
    }))
  }

  const handleSpeciesChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSpecies(readSpecies(e.target.value))
  }

  useEffect(() => {
    if (!isProteinHelpOpen) {
      return undefined
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node) || !proteinHelpRef.current?.contains(target)) {
        setIsProteinHelpOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isProteinHelpOpen])

  const proteinHint = species === undefined
    ? 'Белок: собака 2-4-6 г/100 ккал; кошка 3-6-6 г/100 ккал.'
    : species === 'dog'
      ? 'Белок: собака 2-4-6 г/100 ккал.'
      : 'Белок: кошка 3-6-6 г/100 ккал.'

  const warningText = [
    numericValues.energyFactor !== undefined &&
      (numericValues.energyFactor < 1 || numericValues.energyFactor > 1.2)
      ? names.errors.energyFactor
      : undefined,
    numericValues.pepPercent !== undefined &&
      (numericValues.pepPercent < 25 || numericValues.pepPercent > 100)
      ? names.errors.pepPercent
      : undefined,
    numericValues.dehydrationPercent !== undefined && numericValues.dehydrationPercent > 5
      ? names.errors.dehydration
      : undefined,
  ].filter(Boolean).join('\n')

  const resultText = result === undefined
    ? undefined
    : `Режим: ${pepProtocolLabels[result.protocol]}
${names.labels.basalEnergy}: ${formatPepNumber(result.basalEnergyKcalDay)} ккал/сут
${names.labels.illEnergy}: ${formatPepNumber(result.illEnergyKcalDay)} ккал/сут
${names.labels.pepEnergy}: ${formatPepNumber(result.pepEnergyKcalDay)} ккал/сут
Белок: ${formatPepNumber(result.proteinGramsDay)} г/сут
Глюкоза: ${formatPepNumber(result.glucoseGramsDay)} г/сут
Липиды: ${formatPepNumber(result.lipidGramsDay)} г/сут
${names.labels.osmolarity}: ${formatPepNumber(result.theoreticalOsmolarityMosmL)} мОсм/л
${names.labels.pepRate}: ${formatPepNumber(result.pepRateMlHour)} мл/ч
${names.labels.totalFluid}: ${formatPepNumber(result.totalFluidMlDay)} мл/сут
${names.labels.additionalFluid}: ${result.additionalFluidMlDay > 0 ? `${formatPepNumber(result.additionalFluidMlDay)} мл/сут` : 'не требуется'}`

  return (
    <CalculatorForm title={names.title}>
      <div style={styles.compactGrid}>
        <SectionTitle
          helpId="pep-energy-help"
          helpText={sectionHelpTexts.energy}
        >
          Пациент и энергия
        </SectionTitle>
        <RowSelectField
          label={names.labels.species}
          options={speciesOptions}
          value={species ?? ''}
          onChange={handleSpeciesChange}
        />
        <RowNumberField
          label={names.labels.weightKg}
          step="0.01"
          value={inputs.weightKg}
          onChange={(e) => handleNumberChange(e, 'weightKg')}
        />
        <RowNumberField
          label={names.labels.energyFactor}
          step="0.1"
          value={inputs.energyFactor}
          onChange={(e) => handleNumberChange(e, 'energyFactor')}
        />
        <RowNumberField
          label={names.labels.pepPercent}
          max="100"
          step="1"
          value={inputs.pepPercent}
          onChange={(e) => handleNumberChange(e, 'pepPercent')}
        />

        <SectionTitle
          helpId="pep-protein-section-help"
          helpText={sectionHelpTexts.protein}
        >
          Белок и аминокислоты
        </SectionTitle>
        <span
          ref={proteinHelpRef}
          style={styles.rowLabelWithHelp}
        >
          <label htmlFor="pep-protein-input">
            {names.labels.proteinGPer100Kcal}
          </label>
          <button
            aria-controls="pep-protein-help"
            aria-expanded={isProteinHelpOpen}
            aria-label="Показать подсказку по белку"
            style={styles.helpButton}
            type="button"
            onClick={() => setIsProteinHelpOpen((isOpen) => !isOpen)}
          >
            ?
          </button>
          {isProteinHelpOpen &&
            <span
              aria-label="Подсказка по белку"
              id="pep-protein-help"
              role="dialog"
              style={styles.helpPopup}
            >
              {proteinHint}
            </span>}
        </span>
        <input
          aria-label={names.labels.proteinGPer100Kcal}
          id="pep-protein-input"
          min="0"
          step="0.1"
          style={styles.input}
          type="number"
          value={inputs.proteinGPer100Kcal}
          onChange={(e) => handleNumberChange(e, 'proteinGPer100Kcal')}
        />
        <RowNumberField
          label={names.labels.aminoSolutionPercent}
          step="0.1"
          value={inputs.aminoSolutionPercent}
          onChange={(e) => handleNumberChange(e, 'aminoSolutionPercent')}
        />
        <RowNumberField
          label={names.labels.aminoPotassiumMmolL}
          step="0.1"
          value={inputs.aminoPotassiumMmolL}
          onChange={(e) => handleNumberChange(e, 'aminoPotassiumMmolL')}
        />
        <RowNumberField
          label={names.labels.aminoOsmolarityMosmL}
          step="1"
          value={inputs.aminoOsmolarityMosmL}
          onChange={(e) => handleNumberChange(e, 'aminoOsmolarityMosmL')}
        />

        <SectionTitle
          helpId="pep-carbohydrate-lipid-help"
          helpText={sectionHelpTexts.carbohydrateLipid}
        >
          Углеводы и липиды
        </SectionTitle>
        <RowNumberField
          label={names.labels.carbohydrateEnergyPercent}
          max="100"
          step="1"
          value={inputs.carbohydrateEnergyPercent}
          onChange={(e) => handleNumberChange(e, 'carbohydrateEnergyPercent')}
        />
        <RowNumberField
          label={names.labels.glucoseSolutionPercent}
          step="1"
          value={inputs.glucoseSolutionPercent}
          onChange={(e) => handleNumberChange(e, 'glucoseSolutionPercent')}
        />
        <RowNumberField
          label={names.labels.insulinGlucoseGPerUnit}
          step="0.1"
          value={inputs.insulinGlucoseGPerUnit}
          onChange={(e) => handleNumberChange(e, 'insulinGlucoseGPerUnit')}
        />
        <RowNumberField
          label={names.labels.lipidSolutionPercent}
          step="1"
          value={inputs.lipidSolutionPercent}
          onChange={(e) => handleNumberChange(e, 'lipidSolutionPercent')}
        />
        <RowNumberField
          label={names.labels.lipidOsmolarityMosmL}
          step="1"
          value={inputs.lipidOsmolarityMosmL}
          onChange={(e) => handleNumberChange(e, 'lipidOsmolarityMosmL')}
        />

        <SectionTitle
          helpId="pep-potassium-fluid-help"
          helpText={sectionHelpTexts.potassiumFluid}
        >
          Калий и жидкость
        </SectionTitle>
        <RowNumberField
          label={names.labels.targetPotassiumMmolL}
          step="1"
          value={inputs.targetPotassiumMmolL}
          onChange={(e) => handleNumberChange(e, 'targetPotassiumMmolL')}
        />
        <RowNumberField
          label={names.labels.dehydrationPercent}
          max="5"
          step="0.5"
          value={inputs.dehydrationPercent}
          onChange={(e) => handleNumberChange(e, 'dehydrationPercent')}
        />
        <RowNumberField
          label={names.labels.feverLossMlKgDay}
          step="1"
          value={inputs.feverLossMlKgDay}
          onChange={(e) => handleNumberChange(e, 'feverLossMlKgDay')}
        />
        <RowNumberField
          label={names.labels.respiratoryLossMlKgDay}
          step="1"
          value={inputs.respiratoryLossMlKgDay}
          onChange={(e) => handleNumberChange(e, 'respiratoryLossMlKgDay')}
        />
        <RowNumberField
          label={names.labels.intestinalLossMlKgDay}
          step="1"
          value={inputs.intestinalLossMlKgDay}
          onChange={(e) => handleNumberChange(e, 'intestinalLossMlKgDay')}
        />
        <RowNumberField
          label={names.labels.diarrheaLossMlKgDay}
          step="1"
          value={inputs.diarrheaLossMlKgDay}
          onChange={(e) => handleNumberChange(e, 'diarrheaLossMlKgDay')}
        />
        <RowNumberField
          label={names.labels.vomitingLossMlKgDay}
          step="1"
          value={inputs.vomitingLossMlKgDay}
          onChange={(e) => handleNumberChange(e, 'vomitingLossMlKgDay')}
        />
        <RowNumberField
          label={names.labels.ventilationLossMlKgDay}
          step="1"
          value={inputs.ventilationLossMlKgDay}
          onChange={(e) => handleNumberChange(e, 'ventilationLossMlKgDay')}
        />
      </div>

      <CalculatorError>{warningText}</CalculatorError>

      {result !== undefined &&
        <>
          <SectionTitle
            helpId="pep-composition-help"
            helpText={sectionHelpTexts.composition}
          >
            Состав и скорость
          </SectionTitle>
          <PepCompositionTable
            inputs={inputs}
            result={result}
          />
        </>}

      <CalculatorResult
        align="start"
        multiline
      >
        {resultText}
      </CalculatorResult>
    </CalculatorForm>
  )
}
