import { useMemo, useState, type ChangeEvent } from 'react'
import {
  calculateGlucoseInsulinMixture,
  formatGlucoseInsulinNumber,
  glucoseInsulinProtocolIds,
  glucoseInsulinProtocols,
  type GlucoseInsulinProtocolId,
  type GlucoseInsulinRange,
} from '../../domain/glucoseInsulin'
import {
  CalculatorDescription,
  CalculatorError,
  CalculatorForm,
  CalculatorNumberField,
  CalculatorPanel,
  CalculatorResult,
  CalculatorSelectField,
} from '../../ui/CalculatorForm'

type GlucoseInsulinSpecies = 'cat' | 'dog'
type GlucoseConcentrationPercent = 5 | 10 | 20 | 40 | 50
type InsulinProductId =
  | 'actrapid'
  | 'humalog'
  | 'humulinRegular'
  | 'insumanRapid'
  | 'novorapid'
type NumberFieldKey = 'currentKaliumMmolL' | 'targetKaliumMmolL' | 'weightKg'
type NumberInputs = Record<NumberFieldKey, string>

const names = {
  title: 'Расчет глюкозо-инсулиновой смеси',
  labels: {
    currentKaliumMmolL: 'Начальный K+, ммоль/л',
    glucoseConcentration: 'Концентрация глюкозы',
    insulinProduct: 'Инсулин короткого действия',
    protocol: 'Протокол',
    species: 'Вид животного',
    targetKaliumMmolL: 'Желаемый K+, ммоль/л',
    weightKg: 'Масса, кг',
  },
  safety: `Глюкозо-инсулиновая смесь временно перемещает K+ внутрь клеток и не устраняет причину гиперкалиемии.
При изменениях ЭКГ или брадиаритмии кальция глюконат используют для защиты миокарда до или параллельно коррекции K+.
Источники описывают регулярный/растворимый инсулин; выбранное торговое название не меняет расчет дозы.
Концентрированную глюкозу для периферического введения разводить. Контроль K+ через 30-60 минут, контроль глюкозы через 60 минут и далее каждые 2 часа до 12 часов.`,
  source: 'Источник: Merck Veterinary Manual; BSAVA Library; Emergency management of hyperkalemia in dogs and cats.',
} as const

const speciesLabels = {
  cat: 'Кошка',
  dog: 'Собака',
} as const satisfies Record<GlucoseInsulinSpecies, string>

const speciesOptions = [
  {
    id: 'glucose-insulin-species-dog',
    label: speciesLabels.dog,
    value: 'dog',
  },
  {
    id: 'glucose-insulin-species-cat',
    label: speciesLabels.cat,
    value: 'cat',
  },
] as const

const protocolOptions = glucoseInsulinProtocols.map((protocol) => ({
  id: `glucose-insulin-protocol-${protocol.id}`,
  label: protocol.label,
  value: protocol.id,
}))

const glucoseConcentrationOptions = [
  {
    id: 'glucose-insulin-glucose-5',
    label: '5%',
    value: '5',
  },
  {
    id: 'glucose-insulin-glucose-10',
    label: '10%',
    value: '10',
  },
  {
    id: 'glucose-insulin-glucose-20',
    label: '20%',
    value: '20',
  },
  {
    id: 'glucose-insulin-glucose-40',
    label: '40%',
    value: '40',
  },
  {
    id: 'glucose-insulin-glucose-50',
    label: '50%',
    value: '50',
  },
] as const

const insulinProductOptions = [
  {
    id: 'glucose-insulin-product-actrapid',
    label: 'Актрапид НМ',
    value: 'actrapid',
  },
  {
    id: 'glucose-insulin-product-humulin-regular',
    label: 'Хумулин Регуляр',
    value: 'humulinRegular',
  },
  {
    id: 'glucose-insulin-product-insuman-rapid',
    label: 'Инсуман Рапид ГТ',
    value: 'insumanRapid',
  },
  {
    id: 'glucose-insulin-product-humalog',
    label: 'Хумалог',
    value: 'humalog',
  },
  {
    id: 'glucose-insulin-product-novorapid',
    label: 'НовоРапид',
    value: 'novorapid',
  },
] as const

