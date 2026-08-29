import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import {
  calculateSodiumCorrection,
  formatSodiumNumber,
  getCompatibleSodiumFluids,
  getSodiumCorrectionDirection,
  sodiumChronicityLabels,
  sodiumDirectionLabels,
  sodiumFluidIds,
  type SodiumChronicity,
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
} from '../../ui/CalculatorForm'

type SodiumSpecies = 'cat' | 'dog'
type NumberFieldKey = 'currentSodiumMmolL' | 'targetSodiumMmolL' | 'weightKg'
type NumberInputs = Record<NumberFieldKey, string>

const names = {
  title: 'Коррекция натрия',
  labels: {
    chronicity: 'Характер нарушения',
    currentSodiumMmolL: 'Начальный Na+, ммоль/л',
    fluid: 'Раствор/препарат для коррекции',
    species: 'Вид животного',
    targetSodiumMmolL: 'Желаемый Na+, ммоль/л',
    weightKg: 'Масса, кг',
  },
  placeholders: {
    fluid: 'Сначала укажите уровни Na+',
  },
  safety: `Для хронических или неизвестных по давности нарушений: не быстрее 0.5 ммоль/л/ч и не более 10-12 ммоль/л/сут.
При гиповолемии сначала восстановить перфузию буферным изотоническим раствором, затем корректировать Na+.
Контроль Na+ каждые 4-6 часов с пересчетом плана по фактической динамике.`,
  source: 'Источник: 2024 AAHA Fluid Therapy Guidelines for Dogs and Cats; BSAVA Library, Composition of intravenous fluids.',
} as const

const speciesLabels = {
  cat: 'Кошка',
  dog: 'Собака',
} as const satisfies Record<SodiumSpecies, string>

const speciesOptions = [
  {
    id: 'sodium-species-dog',
    label: speciesLabels.dog,
    value: 'dog',
  },
  {
    id: 'sodium-species-cat',
    label: speciesLabels.cat,
    value: 'cat',
  },
] as const

const chronicityOptions = [
  {
    id: 'sodium-chronicity-chronic',
    label: sodiumChronicityLabels.chronic,
    value: 'chronic',
  },
  {
    id: 'sodium-chronicity-acute',
    label: sodiumChronicityLabels.acute,
    value: 'acute',
  },
] as const

const numberInputDefaults: NumberInputs = {
  currentSodiumMmolL: '',
  targetSodiumMmolL: '',
  weightKg: '',
}

const decimalNumberPattern = /^\d*(?:\.\d{0,3})?$/
const sodiumSpeciesSet = new Set<SodiumSpecies>(['cat', 'dog'])
const sodiumChronicitySet = new Set<SodiumChronicity>(['acute', 'chronic'])
const sodiumFluidIdSet = new Set<SodiumFluidId>(sodiumFluidIds)

const isSodiumSpecies = (value: string): value is SodiumSpecies => (
  sodiumSpeciesSet.has(value as SodiumSpecies)
)

const isSodiumChronicity = (value: string): value is SodiumChronicity => (
  sodiumChronicitySet.has(value as SodiumChronicity)
)

