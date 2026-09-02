import { useMemo, useState, type ChangeEvent } from 'react'
import {
  calculateCalciumCorrection,
  calciumFluidIds,
  formatCalciumNumber,
  getCalciumCorrectionDirection,
  getCompatibleCalciumFluids,
  type CalciumDoseRange,
  type CalciumFluid,
  type CalciumFluidId,
} from '../../domain/calciumCorrection'
import {
  calculateChlorideCorrection,
  chlorideFluidIds,
  formatChlorideNumber,
  getChlorideCorrectionDirection,
  getCompatibleChlorideFluids,
  type ChlorideFluid,
  type ChlorideFluidId,
} from '../../domain/chlorideCorrection'
import {
  calculateGlucoseInsulinMixture,
  formatGlucoseInsulinNumber,
  glucoseInsulinProtocolIds,
  type GlucoseInsulinProtocolId,
  type GlucoseInsulinRange,
} from '../../domain/glucoseInsulin'
import {
  calculateKaliumReplacement,
  formatKaliumNumber,
  type KaliumDoseRange,
} from '../../domain/kaliumReplacement'
import {
  calculateSodiumCorrection,
  formatSodiumNumber,
  getCompatibleSodiumFluids,
  getSodiumCorrectionDirection,
  sodiumChronicityLabels,
  sodiumFluidIds,
  type SodiumChronicity,
  type SodiumFluid,
  type SodiumFluidId,
} from '../../domain/sodiumCorrection'
import {
  CalculatorDescription,
  CalculatorError,
  CalculatorForm,
  CalculatorNumberField,
  CalculatorPanel,
  CalculatorResult,
  CalculatorSelectField,
  type CalculatorSelectOption,
} from '../../ui/CalculatorForm'

type ElectrolyteSpecies = 'cat' | 'dog'
type ElectrolyteId = 'calcium' | 'chloride' | 'kalium' | 'sodium'
type GlucoseConcentrationPercent = 5 | 10 | 20 | 40 | 50
type InsulinProductId =
  | 'actrapid'
  | 'humalog'
  | 'humulinRegular'
  | 'insumanRapid'
  | 'novorapid'
type NumberFieldKey =
  | 'calciumGluconateConcentrationPercent'
  | 'chlorideSodiumMmolL'
  | 'currentLevelMmolL'
  | 'kaliumChlorideConcentrationPercent'
  | 'targetLevelMmolL'
  | 'weightKg'
type NumberInputs = Record<NumberFieldKey, string>

const names = {
  title: 'Корректировка электролитов',
  labels: {
    calciumGluconateConcentration: 'Концентрация кальция глюконата, %',
    chronicity: 'Характер нарушения',
    chlorideSodium: 'Натрий пациента, ммоль/л',
    currentLevel: 'Начальный уровень, ммоль/л',
    electrolyte: 'Электролит',
    glucoseConcentration: 'Концентрация глюкозы',
    insulinProduct: 'Инсулин короткого действия',
    kaliumChlorideConcentration: 'Концентрация калия хлорида, %',
    protocol: 'Протокол',
    solution: 'Раствор/препарат',
    species: 'Вид животного',
    targetLevel: 'Желаемый уровень, ммоль/л',
    weightKg: 'Масса, кг',
  },
  placeholders: {
    protocol: 'Сначала укажите электролит и уровни',
    solution: 'Сначала укажите уровни электролита',
  },
  sources: 'Источники: AAHA 2024; BSAVA Library; Merck Veterinary Manual.',
} as const

const speciesOptions = [
  {
    id: 'electrolytes-species-dog',
    label: 'Собака',
    value: 'dog',
  },
  {
    id: 'electrolytes-species-cat',
    label: 'Кошка',
    value: 'cat',
  },
] as const

const electrolyteOptions = [
  {
    id: 'electrolytes-sodium',
    label: 'Натрий',
    value: 'sodium',
  },
  {
    id: 'electrolytes-kalium',
    label: 'Калий',
    value: 'kalium',
  },
  {
    id: 'electrolytes-chloride',
    label: 'Хлор',
    value: 'chloride',
  },
  {
    id: 'electrolytes-calcium',
    label: 'Кальций',
    value: 'calcium',
  },
] as const

const chronicityOptions = [
  {
    id: 'electrolytes-chronicity-chronic',
    label: sodiumChronicityLabels.chronic,
    value: 'chronic',
  },
  {
    id: 'electrolytes-chronicity-acute',
    label: sodiumChronicityLabels.acute,
    value: 'acute',
  },
] as const

const glucoseConcentrationOptions = [
  {
    id: 'electrolytes-glucose-5',
    label: '5%',
    value: '5',
  },
  {
    id: 'electrolytes-glucose-10',
    label: '10%',
    value: '10',
  },
  {
    id: 'electrolytes-glucose-20',
    label: '20%',
    value: '20',
  },
  {
    id: 'electrolytes-glucose-40',
    label: '40%',
    value: '40',
  },
  {
    id: 'electrolytes-glucose-50',
    label: '50%',
    value: '50',
  },
] as const

const insulinProductOptions = [
  {
    id: 'electrolytes-insulin-actrapid',
    label: 'Актрапид НМ',
    value: 'actrapid',
  },
  {
    id: 'electrolytes-insulin-humulin-regular',
    label: 'Хумулин Регуляр',
    value: 'humulinRegular',
  },
  {
    id: 'electrolytes-insulin-insuman-rapid',
    label: 'Инсуман Рапид ГТ',
    value: 'insumanRapid',
  },
  {
    id: 'electrolytes-insulin-humalog',
    label: 'Хумалог',
    value: 'humalog',
  },
  {
    id: 'electrolytes-insulin-novorapid',
    label: 'НовоРапид',
    value: 'novorapid',
  },
] as const

const sodiumControlledProtocolId = 'sodium-controlled'
const kaliumReplacementProtocolId = 'kalium-replacement'
const chlorideReplacementProtocolId = 'chloride-replacement'
const chlorideLoadReductionProtocolId = 'chloride-load-reduction'
const calciumGluconateProtocolId = 'calcium-gluconate'
const calciumHypercalcemiaProtocolId = 'calcium-hypercalcemia'

