import { useMemo, useState, type ChangeEvent } from 'react'
import {
  bodySurfaceAreaCoefficients,
  calculateBodySurfaceArea,
  getBodySurfaceAreaCoefficient,
} from '../../domain/bodySurfaceArea'
import {
  CalculatorForm,
  CalculatorNumberField,
  CalculatorResult,
  CalculatorSelectField,
} from '../../ui/CalculatorForm'
import type { BodySurfaceAreaCoefficient } from '../../domain/bodySurfaceArea'

const names = {
  title: 'Расчет площади тела',
  labels: {
    species: 'Вид животного',
    weight: 'Масса (кг)',
  },
  result: 'Площадь тела',
} as const

const speciesOptions = bodySurfaceAreaCoefficients.map((coefficient) => ({
  id: `body-surface-area-species-${coefficient.key}`,
  label: coefficient.label,
  value: coefficient.key,
}))

const decimalWeightPattern = /^\d*(?:\.\d{0,3})?$/

const hasPositiveNumber = (value: unknown): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value > 0
)

export default function BodySurfaceAreaPage() {
  const [selectedSpecies, setSelectedSpecies] = useState<BodySurfaceAreaCoefficient>()
  const [weightInput, setWeightInput] = useState('')
  const [weight, setWeight] = useState<number>()

  const handleSpeciesSelection = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedSpecies(getBodySurfaceAreaCoefficient(e.target.value))
  }

  const handleWeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextInput = e.target.value
    const normalizedInput = nextInput.replace(',', '.')

    if (!decimalWeightPattern.test(normalizedInput)) {
      return
    }

    const nextWeight = normalizedInput === '' ? undefined : Number(normalizedInput)

    setWeightInput(nextInput)
    setWeight(Number.isFinite(nextWeight) ? nextWeight : undefined)
  }

  const result = useMemo(() => {
    if (!selectedSpecies || !hasPositiveNumber(weight)) {
      return undefined
    }

    return calculateBodySurfaceArea(weight, selectedSpecies.coefficientKg)
  }, [selectedSpecies, weight])

  return (
    <CalculatorForm title={names.title}>
      <CalculatorSelectField
        label={names.labels.species}
        options={speciesOptions}
        value={selectedSpecies?.key ?? ''}
        onChange={handleSpeciesSelection}
      />
      <CalculatorNumberField
        label={names.labels.weight}
        min="0"
        step="0.001"
        value={weightInput}
        onChange={handleWeightChange}
      />
      {result !== undefined &&
        <CalculatorResult>
          {names.result}: {result.toFixed(3)} м^2
        </CalculatorResult>}
    </CalculatorForm>
  )
}