const isSodiumFluidId = (value: string): value is SodiumFluidId => (
  sodiumFluidIdSet.has(value as SodiumFluidId)
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

export default function SodiumCorrectionPage() {
  const [chronicity, setChronicity] = useState<SodiumChronicity>('chronic')
  const [fluidId, setFluidId] = useState<SodiumFluidId | ''>('')
  const [inputs, setInputs] = useState<NumberInputs>(numberInputDefaults)
  const [species, setSpecies] = useState<SodiumSpecies>()

  const numericValues = useMemo(() => ({
    currentSodiumMmolL: readNumberInput(inputs.currentSodiumMmolL),
    targetSodiumMmolL: readNumberInput(inputs.targetSodiumMmolL),
    weightKg: readNumberInput(inputs.weightKg),
  }), [inputs])

  const direction = useMemo(() => getSodiumCorrectionDirection(
    numericValues.currentSodiumMmolL,
    numericValues.targetSodiumMmolL,
  ), [numericValues.currentSodiumMmolL, numericValues.targetSodiumMmolL])

  const compatibleFluids = useMemo(() => getCompatibleSodiumFluids(
    numericValues.currentSodiumMmolL,
    numericValues.targetSodiumMmolL,
  ), [numericValues.currentSodiumMmolL, numericValues.targetSodiumMmolL])

  const fluidOptions = useMemo(() => compatibleFluids.map((fluid) => ({
    id: `sodium-fluid-${fluid.id}`,
    label: `${fluid.label} - Na ${formatSodiumNumber(fluid.sodiumMmolL)} ммоль/л`,
    value: fluid.id,
  })), [compatibleFluids])

  useEffect(() => {
    setFluidId((prev) => (
      prev === '' || compatibleFluids.some(({ id }) => id === prev) ? prev : ''
    ))
  }, [compatibleFluids])

  const result = useMemo(() => {
    if (species === undefined) {
      return undefined
    }

    return calculateSodiumCorrection({
      ...numericValues,
      chronicity,
      fluidId: fluidId === '' ? undefined : fluidId,
    })
  }, [chronicity, fluidId, numericValues, species])

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
      isSodiumSpecies(e.target.value) ? e.target.value : undefined,
    )
  }

  const handleChronicityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (isSodiumChronicity(e.target.value)) {
      setChronicity(e.target.value)
    }
  }

  const handleFluidChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFluidId(
      isSodiumFluidId(e.target.value) ? e.target.value : '',
    )
  }

  const directionText = direction === undefined
    ? 'Введите начальный и желаемый Na+, чтобы выбрать направление коррекции.'
    : `Тип коррекции: ${sodiumDirectionLabels[direction]}`

  const speciesBolusText = species === undefined
    ? 'Болюс при гиповолемии: кошка 5-10 мл/кг, собака 15-20 мл/кг за 15-30 минут.'
    : species === 'cat'
      ? 'Болюс при гиповолемии для кошек: 5-10 мл/кг за 15-30 минут, повторять по оценке перфузии.'
      : 'Болюс при гиповолемии для собак: 15-20 мл/кг за 15-30 минут, повторять по оценке перфузии.'

  const warningText = [
    hasPositiveNumber(numericValues.currentSodiumMmolL) &&
      hasPositiveNumber(numericValues.targetSodiumMmolL) &&
      numericValues.currentSodiumMmolL === numericValues.targetSodiumMmolL
      ? 'Начальный и желаемый Na+ совпадают: коррекция не требуется.'
      : undefined,
    direction !== undefined && compatibleFluids.length === 0
      ? 'Для заданного желаемого Na+ нет подходящего раствора в списке.'
      : undefined,
    result !== undefined &&
      chronicity === 'chronic' &&
      result.sodiumDeltaMmolL > 12
      ? 'Разница Na+ больше 12 ммоль/л: коррекцию нужно растягивать и пересчитывать по контрольным анализам.'
      : undefined,
  ].filter(Boolean).join('\n')

  const resultText = result === undefined
    ? undefined
    : `${directionText}
Общая вода организма: ${formatSodiumNumber(result.totalBodyWaterL, 2)} л
Разница Na+: ${formatSodiumNumber(result.sodiumDeltaMmolL)} ммоль/л
${result.sodiumDeficitMmol === undefined ? '' : `Дефицит натрия: ${formatSodiumNumber(result.sodiumDeficitMmol)} ммоль\n`}${result.freeWaterDeficitMl === undefined ? '' : `Дефицит свободной воды: ${formatSodiumNumber(result.freeWaterDeficitMl)} мл\n`}Выбранный раствор: ${result.fluid.label} (Na ${formatSodiumNumber(result.fluid.sodiumMmolL)} ммоль/л)
Ожидаемое изменение Na+ на 1 л: ${formatSignedNumber(result.expectedChangePerLiterMmolL)} ммоль/л
Расчетный объем раствора: ${formatSodiumNumber(result.correctionVolumeMl)} мл
Минимальное время коррекции: ${formatSodiumNumber(result.replacementTimeHours, 2)} ч
Расчетная скорость: ${formatSodiumNumber(result.correctionRateMlHour, 2)} мл/ч${result.hypertonicBolusMinMl === undefined || result.hypertonicBolusMaxMl === undefined ? '' : `
Болюсный ориентир гипертонического NaCl при неврологических признаках: ${formatSodiumNumber(result.hypertonicBolusMinMl)}-${formatSodiumNumber(result.hypertonicBolusMaxMl)} мл за 10-15 минут.`}`

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
        label={names.labels.chronicity}
        options={chronicityOptions}
        value={chronicity}
        onChange={handleChronicityChange}
      />
      <CalculatorNumberField
        label={names.labels.currentSodiumMmolL}
        min="0"
        step="0.1"
        value={inputs.currentSodiumMmolL}
        onChange={(e) => handleNumberChange(e, 'currentSodiumMmolL')}
      />
      <CalculatorNumberField
        label={names.labels.targetSodiumMmolL}
        min="0"
        step="0.1"
        value={inputs.targetSodiumMmolL}
        onChange={(e) => handleNumberChange(e, 'targetSodiumMmolL')}
      />

      <CalculatorPanel>{directionText}</CalculatorPanel>

      <CalculatorSelectField
        disabled={direction === undefined || fluidOptions.length === 0}
        label={names.labels.fluid}
        options={fluidOptions}
        placeholder={direction === undefined ? names.placeholders.fluid : '-'}
        value={fluidId}
        onChange={handleFluidChange}
      />

      <CalculatorError>{warningText}</CalculatorError>

      <CalculatorResult
        align="start"
        multiline
      >
        {resultText}
      </CalculatorResult>

      <CalculatorPanel>{`${names.safety}\n${speciesBolusText}`}</CalculatorPanel>
      <CalculatorDescription>{names.source}</CalculatorDescription>
    </CalculatorForm>
  )
}
