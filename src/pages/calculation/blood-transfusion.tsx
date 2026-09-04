import { useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties } from 'react'
import {
  bloodComponentKeys,
  calculateAlbuminReplacement,
  calculateDonorBloodCollection,
  calculatePlasmaTransfusion,
  calculatePlateletTransfusion,
  calculateRedCellTransfusion,
  formatTransfusionNumber,
  isRedCellComponent,
  transfusionSpeciesKeys,
  type BloodComponent,
  type DoseRange,
  type TransfusionSpecies,
} from '../../domain/bloodTransfusion'
import {
  CalculatorError,
  CalculatorForm,
  CalculatorNumberField,
  CalculatorPanel,
  CalculatorResult,
  CalculatorSelectField,
} from '../../ui/CalculatorForm'

type NumberFieldKey =
  | 'currentAlbuminGL'
  | 'currentPcv'
  | 'plannedVolumeMl'
  | 'productPcv'
  | 'targetAlbuminGL'
  | 'targetPcv'
  | 'weightKg'

type NumberInputs = Record<NumberFieldKey, string>

const names = {
  title: 'Расчет крови и компонентов крови',
  labels: {
    component: 'Компонент крови',
    currentAlbuminGL: 'Альбумин крови, г/л',
    currentPcv: 'Текущий HCT/PCV, %',
    plannedVolumeMl: 'Планируемый объем, мл',
    packedRbcProductPcv: 'HCT/PCV продукта, %',
    wholeBloodProductPcv: 'HCT/PCV продукта / донора, %',
    species: 'Вид животного',
    targetAlbuminGL: 'Желаемый альбумин, г/л',
    targetPcv: 'Целевой HCT/PCV, %',
    weightKg: 'Масса, кг',
  },
  errors: {
    targetAlbuminGL: 'Желаемый альбумин должен быть выше текущего.',
    targetPcv: 'Целевой HCT/PCV должен быть выше текущего.',
  },
  albuminNote: 'Расчет проводится на 12 часов ИПС.',
  safety: 'Перед трансфузией необходимо: определение группы крови, проведение перекрестной пробы, отдельная линия с фильтром; не смешивать кровь с кальций/глюкоза-содержащими растворами.',
  componentHelp: {
    title: 'Практическое использование компонентов крови',
    columns: {
      indication: 'Показание',
      wholeBlood: 'Цельная кровь',
      packedRbc: 'Эритроцитарная масса',
      plasma: 'Плазма',
    },
  },
} as const

const speciesLabels: Record<TransfusionSpecies, string> = {
  dog: 'Собака',
  cat: 'Кошка',
}

const componentLabels: Record<BloodComponent, string> = {
  wholeBlood: 'Цельная кровь',
  packedRbc: 'Эритроцитарная масса / pRBC',
  plasma: 'Плазма / FFP',
  albumin: 'Альбумин',
  platelets: 'Тромбоцитарный компонент',
  donorCollection: 'Забор крови у донора',
}

const speciesOptions = transfusionSpeciesKeys.map((key) => ({
  id: `transfusion-species-${key}`,
  label: speciesLabels[key],
  value: key,
}))

const componentOptions = bloodComponentKeys.map((key) => ({
  id: `blood-component-${key}`,
  label: componentLabels[key],
  value: key,
}))

const componentUsageRows = [
  {
    indication: 'Острая анемия',
    wholeBlood: '+++',
    packedRbc: '++',
    plasma: '-',
  },
  {
    indication: 'Хроническая анемия',
    wholeBlood: '+',
    packedRbc: '+++',
    plasma: '-',
  },
  {
    indication: 'Коагулопатия / родентициды',
    wholeBlood: '+',
    packedRbc: '-',
    plasma: '+++',
  },
  {
    indication: 'ДВС-синдром',
    wholeBlood: '++',
    packedRbc: '-',
    plasma: '++',
  },
  {
    indication: 'Гипоальбуминемия',
    wholeBlood: '-',
    packedRbc: '-',
    plasma: '++ / альбумин +++',
  },
] as const

