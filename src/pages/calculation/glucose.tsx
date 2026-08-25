import { useMemo, useState, type ChangeEvent } from 'react'
import {
  calculateGlucoseDilution,
  formatGlucoseVolume,
  glucoseConcentrations,
  isGlucoseConcentration,
} from '../../domain/glucoseDilution'
import {
  CalculatorForm,
  CalculatorNumberField,
  CalculatorResult,
  CalculatorSelectField,
} from '../../ui/CalculatorForm'
import type { GlucoseConcentration } from '../../domain/glucoseDilution'

const names = {
  title: 'Приготовление раствора глюкозы',
  labels: {
    volume: 'Необходимое количество раствора (мл)',
    concentration: 'Необходимая концентрация раствора (%)',
  },
} as const

const concentrationOptions = glucoseConcentrations.map((concentration) => ({
  id: `glucose-concentration-${concentration}`,
  label: String(concentration),
  value: String(concentration),
}))

const decimalVolumePattern = /^\d*(?:\.\d{0,1})?$/

const hasPositiveNumber = (value: unknown): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value > 0
)

export default function GlucosePage() {
  const [volumeInput, setVolumeInput] = useState('')
  const [volume, setVolume] = useState<number>()
  const [concentration, setConcentration] = useState<GlucoseConcentration>()

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextInput = e.target.value
    const normalizedInput = nextInput.replace(',', '.')

    if (!decimalVolumePattern.test(normalizedInput)) {
      return
    }

    const nextVolume = normalizedInput === '' ? undefined : Number(normalizedInput)

    setVolumeInput(nextInput)
    setVolume(Number.isFinite(nextVolume) ? nextVolume : undefined)
  }

  const handleConcentrationChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextConcentration = Number(e.target.value)

    setConcentration(
      isGlucoseConcentration(nextConcentration) ? nextConcentration : undefined,
    )
  }

  const resultText = useMemo(() => {
    if (!hasPositiveNumber(volume) || concentration === undefined) {
      return undefined
    }

    const result = calculateGlucoseDilution(volume, concentration)

    return `Для приготовления ${formatGlucoseVolume(volume)} мл ${concentration}% раствора необходимо смешать ${formatGlucoseVolume(result.volume40)} мл 40% глюкозы и ${formatGlucoseVolume(result.volume5)} мл 5% глюкозы`
  }, [concentration, volume])

  return (
    <CalculatorForm title={names.title}>
      <CalculatorNumberField
        label={names.labels.volume}
        min="0"
        step="0.1"
        value={volumeInput}
        onChange={handleVolumeChange}
      />
      <CalculatorSelectField
        label={names.labels.concentration}
        options={concentrationOptions}
        value={concentration ?? ''}
        onChange={handleConcentrationChange}
      />
      {resultText !== undefined &&
        <CalculatorResult align='start'>
          {resultText}
        </CalculatorResult>}
    </CalculatorForm>
  )
}
