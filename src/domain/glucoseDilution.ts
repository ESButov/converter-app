type GlucoseConcentration = 10 | 15 | 20 | 30

type GlucoseDilutionResult = {
  volume40: number
  volume5: number
}

const glucoseConcentrations = [10, 15, 20, 30] as const satisfies readonly GlucoseConcentration[]

const calculateGlucoseDilution = (
  volume: number,
  concentration: GlucoseConcentration,
): GlucoseDilutionResult => {
  const volume40 = volume * (concentration - 5) / 35

  return {
    volume40,
    volume5: volume - volume40,
  }
}

const formatGlucoseVolume = (value: number) => (
  value.toFixed(1).replace(/\.0$/, '')
)

const isGlucoseConcentration = (value: number): value is GlucoseConcentration => (
  glucoseConcentrations.includes(value as GlucoseConcentration)
)

export {
  calculateGlucoseDilution,
  formatGlucoseVolume,
  glucoseConcentrations,
  isGlucoseConcentration,
}
export type {
  GlucoseConcentration,
  GlucoseDilutionResult,
}