const donorRequirementRows: Record<TransfusionSpecies, readonly string[]> = {
  dog: [
    'здоровый взрослый донор, не гериатрический, спокойный и управляемый',
    'масса от 25 кг, без беременности/лактации, без текущих системных заболеваний и значимых препаратов',
    'нет предыдущих гемотрансфузий; актуальная вакцинация, обработка от паразитов и инфекционный скрининг по локальному протоколу',
    'перед забором: осмотр врача, HCT/PCV или Hb, общий белок/клиническая оценка гидратации',
  ],
  cat: [
    'здоровый спокойный донор 1-8 лет, желательно домашнего содержания, масса тела выше 4.5 кг',
    'без беременности, лактации, недавних препаратов и предыдущих гемотрансфузий',
    'актуальная вакцинация и обработка от паразитов; FeLV/FIV и другой инфекционный скрининг по рискам региона',
    'перед забором: осмотр, HCT/PCV или Hb; учитывать аускультацию/АД и кардиоскрининг по протоколу',
  ],
}

const numberInputDefaults: NumberInputs = {
  currentAlbuminGL: '',
  currentPcv: '',
  plannedVolumeMl: '',
  productPcv: '',
  targetAlbuminGL: '',
  targetPcv: '',
  weightKg: '',
}

const decimalNumberPattern = /^\d*(?:\.\d{0,3})?$/
const transfusionSpeciesSet = new Set<TransfusionSpecies>(transfusionSpeciesKeys)
const bloodComponentSet = new Set<BloodComponent>(bloodComponentKeys)

const hasPositiveNumber = (value: unknown): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value > 0
)

const hasNonNegativeNumber = (value: unknown): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value >= 0
)

const isTransfusionSpecies = (value: string): value is TransfusionSpecies => (
  transfusionSpeciesSet.has(value as TransfusionSpecies)
)

const isBloodComponent = (value: string): value is BloodComponent => (
  bloodComponentSet.has(value as BloodComponent)
)

const readNumberInput = (value: string): number | undefined => {
  if (value === '') return undefined

  const parsedValue = Number(value.replace(',', '.'))

  return Number.isFinite(parsedValue) ? parsedValue : undefined
}

const formatRange = (range: DoseRange, unit: string) => (
  range.min === range.max
    ? `${formatTransfusionNumber(range.max)} ${unit}`
    : `${formatTransfusionNumber(range.min)}-${formatTransfusionNumber(range.max)} ${unit}`
)

const formatAlbuminNumber = (value: number, digits = 2) => {
  const fixedValue = value.toFixed(digits)

  return fixedValue.includes('.')
    ? fixedValue.replace(/\.?0+$/, '')
    : fixedValue
}

const componentHelpStyles = {
  field: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '9px',
    padding: '12px 14px',
    border: '1px solid var(--app-home-card-border)',
    borderRadius: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.74)',
    boxShadow: 'var(--app-home-card-shadow)',
    color: 'var(--app-home-text)',
    fontSize: '12px',
    lineHeight: '1.2',
    fontWeight: 850,
  },
  labelRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    color: 'var(--app-home-text)',
  },
  select: {
    width: '100%',
    height: '40px',
    padding: '0 12px',
    border: '1px solid var(--app-home-card-border)',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    color: 'var(--app-home-text)',
    fontSize: '14px',
    fontWeight: 800,
    textAlign: 'center',
    outline: 'none',
    boxSizing: 'border-box',
  },
  helpButton: {
    width: '24px',
    height: '24px',
    padding: 0,
    border: '1px solid var(--app-home-card-border)',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    color: 'var(--app-home-accent-strong)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 800,
    lineHeight: 1,
  },
  popup: {
    position: 'absolute',
    top: '60px',
    right: 0,
    left: 0,
    zIndex: 5,
    padding: '10px',
    border: '1px solid var(--app-home-card-border)',
    borderRadius: '14px',
    backgroundColor: '#f8ffff',
    boxShadow: '0 12px 28px rgba(6, 43, 55, 0.18)',
  },
  title: {
    display: 'block',
    marginBottom: '8px',
    color: 'var(--app-home-text)',
    fontSize: '13px',
    fontWeight: 800,
    lineHeight: 1.25,
  },
  table: {
    display: 'grid',
    gridTemplateColumns: '1.6fr repeat(3, minmax(44px, 1fr))',
    gap: '1px',
    overflow: 'hidden',
    border: '1px solid var(--app-home-card-border)',
    borderRadius: '12px',
    backgroundColor: 'var(--app-home-card-border)',
    color: 'var(--app-home-text)',
    fontSize: '10px',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  header: {
    padding: '6px',
    backgroundColor: 'rgba(47, 200, 196, 0.18)',
    color: 'var(--app-home-text)',
    textAlign: 'center',
  },
  cell: {
    padding: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    textAlign: 'center',
  },
  indicationCell: {
    padding: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    textAlign: 'left',
  },
} as const satisfies Record<string, CSSProperties>