const glucoseInsulinProtocolOptions = [
  {
    id: 'electrolytes-protocol-regular025',
    label: 'Регулярный инсулин 0.25 ЕД/кг + глюкоза 0.5 г/кг',
    value: 'regular025',
  },
  {
    id: 'electrolytes-protocol-bsava05',
    label: 'Растворимый инсулин 0.5 ЕД/кг + глюкоза 2-3 г/ЕД',
    value: 'bsava05',
  },
] as const

const numberInputDefaults: NumberInputs = {
  calciumGluconateConcentrationPercent: '10',
  chlorideSodiumMmolL: '',
  currentLevelMmolL: '',
  kaliumChlorideConcentrationPercent: '4',
  targetLevelMmolL: '',
  weightKg: '',
}

const decimalNumberPattern = /^\d*(?:\.\d{0,3})?$/
const calciumFluidIdSet = new Set<CalciumFluidId>(calciumFluidIds)
const chlorideFluidIdSet = new Set<ChlorideFluidId>(chlorideFluidIds)
const electrolyteSet = new Set<ElectrolyteId>([
  'calcium',
  'chloride',
  'kalium',
  'sodium',
])
const glucoseConcentrationSet = new Set<string>(
  glucoseConcentrationOptions.map((option) => option.value),
)
const glucoseInsulinProtocolSet = new Set<GlucoseInsulinProtocolId>(
  glucoseInsulinProtocolIds,
)
const insulinProductSet = new Set<InsulinProductId>(
  insulinProductOptions.map((option) => option.value),
)
const sodiumChronicitySet = new Set<SodiumChronicity>(['acute', 'chronic'])
const sodiumFluidIdSet = new Set<SodiumFluidId>(sodiumFluidIds)
const speciesSet = new Set<ElectrolyteSpecies>(['cat', 'dog'])

const isElectrolyteId = (value: string): value is ElectrolyteId => (
  electrolyteSet.has(value as ElectrolyteId)
)

const isCalciumFluidId = (value: string): value is CalciumFluidId => (
  calciumFluidIdSet.has(value as CalciumFluidId)
)

const isChlorideFluidId = (value: string): value is ChlorideFluidId => (
  chlorideFluidIdSet.has(value as ChlorideFluidId)
)

const isGlucoseConcentrationPercent = (
  value: string,
): value is `${GlucoseConcentrationPercent}` => glucoseConcentrationSet.has(value)

const isGlucoseInsulinProtocolId = (
  value: string,
): value is GlucoseInsulinProtocolId => (
  glucoseInsulinProtocolSet.has(value as GlucoseInsulinProtocolId)
)

const isInsulinProductId = (value: string): value is InsulinProductId => (
  insulinProductSet.has(value as InsulinProductId)
)

const isSodiumChronicity = (value: string): value is SodiumChronicity => (
  sodiumChronicitySet.has(value as SodiumChronicity)
)

const isSodiumFluidId = (value: string): value is SodiumFluidId => (
  sodiumFluidIdSet.has(value as SodiumFluidId)
)

const isSpecies = (value: string): value is ElectrolyteSpecies => (
  speciesSet.has(value as ElectrolyteSpecies)
)

const readNumberInput = (value: string): number | undefined => {
  if (value === '') return undefined

  const parsedValue = Number(value.replace(',', '.'))

  return Number.isFinite(parsedValue) ? parsedValue : undefined
}

const hasPositiveNumber = (value: unknown): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value > 0
)

const formatSignedNumber = (value: number) => (
  `${value > 0 ? '+' : ''}${formatSodiumNumber(value, 2)}`
)

const formatGlucoseRange = (
  range: GlucoseInsulinRange,
  unit: string,
  digits = 1,
) => (
  range.min === range.max
    ? `${formatGlucoseInsulinNumber(range.min, digits)} ${unit}`
    : `${formatGlucoseInsulinNumber(range.min, digits)}-${formatGlucoseInsulinNumber(range.max, digits)} ${unit}`
)

const formatKaliumRange = (
  range: KaliumDoseRange,
  unit: string,
  digits = 1,
) => (
  range.min === range.max
    ? `${formatKaliumNumber(range.max, digits)} ${unit}`
    : `${formatKaliumNumber(range.min, digits)}-${formatKaliumNumber(range.max, digits)} ${unit}`
)

const formatCalciumRange = (
  range: CalciumDoseRange,
  unit: string,
  digits = 1,
) => (
  range.min === range.max
    ? `${formatCalciumNumber(range.max, digits)} ${unit}`
    : `${formatCalciumNumber(range.min, digits)}-${formatCalciumNumber(range.max, digits)} ${unit}`
)

const formatSodiumFluidLabel = (fluid: SodiumFluid) => (
  fluid.label
    .replace(' / D5W', '')
    .replaceAll('NaCl', 'натрия хлорид')
)

const formatChlorideFluidLabel = (fluid: ChlorideFluid) => fluid.label

const formatCalciumFluidLabel = (fluid: CalciumFluid) => fluid.label

const getValidFluidId = <T extends string>(
  fluidId: T | '',
  compatibleFluids: readonly { id: T }[],
) => (
  fluidId === '' || compatibleFluids.some(({ id }) => id === fluidId)
    ? fluidId
    : ''
)