const numberInputDefaults: NumberInputs = {
  currentKaliumMmolL: '',
  targetKaliumMmolL: '',
  weightKg: '',
}

const decimalNumberPattern = /^\d*(?:\.\d{0,3})?$/
const glucoseConcentrationSet = new Set<string>(
  glucoseConcentrationOptions.map((option) => option.value),
)
const glucoseInsulinSpeciesSet = new Set<GlucoseInsulinSpecies>(['cat', 'dog'])
const glucoseInsulinProtocolSet = new Set<GlucoseInsulinProtocolId>(
  glucoseInsulinProtocolIds,
)
const insulinProductSet = new Set<InsulinProductId>(
  insulinProductOptions.map((option) => option.value),
)

const isGlucoseConcentrationPercent = (
  value: string,
): value is `${GlucoseConcentrationPercent}` => glucoseConcentrationSet.has(value)

const isGlucoseInsulinSpecies = (value: string): value is GlucoseInsulinSpecies => (
  glucoseInsulinSpeciesSet.has(value as GlucoseInsulinSpecies)
)

const isGlucoseInsulinProtocolId = (
  value: string,
): value is GlucoseInsulinProtocolId => (
  glucoseInsulinProtocolSet.has(value as GlucoseInsulinProtocolId)
)

const isInsulinProductId = (value: string): value is InsulinProductId => (
  insulinProductSet.has(value as InsulinProductId)
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

const formatRange = (
  range: GlucoseInsulinRange,
  unit: string,
  digits = 1,
) => (
  range.min === range.max
    ? `${formatGlucoseInsulinNumber(range.min, digits)} ${unit}`
    : `${formatGlucoseInsulinNumber(range.min, digits)}-${formatGlucoseInsulinNumber(range.max, digits)} ${unit}`
)

export default function GlucoseInsulinPage() {
  const [glucoseConcentration, setGlucoseConcentration] =
    useState<GlucoseConcentrationPercent>(50)
  const [inputs, setInputs] = useState<NumberInputs>(numberInputDefaults)
  const [insulinProductId, setInsulinProductId] = useState<InsulinProductId>('actrapid')
  const [protocolId, setProtocolId] = useState<GlucoseInsulinProtocolId>('regular025')
  const [species, setSpecies] = useState<GlucoseInsulinSpecies>()

  const numericValues = useMemo(() => ({
    currentKaliumMmolL: readNumberInput(inputs.currentKaliumMmolL),
    targetKaliumMmolL: readNumberInput(inputs.targetKaliumMmolL),
    weightKg: readNumberInput(inputs.weightKg),
  }), [inputs])

  const result = useMemo(() => {
    if (species === undefined) {
      return undefined
    }

    return calculateGlucoseInsulinMixture({
      ...numericValues,
      glucoseConcentrationPercent: glucoseConcentration,
      protocolId,
    })
  }, [glucoseConcentration, numericValues, protocolId, species])

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
      isGlucoseInsulinSpecies(e.target.value) ? e.target.value : undefined,
    )
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
    if (isGlucoseInsulinProtocolId(e.target.value)) {
      setProtocolId(e.target.value)
    }
  }

  const warningText = [
    hasPositiveNumber(numericValues.currentKaliumMmolL) &&
      hasPositiveNumber(numericValues.targetKaliumMmolL) &&
      numericValues.targetKaliumMmolL >= numericValues.currentKaliumMmolL
      ? 'Желаемый K+ должен быть ниже начального: этот расчет предназначен для снижения гиперкалиемии.'
      : undefined,
    result !== undefined && !result.isSevereHyperkalemia
      ? 'K+ ниже 7 ммоль/л: оцените показания, ЭКГ и клинический контекст перед использованием смеси.'
      : undefined,
    result !== undefined && result.isLargeKaliumGoal
      ? 'Цель снижения больше 1.5 ммоль/л: дозу инсулина не увеличивают пропорционально разнице K+, нужен контрольный анализ и устранение причины гиперкалиемии.'
      : undefined,
  ].filter(Boolean).join('\n')

  const insulinProductLabel = insulinProductOptions.find(
    (option) => option.value === insulinProductId,
  )?.label ?? 'Актрапид НМ'

  const protocolText = result === undefined
    ? undefined
    : result.protocol.id === 'bsava05'
      ? `Инсулин растворимый: ${formatGlucoseInsulinNumber(result.insulinUnits, 2)} ЕД IV однократно (${formatGlucoseInsulinNumber(result.protocol.insulinUnitsKg, 2)} ЕД/кг)
Декстроза всего: ${result.dextroseTotalG === undefined ? '' : formatRange(result.dextroseTotalG, 'г')}
Глюкоза ${formatGlucoseInsulinNumber(result.glucoseConcentrationPercent)}% всего: ${result.glucoseTotalMl === undefined ? '' : formatRange(result.glucoseTotalMl, 'мл')}
1/2 объема глюкозы болюсно: ${result.glucoseBolusMlRange === undefined ? '' : formatRange(result.glucoseBolusMlRange, 'мл')} (${result.glucoseBolusGRange === undefined ? '' : formatRange(result.glucoseBolusGRange, 'г')})
Остаток глюкозы IV за 4-6 часов: ${result.glucoseRemainderMl === undefined ? '' : formatRange(result.glucoseRemainderMl, 'мл')}`
      : `Инсулин регулярный: ${formatGlucoseInsulinNumber(result.insulinUnits, 2)} ЕД IV однократно (${formatGlucoseInsulinNumber(result.protocol.insulinUnitsKg, 2)} ЕД/кг)
Глюкоза ${formatGlucoseInsulinNumber(result.glucoseConcentrationPercent)}% болюсно: ${formatGlucoseInsulinNumber(result.glucoseBolusMl ?? 0)} мл (${formatGlucoseInsulinNumber(result.glucoseBolusG ?? 0)} г)
${result.dilutionSalineMl === undefined || result.dilutedBolusMl === undefined ? '' : `Разведение глюкозы 1:2-1:4: добавить ${formatRange(result.dilutionSalineMl, 'мл')} 0.9% NaCl
Итоговый объем разведенного болюса: ${formatRange(result.dilutedBolusMl, 'мл')}\n`}Далее: 2.5-5% глюкоза CRI на 4-6 часов по гликемии.`

  const resultText = result === undefined
    ? undefined
    : `Цель снижения K+: ${formatGlucoseInsulinNumber(result.kaliumDecreaseGoalMmolL)} ммоль/л (${formatGlucoseInsulinNumber(result.currentKaliumMmolL)} -> ${formatGlucoseInsulinNumber(result.targetKaliumMmolL)})
Выбранный инсулин: ${insulinProductLabel}
${protocolText}
Пик эффекта ожидается через 30-60 минут, длительность действия 4-6 часов.`

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
      <CalculatorNumberField
        label={names.labels.currentKaliumMmolL}
        min="0"
        step="0.1"
        value={inputs.currentKaliumMmolL}
        onChange={(e) => handleNumberChange(e, 'currentKaliumMmolL')}
      />
      <CalculatorNumberField
        label={names.labels.targetKaliumMmolL}
        min="0"
        step="0.1"
        value={inputs.targetKaliumMmolL}
        onChange={(e) => handleNumberChange(e, 'targetKaliumMmolL')}
      />
      <CalculatorSelectField
        label={names.labels.insulinProduct}
        options={insulinProductOptions}
        value={insulinProductId}
        onChange={handleInsulinProductChange}
      />
      <CalculatorSelectField
        label={names.labels.protocol}
        options={protocolOptions}
        value={protocolId}
        onChange={handleProtocolChange}
      />
      <CalculatorSelectField
        label={names.labels.glucoseConcentration}
        options={glucoseConcentrationOptions}
        value={String(glucoseConcentration)}
        onChange={handleGlucoseConcentrationChange}
      />

      <CalculatorError>{warningText}</CalculatorError>

      <CalculatorResult
        align="start"
        multiline
      >
        {resultText}
      </CalculatorResult>

      <CalculatorPanel>{names.safety}</CalculatorPanel>
      <CalculatorDescription>{names.source}</CalculatorDescription>
    </CalculatorForm>
  )
}