export default function BloodTransfusionPage() {
  const [component, setComponent] = useState<BloodComponent>('wholeBlood')
  const [inputs, setInputs] = useState<NumberInputs>(numberInputDefaults)
  const [isComponentHelpOpen, setIsComponentHelpOpen] = useState(false)
  const [species, setSpecies] = useState<TransfusionSpecies>()
  const componentHelpRef = useRef<HTMLDivElement | null>(null)
  const productPcvLabel = component === 'wholeBlood'
    ? names.labels.wholeBloodProductPcv
    : names.labels.packedRbcProductPcv

  const numericValues = useMemo(() => ({
    currentAlbuminGL: readNumberInput(inputs.currentAlbuminGL),
    currentPcv: readNumberInput(inputs.currentPcv),
    plannedVolumeMl: readNumberInput(inputs.plannedVolumeMl),
    productPcv: readNumberInput(inputs.productPcv),
    targetAlbuminGL: readNumberInput(inputs.targetAlbuminGL),
    targetPcv: readNumberInput(inputs.targetPcv),
    weightKg: readNumberInput(inputs.weightKg),
  }), [inputs])

  const redCellResult = useMemo(() => {
    if (!isRedCellComponent(component)) {
      return undefined
    }

    return calculateRedCellTransfusion({
      currentPcv: numericValues.currentPcv,
      plannedVolumeMl: component === 'packedRbc' ? numericValues.plannedVolumeMl : undefined,
      productPcv: numericValues.productPcv,
      species,
      targetPcv: numericValues.targetPcv,
      weightKg: numericValues.weightKg,
    })
  }, [component, numericValues, species])

  const plasmaResult = useMemo(() => (
    component === 'plasma'
      ? calculatePlasmaTransfusion(species, numericValues.weightKg)
      : undefined
  ), [component, numericValues.weightKg, species])

  const plateletResult = useMemo(() => (
    component === 'platelets'
      ? calculatePlateletTransfusion(numericValues.weightKg)
      : undefined
  ), [component, numericValues.weightKg])

  const donorCollectionResult = useMemo(() => (
    component === 'donorCollection'
      ? calculateDonorBloodCollection(species, numericValues.weightKg)
      : undefined
  ), [component, numericValues.weightKg, species])

  const albuminResult = useMemo(() => (
    component === 'albumin'
      ? calculateAlbuminReplacement({
        currentAlbuminGL: numericValues.currentAlbuminGL,
        targetAlbuminGL: numericValues.targetAlbuminGL,
        weightKg: numericValues.weightKg,
      })
      : undefined
  ), [
    component,
    numericValues.currentAlbuminGL,
    numericValues.targetAlbuminGL,
    numericValues.weightKg,
  ])

  useEffect(() => {
    if (!isComponentHelpOpen) {
      return undefined
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node) || !componentHelpRef.current?.contains(target)) {
        setIsComponentHelpOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isComponentHelpOpen])

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
    setSpecies(
      isTransfusionSpecies(e.target.value) ? e.target.value : undefined,
    )
  }

  const handleComponentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (isBloodComponent(e.target.value)) {
      setComponent(e.target.value)
    }
  }

  const redCellError = useMemo(() => {
    if (
      !isRedCellComponent(component) ||
      !hasNonNegativeNumber(numericValues.currentPcv) ||
      !hasPositiveNumber(numericValues.targetPcv)
    ) {
      return undefined
    }

    return numericValues.targetPcv <= numericValues.currentPcv
      ? names.errors.targetPcv
      : undefined
  }, [component, numericValues.currentPcv, numericValues.targetPcv])

  const albuminError = useMemo(() => {
    if (
      component !== 'albumin' ||
      !hasNonNegativeNumber(numericValues.currentAlbuminGL) ||
      !hasPositiveNumber(numericValues.targetAlbuminGL)
    ) {
      return undefined
    }

    return numericValues.targetAlbuminGL <= numericValues.currentAlbuminGL
      ? names.errors.targetAlbuminGL
      : undefined
  }, [component, numericValues.currentAlbuminGL, numericValues.targetAlbuminGL])

  const resultText = useMemo(() => {
    if (species === undefined || !hasPositiveNumber(numericValues.weightKg)) {
      return undefined
    }

    if (redCellResult !== undefined) {
      const plannedText = redCellResult.plannedExpectedPcv === undefined
        ? ''
        : `
Планируемый объем: ${formatTransfusionNumber(numericValues.plannedVolumeMl ?? 0)} мл
Ожидаемый HCT/PCV по планируемому объему: ${formatTransfusionNumber(redCellResult.plannedExpectedPcv)}% (+${formatTransfusionNumber(redCellResult.plannedPcvIncrease ?? 0)}%)`

      return `Компонент: ${componentLabels[component]}
Расчетный объем компонента: ${formatTransfusionNumber(redCellResult.volumeMl)} мл
Объем на кг: ${formatTransfusionNumber(redCellResult.volumeMlKg)} мл/кг
Ожидаемый прирост HCT/PCV: ${formatTransfusionNumber(redCellResult.pcvDelta)}%
Ожидаемый HCT/PCV после трансфузии: ${formatTransfusionNumber(redCellResult.expectedPcv)}%${plannedText}`
    }

    if (albuminResult !== undefined) {
      return `Компонент: ${componentLabels.albumin}
Дефицит до желаемого уровня: ${formatTransfusionNumber(albuminResult.albuminDeltaGL)} г/л
Объем 20% альбумина: ${formatTransfusionNumber(albuminResult.volume20PercentMl)} мл
Скорость для 20% альбумина: ${formatAlbuminNumber(albuminResult.speed20PercentMlHour)} мл/ч
При введении через периферический венозный катетер 20% альбумин развести равным объемом 0.9% раствора натрия хлорида: добавить ${formatTransfusionNumber(albuminResult.dilutionVolume20PercentMl)} мл
Скорость разведенного раствора 20% альбумина: ${formatAlbuminNumber(albuminResult.speed20PercentDilutedMlHour)} мл/ч
20% альбумин допустимо вводить через центральный венозный катетер в чистом виде

Объем 10% альбумина: ${formatTransfusionNumber(albuminResult.volume10PercentMl)} мл
Скорость для 10% альбумина: ${formatAlbuminNumber(albuminResult.speed10PercentMlHour)} мл/ч`
    }

    if (donorCollectionResult !== undefined) {
      const weightWarning = donorCollectionResult.isBelowRecommendedWeight
        ? `
Внимание: масса ниже рекомендуемой для донора (${formatTransfusionNumber(donorCollectionResult.recommendedWeightKg)} кг).`
        : ''
      const requirements = donorRequirementRows[species]
        .map((requirement) => `- ${requirement}`)
        .join('\n')

      return `Компонент: ${componentLabels.donorCollection}
Расчетный объем забора: ${formatRange(donorCollectionResult.volumeMl, 'мл')}
Ориентир: ${formatRange(donorCollectionResult.doseMlKg, 'мл/кг')}${weightWarning}
Краткие требования к донору:
${requirements}`
    }

    if (plasmaResult !== undefined) {
      return `Компонент: ${componentLabels.plasma}
Доза плазмы: ${formatRange(plasmaResult.doseMlKg, 'мл/кг')}
Объем плазмы: ${formatRange(plasmaResult.volumeMl, 'мл')}`
    }

    if (plateletResult !== undefined) {
      return `Компонент: ${componentLabels.platelets}
Доза: 1 ед. на 10 кг
Расчетно: ${formatTransfusionNumber(plateletResult.units, 2)} ед.
Округление: ${plateletResult.roundedUnits} ед.`
    }

    return undefined
  }, [
    component,
    albuminResult,
    donorCollectionResult,
    numericValues.plannedVolumeMl,
    numericValues.weightKg,
    plasmaResult,
    plateletResult,
    redCellResult,
    species,
  ])

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
      <div
        ref={componentHelpRef}
        style={componentHelpStyles.field}
      >
        <span style={componentHelpStyles.labelRow}>
          <label htmlFor="blood-component-select">
            {names.labels.component}
          </label>
          <button
            aria-controls="blood-component-help"
            aria-expanded={isComponentHelpOpen}
            aria-label="Показать справку по компонентам крови"
            style={componentHelpStyles.helpButton}
            type="button"
            onClick={() => setIsComponentHelpOpen((isOpen) => !isOpen)}
          >
            ?
          </button>
        </span>
        <select
          id="blood-component-select"
          style={componentHelpStyles.select}
          value={component}
          onChange={handleComponentChange}
        >
          {componentOptions.map((option) => (
            <option
              id={option.id}
              key={option.id}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        {isComponentHelpOpen &&
          <div
            aria-label={names.componentHelp.title}
            id="blood-component-help"
            role="dialog"
            style={componentHelpStyles.popup}
          >
            <span style={componentHelpStyles.title}>
              {names.componentHelp.title}
            </span>
            <span style={componentHelpStyles.table}>
              <span style={componentHelpStyles.header}>{names.componentHelp.columns.indication}</span>
              <span style={componentHelpStyles.header}>{names.componentHelp.columns.wholeBlood}</span>
              <span style={componentHelpStyles.header}>{names.componentHelp.columns.packedRbc}</span>
              <span style={componentHelpStyles.header}>{names.componentHelp.columns.plasma}</span>
              {componentUsageRows.flatMap((row) => [
                <span
                  key={`${row.indication}-indication`}
                  style={componentHelpStyles.indicationCell}
                >
                  {row.indication}
                </span>,
                <span
                  key={`${row.indication}-whole`}
                  style={componentHelpStyles.cell}
                >
                  {row.wholeBlood}
                </span>,
                <span
                  key={`${row.indication}-rbc`}
                  style={componentHelpStyles.cell}
                >
                  {row.packedRbc}
                </span>,
                <span
                  key={`${row.indication}-plasma`}
                  style={componentHelpStyles.cell}
                >
                  {row.plasma}
                </span>,
              ])}
            </span>
          </div>}
      </div>

      {isRedCellComponent(component) &&
        <>
          <CalculatorNumberField
            label={names.labels.currentPcv}
            min="0"
            step="0.1"
            value={inputs.currentPcv}
            onChange={(e) => handleNumberChange(e, 'currentPcv')}
          />
          <CalculatorNumberField
            label={names.labels.targetPcv}
            min="0"
            step="0.1"
            value={inputs.targetPcv}
            onChange={(e) => handleNumberChange(e, 'targetPcv')}
          />
          <CalculatorNumberField
            label={productPcvLabel}
            min="0"
            step="0.1"
            value={inputs.productPcv}
            onChange={(e) => handleNumberChange(e, 'productPcv')}
          />
          {component === 'packedRbc' &&
            <CalculatorNumberField
              label={names.labels.plannedVolumeMl}
              min="0"
              step="0.1"
              value={inputs.plannedVolumeMl}
              onChange={(e) => handleNumberChange(e, 'plannedVolumeMl')}
            />}
          <CalculatorError>{redCellError}</CalculatorError>
        </>}

      {component === 'albumin' &&
        <>
          <CalculatorNumberField
            label={names.labels.currentAlbuminGL}
            min="0"
            step="0.1"
            value={inputs.currentAlbuminGL}
            onChange={(e) => handleNumberChange(e, 'currentAlbuminGL')}
          />
          <CalculatorNumberField
            label={names.labels.targetAlbuminGL}
            min="0"
            step="0.1"
            value={inputs.targetAlbuminGL}
            onChange={(e) => handleNumberChange(e, 'targetAlbuminGL')}
          />
          <CalculatorError>{albuminError}</CalculatorError>
          <CalculatorPanel>{names.albuminNote}</CalculatorPanel>
        </>}

      <CalculatorResult
        align="start"
        multiline
      >
        {resultText}
      </CalculatorResult>
      {component !== 'donorCollection' && component !== 'albumin' &&
        <CalculatorPanel>{names.safety}</CalculatorPanel>}
    </CalculatorForm>
  )
}