export default function ElectrolytesPage() {
  const [calciumFluidId, setCalciumFluidId] = useState<CalciumFluidId | ''>('')
  const [chronicity, setChronicity] = useState<SodiumChronicity>('chronic')
  const [chlorideFluidId, setChlorideFluidId] = useState<ChlorideFluidId | ''>('')
  const [electrolyte, setElectrolyte] = useState<ElectrolyteId>()
  const [glucoseConcentration, setGlucoseConcentration] =
    useState<GlucoseConcentrationPercent>(50)
  const [glucoseInsulinProtocolId, setGlucoseInsulinProtocolId] =
    useState<GlucoseInsulinProtocolId>('regular025')
  const [inputs, setInputs] = useState<NumberInputs>(numberInputDefaults)
  const [insulinProductId, setInsulinProductId] = useState<InsulinProductId>('actrapid')
  const [sodiumFluidId, setSodiumFluidId] = useState<SodiumFluidId | ''>('')
  const [species, setSpecies] = useState<ElectrolyteSpecies>()

  const numericValues = useMemo(() => ({
    calciumGluconateConcentrationPercent: readNumberInput(
      inputs.calciumGluconateConcentrationPercent,
    ),
    chlorideSodiumMmolL: readNumberInput(inputs.chlorideSodiumMmolL),
    currentLevelMmolL: readNumberInput(inputs.currentLevelMmolL),
    kaliumChlorideConcentrationPercent: readNumberInput(
      inputs.kaliumChlorideConcentrationPercent,
    ),
    targetLevelMmolL: readNumberInput(inputs.targetLevelMmolL),
    weightKg: readNumberInput(inputs.weightKg),
  }), [inputs])

  const isSodiumMode = electrolyte === 'sodium'
  const isKaliumMode = electrolyte === 'kalium'
  const isChlorideMode = electrolyte === 'chloride'
  const isCalciumMode = electrolyte === 'calcium'
  const isBaseLevelReady = (
    hasPositiveNumber(numericValues.currentLevelMmolL) &&
    hasPositiveNumber(numericValues.targetLevelMmolL) &&
    numericValues.currentLevelMmolL !== numericValues.targetLevelMmolL
  )

  const sodiumDirection = useMemo(() => (
    isSodiumMode
      ? getSodiumCorrectionDirection(
        numericValues.currentLevelMmolL,
        numericValues.targetLevelMmolL,
      )
      : undefined
  ), [
    isSodiumMode,
    numericValues.currentLevelMmolL,
    numericValues.targetLevelMmolL,
  ])

  const chlorideDirection = useMemo(() => (
    isChlorideMode
      ? getChlorideCorrectionDirection(
        numericValues.currentLevelMmolL,
        numericValues.chlorideSodiumMmolL,
        numericValues.targetLevelMmolL,
      )
      : undefined
  ), [
    isChlorideMode,
    numericValues.chlorideSodiumMmolL,
    numericValues.currentLevelMmolL,
    numericValues.targetLevelMmolL,
  ])

  const calciumDirection = useMemo(() => (
    isCalciumMode
      ? getCalciumCorrectionDirection(
        numericValues.currentLevelMmolL,
        numericValues.targetLevelMmolL,
      )
      : undefined
  ), [
    isCalciumMode,
    numericValues.currentLevelMmolL,
    numericValues.targetLevelMmolL,
  ])

  const shouldIncreaseLevel = (
    isChlorideMode
      ? chlorideDirection === 'increase'
      : isCalciumMode
        ? calciumDirection === 'increase'
        : isBaseLevelReady && (
          numericValues.targetLevelMmolL as number
        ) > (
          numericValues.currentLevelMmolL as number
        )
  )
  const shouldDecreaseLevel = (
    isChlorideMode
      ? chlorideDirection === 'decrease'
      : isCalciumMode
        ? calciumDirection === 'decrease'
        : isBaseLevelReady && (
          numericValues.targetLevelMmolL as number
        ) < (
          numericValues.currentLevelMmolL as number
        )
  )
  const isLevelDirectionReady = (
    electrolyte === undefined
      ? false
      : isChlorideMode
        ? chlorideDirection !== undefined
        : isCalciumMode
          ? calciumDirection !== undefined
          : isBaseLevelReady
  )
  const isKaliumReplacementMode = isKaliumMode && shouldIncreaseLevel
  const isGlucoseInsulinMode = isKaliumMode && shouldDecreaseLevel
  const isCalciumGluconateMode = isCalciumMode && shouldIncreaseLevel
  const isHypercalcemiaMode = isCalciumMode && shouldDecreaseLevel

  const compatibleSodiumFluids = useMemo(() => (
    isSodiumMode
      ? getCompatibleSodiumFluids(
        numericValues.currentLevelMmolL,
        numericValues.targetLevelMmolL,
      )
      : []
  ), [
    isSodiumMode,
    numericValues.currentLevelMmolL,
    numericValues.targetLevelMmolL,
  ])

  const selectedSodiumFluidId = getValidFluidId(sodiumFluidId, compatibleSodiumFluids)

  const sodiumFluidOptions = useMemo(() => compatibleSodiumFluids.map((fluid) => ({
    id: `electrolytes-sodium-fluid-${fluid.id}`,
    label: `${formatSodiumFluidLabel(fluid)} - натрий ${formatSodiumNumber(fluid.sodiumMmolL)} ммоль/л`,
    value: fluid.id,
  })), [compatibleSodiumFluids])

  const compatibleChlorideFluids = useMemo(() => (
    isChlorideMode
      ? getCompatibleChlorideFluids(
        numericValues.currentLevelMmolL,
        numericValues.chlorideSodiumMmolL,
        numericValues.targetLevelMmolL,
      )
      : []
  ), [
    isChlorideMode,
    numericValues.chlorideSodiumMmolL,
    numericValues.currentLevelMmolL,
    numericValues.targetLevelMmolL,
  ])

  const selectedChlorideFluidId = getValidFluidId(
    chlorideFluidId,
    compatibleChlorideFluids,
  )

  const chlorideFluidOptions = useMemo(() => compatibleChlorideFluids.map((fluid) => ({
    id: `electrolytes-chloride-fluid-${fluid.id}`,
    label: `${formatChlorideFluidLabel(fluid)} - хлор ${formatChlorideNumber(fluid.chlorideMmolL)} ммоль/л`,
    value: fluid.id,
  })), [compatibleChlorideFluids])

  const compatibleCalciumFluids = useMemo(() => (
    isHypercalcemiaMode
      ? getCompatibleCalciumFluids(
        numericValues.currentLevelMmolL,
        numericValues.targetLevelMmolL,
      )
      : []
  ), [
    isHypercalcemiaMode,
    numericValues.currentLevelMmolL,
    numericValues.targetLevelMmolL,
  ])

  const selectedCalciumFluidId = getValidFluidId(
    calciumFluidId,
    compatibleCalciumFluids,
  )

  const calciumFluidOptions = useMemo(() => compatibleCalciumFluids.map((fluid) => ({
    id: `electrolytes-calcium-fluid-${fluid.id}`,
    label: formatCalciumFluidLabel(fluid),
    value: fluid.id,
  })), [compatibleCalciumFluids])

  const protocolOptions = useMemo<readonly CalculatorSelectOption[]>(() => {
    if (!isLevelDirectionReady || electrolyte === undefined) {
      return []
    }

    if (isSodiumMode) {
      return [
        {
          id: 'electrolytes-protocol-sodium-controlled',
          label: shouldIncreaseLevel
            ? 'Контролируемое повышение натрия раствором'
            : 'Контролируемое снижение натрия раствором',
          value: sodiumControlledProtocolId,
        },
      ]
    }

    if (isChlorideMode) {
      return [
        {
          id: shouldIncreaseLevel
            ? 'electrolytes-protocol-chloride-replacement'
            : 'electrolytes-protocol-chloride-load-reduction',
          label: shouldIncreaseLevel
            ? 'Восполнение хлора раствором натрия хлорида'
            : 'Снижение хлорной нагрузки',
          value: shouldIncreaseLevel
            ? chlorideReplacementProtocolId
            : chlorideLoadReductionProtocolId,
        },
      ]
    }

    if (isCalciumMode) {
      return [
        {
          id: shouldIncreaseLevel
            ? 'electrolytes-protocol-calcium-gluconate'
            : 'electrolytes-protocol-calcium-hypercalcemia',
          label: shouldIncreaseLevel
            ? 'Кальция глюконат при гипокальциемии'
            : 'Инфузионная коррекция гиперкальциемии',
          value: shouldIncreaseLevel
            ? calciumGluconateProtocolId
            : calciumHypercalcemiaProtocolId,
        },
      ]
    }

    if (isKaliumReplacementMode) {
      return [
        {
          id: 'electrolytes-protocol-kalium-replacement',
          label: 'Восполнение калия хлоридом',
          value: kaliumReplacementProtocolId,
        },
      ]
    }

    return glucoseInsulinProtocolOptions
  }, [
    electrolyte,
    isCalciumMode,
    isChlorideMode,
    isKaliumReplacementMode,
    isLevelDirectionReady,
    isSodiumMode,
    shouldIncreaseLevel,
  ])

  const selectedProtocolId = isSodiumMode
    ? sodiumControlledProtocolId
    : isChlorideMode
      ? shouldIncreaseLevel
        ? chlorideReplacementProtocolId
        : shouldDecreaseLevel
          ? chlorideLoadReductionProtocolId
          : ''
      : isCalciumGluconateMode
        ? calciumGluconateProtocolId
        : isHypercalcemiaMode
          ? calciumHypercalcemiaProtocolId
          : isKaliumReplacementMode
            ? kaliumReplacementProtocolId
            : isGlucoseInsulinMode
              ? glucoseInsulinProtocolId
              : ''

  const sodiumResult = useMemo(() => {
    if (!isSodiumMode || species === undefined) {
      return undefined
    }

    return calculateSodiumCorrection({
      chronicity,
      currentSodiumMmolL: numericValues.currentLevelMmolL,
      fluidId: selectedSodiumFluidId === '' ? undefined : selectedSodiumFluidId,
      targetSodiumMmolL: numericValues.targetLevelMmolL,
      weightKg: numericValues.weightKg,
    })
  }, [
    chronicity,
    isSodiumMode,
    numericValues.currentLevelMmolL,
    numericValues.targetLevelMmolL,
    numericValues.weightKg,
    selectedSodiumFluidId,
    species,
  ])

  const kaliumReplacementResult = useMemo(() => {
    if (!isKaliumReplacementMode || species === undefined) {
      return undefined
    }

    return calculateKaliumReplacement({
      currentKaliumMmolL: numericValues.currentLevelMmolL,
      kclConcentrationPercent: numericValues.kaliumChlorideConcentrationPercent,
      weightKg: numericValues.weightKg,
    })
  }, [
    isKaliumReplacementMode,
    numericValues.currentLevelMmolL,
    numericValues.kaliumChlorideConcentrationPercent,
    numericValues.weightKg,
    species,
  ])

  const glucoseInsulinResult = useMemo(() => {
    if (!isGlucoseInsulinMode || species === undefined) {
      return undefined
    }

    return calculateGlucoseInsulinMixture({
      currentKaliumMmolL: numericValues.currentLevelMmolL,
      glucoseConcentrationPercent: glucoseConcentration,
      protocolId: glucoseInsulinProtocolId,
      targetKaliumMmolL: numericValues.targetLevelMmolL,
      weightKg: numericValues.weightKg,
    })
  }, [
    glucoseConcentration,
    glucoseInsulinProtocolId,
    isGlucoseInsulinMode,
    numericValues.currentLevelMmolL,
    numericValues.targetLevelMmolL,
    numericValues.weightKg,
    species,
  ])

  const chlorideResult = useMemo(() => {
    if (!isChlorideMode || species === undefined) {
      return undefined
    }

    return calculateChlorideCorrection({
      currentChlorideMmolL: numericValues.currentLevelMmolL,
      currentSodiumMmolL: numericValues.chlorideSodiumMmolL,
      fluidId: selectedChlorideFluidId === '' ? undefined : selectedChlorideFluidId,
      targetChlorideMmolL: numericValues.targetLevelMmolL,
    })
  }, [
    isChlorideMode,
    numericValues.chlorideSodiumMmolL,
    numericValues.currentLevelMmolL,
    numericValues.targetLevelMmolL,
    selectedChlorideFluidId,
    species,
  ])

  const calciumResult = useMemo(() => {
    if (!isCalciumMode || species === undefined) {
      return undefined
    }

    return calculateCalciumCorrection({
      calciumGluconateConcentrationPercent: numericValues.calciumGluconateConcentrationPercent,
      currentCalciumMmolL: numericValues.currentLevelMmolL,
      fluidId: selectedCalciumFluidId === '' ? undefined : selectedCalciumFluidId,
      targetCalciumMmolL: numericValues.targetLevelMmolL,
      weightKg: numericValues.weightKg,
    })
  }, [
    isCalciumMode,
    numericValues.calciumGluconateConcentrationPercent,
    numericValues.currentLevelMmolL,
    numericValues.targetLevelMmolL,
    numericValues.weightKg,
    selectedCalciumFluidId,
    species,
  ])

  const handleNumberChange = (
    e: ChangeEvent<HTMLInputElement>,
    key: NumberFieldKey,
  ) => {
    const normalizedInput = e.target.value.replace(',', '.')

    if (!decimalNumberPattern.test(normalizedInput)) {
      return
    }

    const nextInputs = {
      ...inputs,
      [key]: e.target.value,
    }

    setInputs(nextInputs)

    if (key === 'currentLevelMmolL' || key === 'targetLevelMmolL') {
      setSodiumFluidId((prev) => getValidFluidId(
        prev,
        getCompatibleSodiumFluids(
          readNumberInput(nextInputs.currentLevelMmolL),
          readNumberInput(nextInputs.targetLevelMmolL),
        ),
      ))
    }

    if (
      key === 'currentLevelMmolL' ||
      key === 'targetLevelMmolL' ||
      key === 'chlorideSodiumMmolL'
    ) {
      setChlorideFluidId((prev) => getValidFluidId(
        prev,
        getCompatibleChlorideFluids(
          readNumberInput(nextInputs.currentLevelMmolL),
          readNumberInput(nextInputs.chlorideSodiumMmolL),
          readNumberInput(nextInputs.targetLevelMmolL),
        ),
      ))
      setCalciumFluidId((prev) => getValidFluidId(
        prev,
        getCompatibleCalciumFluids(
          readNumberInput(nextInputs.currentLevelMmolL),
          readNumberInput(nextInputs.targetLevelMmolL),
        ),
      ))
    }
  }

  const handleSpeciesChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSpecies(isSpecies(e.target.value) ? e.target.value : undefined)
  }

  const handleElectrolyteChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setElectrolyte(isElectrolyteId(e.target.value) ? e.target.value : undefined)
    setCalciumFluidId('')
    setChlorideFluidId('')
    setSodiumFluidId('')
  }

  const handleChronicityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (isSodiumChronicity(e.target.value)) {
      setChronicity(e.target.value)
    }
  }

  const handleGlucoseConcentrationChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (isGlucoseConcentrationPercent(e.target.value)) {
      setGlucoseConcentration(Number(e.target.value) as GlucoseConcentrationPercent)
    }
  }

  const handleInsulinProductChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setInsulinProductId(
      isInsulinProductId(e.target.value) ? e.target.value : 'actrapid',
    )
  }

  const handleProtocolChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (isGlucoseInsulinMode && isGlucoseInsulinProtocolId(e.target.value)) {
      setGlucoseInsulinProtocolId(e.target.value)
    }
  }

  const handleSodiumFluidChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSodiumFluidId(
      isSodiumFluidId(e.target.value) ? e.target.value : '',
    )
  }

  const handleChlorideFluidChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setChlorideFluidId(
      isChlorideFluidId(e.target.value) ? e.target.value : '',
    )
  }

  const handleCalciumFluidChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setCalciumFluidId(
      isCalciumFluidId(e.target.value) ? e.target.value : '',
    )
  }

  const directionText = useMemo(() => {
    if (electrolyte === undefined) {
      return 'Выберите электролит, затем укажите начальный и желаемый уровень.'
    }

    if (isChlorideMode && !hasPositiveNumber(numericValues.chlorideSodiumMmolL)) {
      return 'Для расчета хлора укажите натрий пациента.'
    }

    if (!isLevelDirectionReady) {
      return 'Укажите разные начальный и желаемый уровни электролита.'
    }

    if (isSodiumMode) {
      return shouldIncreaseLevel
        ? 'Направление коррекции: гипонатриемия, повышение натрия.'
        : 'Направление коррекции: гипернатриемия, снижение натрия.'
    }

    if (isChlorideMode) {
      return shouldIncreaseLevel
        ? 'Направление коррекции: гипохлоремия, восполнение хлора.'
        : 'Направление коррекции: гиперхлоремия, снижение хлорной нагрузки.'
    }

    if (isCalciumMode) {
      return shouldIncreaseLevel
        ? 'Направление коррекции: гипокальциемия, восполнение кальция.'
        : 'Направление коррекции: гиперкальциемия, снижение кальция.'
    }

    return shouldIncreaseLevel
      ? 'Направление коррекции: гипокалиемия, восполнение калия.'
      : 'Направление коррекции: гиперкалиемия, снижение калия.'
  }, [
    electrolyte,
    isLevelDirectionReady,
    isCalciumMode,
    isChlorideMode,
    isSodiumMode,
    numericValues.chlorideSodiumMmolL,
    shouldIncreaseLevel,
  ])

  const sodiumWarningText = [
    isSodiumMode &&
      hasPositiveNumber(numericValues.currentLevelMmolL) &&
      hasPositiveNumber(numericValues.targetLevelMmolL) &&
      numericValues.currentLevelMmolL === numericValues.targetLevelMmolL
      ? 'Начальный и желаемый натрий совпадают: коррекция не требуется.'
      : undefined,
    isSodiumMode && sodiumDirection !== undefined && compatibleSodiumFluids.length === 0
      ? 'Для заданного желаемого натрия нет подходящего раствора в списке.'
      : undefined,
    sodiumResult !== undefined &&
      chronicity === 'chronic' &&
      sodiumResult.sodiumDeltaMmolL > 12
      ? 'Разница натрия больше 12 ммоль/л: коррекцию нужно растягивать и пересчитывать по контрольным анализам.'
      : undefined,
  ].filter(Boolean).join('\n')

  const glucoseInsulinWarningText = [
    isGlucoseInsulinMode && glucoseInsulinResult !== undefined &&
      !glucoseInsulinResult.isSevereHyperkalemia
      ? 'Калий ниже 7 ммоль/л: оцените показания, электрокардиограмму и клинический контекст перед использованием смеси.'
      : undefined,
    isGlucoseInsulinMode && glucoseInsulinResult !== undefined &&
      glucoseInsulinResult.isLargeKaliumGoal
      ? 'Цель снижения больше 1.5 ммоль/л: дозу инсулина не увеличивают пропорционально разнице калия, нужен контрольный анализ и устранение причины гиперкалиемии.'
      : undefined,
  ].filter(Boolean).join('\n')

  const chlorideWarningText = [
    isChlorideMode &&
      hasPositiveNumber(numericValues.currentLevelMmolL) &&
      hasPositiveNumber(numericValues.chlorideSodiumMmolL) &&
      hasPositiveNumber(numericValues.targetLevelMmolL) &&
      chlorideDirection === undefined
      ? 'Скорректированный хлор совпадает с желаемым уровнем: коррекция не требуется.'
      : undefined,
    isChlorideMode && chlorideDirection !== undefined && compatibleChlorideFluids.length === 0
      ? 'Для заданного направления коррекции хлора нет подходящего раствора в списке.'
      : undefined,
  ].filter(Boolean).join('\n')

  const calciumWarningText = [
    isCalciumMode &&
      hasPositiveNumber(numericValues.currentLevelMmolL) &&
      hasPositiveNumber(numericValues.targetLevelMmolL) &&
      numericValues.currentLevelMmolL === numericValues.targetLevelMmolL
      ? 'Начальный и желаемый кальций совпадают: коррекция не требуется.'
      : undefined,
    isCalciumGluconateMode && calciumResult !== undefined
      ? 'Кальция глюконат вводить медленно с мониторингом электрокардиограммы; при брадикардии или укорочении интервала QT замедлить или временно остановить введение.'
      : undefined,
  ].filter(Boolean).join('\n')

  const warningText = [
    sodiumWarningText,
    glucoseInsulinWarningText,
    chlorideWarningText,
    calciumWarningText,
  ].filter(Boolean).join('\n')

  const sodiumCommentText = sodiumResult === undefined
    ? `Для хронических или неизвестных по давности нарушений: не быстрее 0.5 ммоль/л/ч и не более 10-12 ммоль/л/сут.
При гиповолемии сначала восстановить перфузию буферным изотоническим раствором, затем корректировать натрий.
Контроль натрия каждые 4-6 часов с пересчетом плана по фактической динамике.`
    : `${chronicity === 'acute' ? 'Острое нарушение' : 'Хроническое или неизвестное нарушение'}: максимально ${formatSodiumNumber(sodiumResult.maxCorrectionRateMmolLHour, 2)} ммоль/л/ч.
При гиповолемии сначала восстановить перфузию, затем корректировать натрий.
Контроль натрия каждые 4-6 часов с пересчетом плана по фактической динамике.`

  const kaliumReplacementCommentText = `Калия хлорид не вводить болюсно. Раствор после добавления тщательно перемешивать.
Не использовать раствор с калия хлоридом для быстрой противошоковой инфузии.
При тяжелой гипокалиемии нужен мониторинг калия, электрокардиограммы и контроль диуреза/функции почек.
Расчет дозы основан на начальном уровне калия; желаемый уровень используется как цель контроля.`

  const glucoseInsulinCommentText = `Глюкозо-инсулиновая смесь временно перемещает калий внутрь клеток и не устраняет причину гиперкалиемии.
При изменениях электрокардиограммы или брадиаритмии кальция глюконат используют для защиты миокарда до или параллельно коррекции калия.
Концентрированную глюкозу для периферического введения разводить. Контроль калия через 30-60 минут, контроль глюкозы через 60 минут и далее каждые 2 часа до 12 часов.`

  const chlorideCommentText = `Сначала оценить скорректированный хлор с учетом натрия: скорректированный хлор = измеренный хлор x 145 / натрий пациента.
При истинной гипохлоремии с метаболическим алкалозом исторически используют 0.9% раствор натрия хлорида.
При риске болезни почек или после коррекции хлора переходят на буферный изотонический кристаллоид; контроль электролитов частый.`

  const calciumCommentText = isCalciumGluconateMode
    ? `Кальция глюконат применяют при клинической гипокальциемии: слабость, тремор, тахикардия, судороги или другие значимые признаки.
Не смешивать кальций в одной линии с бикарбонат- или фосфатсодержащими растворами.
После купирования острых признаков дальнейшую терапию подбирают по ионизированному кальцию и причине нарушения.`
    : isHypercalcemiaMode
      ? `При гиперкальциемии основа - восстановление объема и поддержка кальциуреза с частым контролем кальция и функции почек.
0.9% раствор натрия хлорида исторически применяли для кальциуреза, но эффект умеренный; при риске повреждения почек предпочтительнее рассмотреть буферный изотонический кристаллоид.
Расчет объема инфузии выполняют по клинической гидратации, перфузии и сопутствующим потерям, а не по разнице кальция.`
      : undefined

  const commentText = isSodiumMode
    ? sodiumCommentText
    : isChlorideMode
      ? chlorideCommentText
      : isCalciumMode
        ? calciumCommentText
        : isKaliumReplacementMode
          ? kaliumReplacementCommentText
          : isGlucoseInsulinMode
            ? glucoseInsulinCommentText
            : undefined

  const sodiumResultText = sodiumResult === undefined
    ? undefined
    : `${directionText}
Общая вода организма: ${formatSodiumNumber(sodiumResult.totalBodyWaterL, 2)} л
Разница натрия: ${formatSodiumNumber(sodiumResult.sodiumDeltaMmolL)} ммоль/л
${sodiumResult.sodiumDeficitMmol === undefined ? '' : `Дефицит натрия: ${formatSodiumNumber(sodiumResult.sodiumDeficitMmol)} ммоль\n`}${sodiumResult.freeWaterDeficitMl === undefined ? '' : `Дефицит свободной воды: ${formatSodiumNumber(sodiumResult.freeWaterDeficitMl)} мл\n`}Выбранный раствор: ${formatSodiumFluidLabel(sodiumResult.fluid)}; натрий ${formatSodiumNumber(sodiumResult.fluid.sodiumMmolL)} ммоль/л
Ожидаемое изменение натрия на 1 л: ${formatSignedNumber(sodiumResult.expectedChangePerLiterMmolL)} ммоль/л
Расчетный объем раствора: ${formatSodiumNumber(sodiumResult.correctionVolumeMl)} мл
Минимальное время коррекции: ${formatSodiumNumber(sodiumResult.replacementTimeHours, 2)} ч
Расчетная скорость: ${formatSodiumNumber(sodiumResult.correctionRateMlHour, 2)} мл/ч${sodiumResult.hypertonicBolusMinMl === undefined || sodiumResult.hypertonicBolusMaxMl === undefined ? '' : `
Болюсный ориентир гипертонического раствора при неврологических признаках: ${formatSodiumNumber(sodiumResult.hypertonicBolusMinMl)}-${formatSodiumNumber(sodiumResult.hypertonicBolusMaxMl)} мл за 10-15 минут.`}`

  const kaliumReplacementResultText = kaliumReplacementResult === undefined ||
    !hasPositiveNumber(numericValues.kaliumChlorideConcentrationPercent)
    ? undefined
    : `${directionText}
Доза калия: ${formatKaliumRange(kaliumReplacementResult.kclDoseMlKgHour, 'мл/кг/ч', 2)}
Потребность калия: ${formatKaliumRange(kaliumReplacementResult.kclRateMlHour, 'мл/ч')}
Концентрация калия хлорида: ${formatKaliumNumber(numericValues.kaliumChlorideConcentrationPercent)}%`

  const insulinProductLabel = insulinProductOptions.find(
    (option) => option.value === insulinProductId,
  )?.label ?? 'Актрапид НМ'

  const glucoseProtocolText = glucoseInsulinResult === undefined
    ? undefined
    : glucoseInsulinResult.protocol.id === 'bsava05'
      ? `Инсулин растворимый: ${formatGlucoseInsulinNumber(glucoseInsulinResult.insulinUnits, 2)} ЕД в/в однократно (${formatGlucoseInsulinNumber(glucoseInsulinResult.protocol.insulinUnitsKg, 2)} ЕД/кг)
Декстроза всего: ${glucoseInsulinResult.dextroseTotalG === undefined ? '' : formatGlucoseRange(glucoseInsulinResult.dextroseTotalG, 'г')}
Глюкоза ${formatGlucoseInsulinNumber(glucoseInsulinResult.glucoseConcentrationPercent)}% всего: ${glucoseInsulinResult.glucoseTotalMl === undefined ? '' : formatGlucoseRange(glucoseInsulinResult.glucoseTotalMl, 'мл')}
1/2 объема глюкозы болюсно: ${glucoseInsulinResult.glucoseBolusMlRange === undefined ? '' : formatGlucoseRange(glucoseInsulinResult.glucoseBolusMlRange, 'мл')} (${glucoseInsulinResult.glucoseBolusGRange === undefined ? '' : formatGlucoseRange(glucoseInsulinResult.glucoseBolusGRange, 'г')})
Остаток глюкозы в/в за 4-6 часов: ${glucoseInsulinResult.glucoseRemainderMl === undefined ? '' : formatGlucoseRange(glucoseInsulinResult.glucoseRemainderMl, 'мл')}`
      : `Инсулин регулярный: ${formatGlucoseInsulinNumber(glucoseInsulinResult.insulinUnits, 2)} ЕД в/в однократно (${formatGlucoseInsulinNumber(glucoseInsulinResult.protocol.insulinUnitsKg, 2)} ЕД/кг)
Глюкоза ${formatGlucoseInsulinNumber(glucoseInsulinResult.glucoseConcentrationPercent)}% болюсно: ${formatGlucoseInsulinNumber(glucoseInsulinResult.glucoseBolusMl ?? 0)} мл (${formatGlucoseInsulinNumber(glucoseInsulinResult.glucoseBolusG ?? 0)} г)
${glucoseInsulinResult.dilutionSalineMl === undefined || glucoseInsulinResult.dilutedBolusMl === undefined ? '' : `Разведение глюкозы 1:2-1:4: добавить ${formatGlucoseRange(glucoseInsulinResult.dilutionSalineMl, 'мл')} 0.9% раствора натрия хлорида
Итоговый объем разведенного болюса: ${formatGlucoseRange(glucoseInsulinResult.dilutedBolusMl, 'мл')}\n`}Далее: 2.5-5% глюкоза постоянной инфузией на 4-6 часов по гликемии.`

  const glucoseInsulinResultText = glucoseInsulinResult === undefined
    ? undefined
    : `${directionText}
Цель снижения калия: ${formatGlucoseInsulinNumber(glucoseInsulinResult.kaliumDecreaseGoalMmolL)} ммоль/л (${formatGlucoseInsulinNumber(glucoseInsulinResult.currentKaliumMmolL)} -> ${formatGlucoseInsulinNumber(glucoseInsulinResult.targetKaliumMmolL)})
Выбранный инсулин: ${insulinProductLabel}
${glucoseProtocolText}
Пик эффекта ожидается через 30-60 минут, длительность действия 4-6 часов.`

  const chlorideResultText = chlorideResult === undefined
    ? undefined
    : `${directionText}
Измеренный хлор: ${formatChlorideNumber(chlorideResult.measuredChlorideMmolL)} ммоль/л
Натрий пациента: ${formatChlorideNumber(chlorideResult.measuredSodiumMmolL)} ммоль/л
Скорректированный хлор: ${formatChlorideNumber(chlorideResult.correctedChlorideMmolL)} ммоль/л
Желаемый хлор: ${formatChlorideNumber(chlorideResult.targetChlorideMmolL)} ммоль/л
Разница по скорректированному хлору: ${formatSignedNumber(chlorideResult.chlorideDeltaMmolL)} ммоль/л
${chlorideResult.fluid === undefined ? 'Раствор/препарат: не выбран' : `Выбранный раствор: ${formatChlorideFluidLabel(chlorideResult.fluid)}; хлор ${formatChlorideNumber(chlorideResult.fluid.chlorideMmolL)} ммоль/л`}
Формула: измеренный хлор x 145 / натрий пациента.`

  const calciumHypocalcemiaResultText = calciumResult === undefined ||
    !isCalciumGluconateMode ||
    calciumResult.doseMlKg === undefined ||
    calciumResult.totalDoseMl === undefined ||
    calciumResult.infusionMinutes === undefined ||
    calciumResult.calciumGluconateConcentrationPercent === undefined
    ? undefined
    : `${directionText}
Разница кальция: ${formatSignedNumber(calciumResult.calciumDeltaMmolL)} ммоль/л
Кальция глюконат ${formatCalciumNumber(calciumResult.calciumGluconateConcentrationPercent)}%: ${formatCalciumRange(calciumResult.doseMlKg, 'мл/кг', 2)}
Объем на массу животного: ${formatCalciumRange(calciumResult.totalDoseMl, 'мл', 2)}
Время введения: ${formatCalciumRange(calciumResult.infusionMinutes, 'мин', 0)}
Путь введения: медленно в/в.`

  const calciumHypercalcemiaResultText = calciumResult === undefined ||
    !isHypercalcemiaMode
    ? undefined
    : `${directionText}
Разница кальция: ${formatSignedNumber(calciumResult.calciumDeltaMmolL)} ммоль/л
${calciumResult.fluid === undefined ? 'Раствор/препарат: не выбран' : `Выбранный раствор: ${formatCalciumFluidLabel(calciumResult.fluid)}`}
Расчет объема инфузии: по клинической гидратации, перфузии и потерям.
Целевой контроль: повторная оценка кальция и функции почек в динамике.`

  const resultText = sodiumResultText ??
    kaliumReplacementResultText ??
    glucoseInsulinResultText ??
    chlorideResultText ??
    calciumHypocalcemiaResultText ??
    calciumHypercalcemiaResultText

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
      <CalculatorSelectField
        label={names.labels.electrolyte}
        options={electrolyteOptions}
        value={electrolyte ?? ''}
        onChange={handleElectrolyteChange}
      />
      <CalculatorNumberField
        label={names.labels.currentLevel}
        min="0"
        step="0.1"
        value={inputs.currentLevelMmolL}
        onChange={(e) => handleNumberChange(e, 'currentLevelMmolL')}
      />
      <CalculatorNumberField
        label={names.labels.targetLevel}
        min="0"
        step="0.1"
        value={inputs.targetLevelMmolL}
        onChange={(e) => handleNumberChange(e, 'targetLevelMmolL')}
      />

      {isChlorideMode ? (
        <CalculatorNumberField
          label={names.labels.chlorideSodium}
          min="0"
          step="0.1"
          value={inputs.chlorideSodiumMmolL}
          onChange={(e) => handleNumberChange(e, 'chlorideSodiumMmolL')}
        />
      ) : null}

      <CalculatorPanel>{directionText}</CalculatorPanel>

      <CalculatorSelectField
        disabled={!isLevelDirectionReady || protocolOptions.length === 0}
        label={names.labels.protocol}
        options={protocolOptions}
        placeholder={isLevelDirectionReady ? '-' : names.placeholders.protocol}
        value={selectedProtocolId}
        onChange={handleProtocolChange}
      />

      {isSodiumMode ? (
        <>
          <CalculatorSelectField
            label={names.labels.chronicity}
            options={chronicityOptions}
            value={chronicity}
            onChange={handleChronicityChange}
          />
          <CalculatorSelectField
            disabled={sodiumDirection === undefined || sodiumFluidOptions.length === 0}
            label={names.labels.solution}
            options={sodiumFluidOptions}
            placeholder={sodiumDirection === undefined ? names.placeholders.solution : '-'}
            value={selectedSodiumFluidId}
            onChange={handleSodiumFluidChange}
          />
        </>
      ) : null}

      {isChlorideMode ? (
        <CalculatorSelectField
          disabled={chlorideDirection === undefined || chlorideFluidOptions.length === 0}
          label={names.labels.solution}
          options={chlorideFluidOptions}
          placeholder={chlorideDirection === undefined ? names.placeholders.solution : '-'}
          value={selectedChlorideFluidId}
          onChange={handleChlorideFluidChange}
        />
      ) : null}

      {isCalciumGluconateMode ? (
        <CalculatorNumberField
          label={names.labels.calciumGluconateConcentration}
          min="0"
          step="0.1"
          value={inputs.calciumGluconateConcentrationPercent}
          onChange={(e) => handleNumberChange(e, 'calciumGluconateConcentrationPercent')}
        />
      ) : null}

      {isHypercalcemiaMode ? (
        <CalculatorSelectField
          disabled={calciumDirection === undefined || calciumFluidOptions.length === 0}
          label={names.labels.solution}
          options={calciumFluidOptions}
          placeholder={calciumDirection === undefined ? names.placeholders.solution : '-'}
          value={selectedCalciumFluidId}
          onChange={handleCalciumFluidChange}
        />
      ) : null}

      {isKaliumReplacementMode ? (
        <CalculatorNumberField
          label={names.labels.kaliumChlorideConcentration}
          min="0"
          step="0.1"
          value={inputs.kaliumChlorideConcentrationPercent}
          onChange={(e) => handleNumberChange(e, 'kaliumChlorideConcentrationPercent')}
        />
      ) : null}

      {isGlucoseInsulinMode ? (
        <>
          <CalculatorSelectField
            label={names.labels.insulinProduct}
            options={insulinProductOptions}
            value={insulinProductId}
            onChange={handleInsulinProductChange}
          />
          <CalculatorSelectField
            label={names.labels.glucoseConcentration}
            options={glucoseConcentrationOptions}
            value={String(glucoseConcentration)}
            onChange={handleGlucoseConcentrationChange}
          />
        </>
      ) : null}

      <CalculatorError>{warningText}</CalculatorError>

      <CalculatorResult
        align="start"
        multiline
      >
        {resultText}
      </CalculatorResult>

      <CalculatorPanel>{commentText}</CalculatorPanel>
      <CalculatorDescription>{names.sources}</CalculatorDescription>
    </CalculatorForm>
  )
}
