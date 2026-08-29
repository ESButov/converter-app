export type PepSpecies = 'cat' | 'dog'
export type PepProtocol = 'over2kg' | 'under2kg'

export type PepInput = {
  aminoOsmolarityMosmL?: number
  aminoPotassiumMmolL?: number
  aminoSolutionPercent?: number
  carbohydrateEnergyPercent?: number
  dehydrationPercent?: number
  diarrheaLossMlKgDay?: number
  energyFactor?: number
  feverLossMlKgDay?: number
  glucoseSolutionPercent?: number
  insulinGlucoseGPerUnit?: number
  intestinalLossMlKgDay?: number
  lipidOsmolarityMosmL?: number
  lipidSolutionPercent?: number
  pepPercent?: number
  proteinGPer100Kcal?: number
  respiratoryLossMlKgDay?: number
  targetPotassiumMmolL?: number
  ventilationLossMlKgDay?: number
  vomitingLossMlKgDay?: number
  weightKg?: number
}

export type PepResult = {
  additionalFluidMlDay: number
  additionalLossMlKgDay: number
  aminoVolumeMl12h: number
  aminoVolumeMlDay: number
  basalEnergyKcalDay: number
  glucoseGramsDay: number
  glucoseOsmolarityMosmL: number
  glucoseVolumeMl12h: number
  glucoseVolumeMlDay: number
  illEnergyKcalDay: number
  insulinUnits12h?: number
  insulinUnitsDay?: number
  lipidEnergyPercent: number
  lipidGramsDay: number
  lipidVolumeMl12h: number
  lipidVolumeMlDay: number
  pepEnergyKcalDay: number
  pepRateMlHour: number
  potassiumChlorideVolumeMl12h: number
  potassiumChlorideVolumeMlDay: number
  proteinGramsDay: number
  protocol: PepProtocol
  theoreticalOsmolarityMosmL: number
  totalFluidMlDay: number
  totalPepVolumeMl12h: number
  totalPepVolumeMlDay: number
}

export const pepSpeciesLabels = {
  cat: 'Кошка',
  dog: 'Собака',
} as const satisfies Record<PepSpecies, string>

export const pepProtocolLabels = {
  over2kg: 'более 2 кг',
  under2kg: 'до 2 кг',
} as const satisfies Record<PepProtocol, string>

export const pepDefaultInput = {
  aminoOsmolarityMosmL: 1021,
  aminoPotassiumMmolL: 0,
  aminoSolutionPercent: 10,
  carbohydrateEnergyPercent: 50,
  dehydrationPercent: 0,
  diarrheaLossMlKgDay: 0,
  energyFactor: 1.2,
  feverLossMlKgDay: 0,
  glucoseSolutionPercent: 20,
  insulinGlucoseGPerUnit: 0,
  intestinalLossMlKgDay: 0,
  lipidOsmolarityMosmL: 380,
  lipidSolutionPercent: 20,
  pepPercent: 25,
  proteinGPer100Kcal: 6,
  respiratoryLossMlKgDay: 0,
  targetPotassiumMmolL: 0,
  ventilationLossMlKgDay: 0,
  vomitingLossMlKgDay: 0,
} as const satisfies Omit<PepInput, 'weightKg'>

const glucoseKcalPerMlPerPercent = 0.034
const lipidKcalPerMlPerPercent = 0.1
const kcl4PercentMlPerMmol = 1.86

const hasPositiveNumber = (value: number | undefined): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value > 0
)

const readNonNegativeNumber = (value: number | undefined) => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value > 0
    ? value
    : 0
)

const readPositiveWithDefault = (
  value: number | undefined,
  fallback: number,
) => (hasPositiveNumber(value) ? value : fallback)

export const getPepProtocol = (weightKg: number): PepProtocol => (
  weightKg <= 2 ? 'under2kg' : 'over2kg'
)

export const calculatePepBasalEnergy = (
  weightKg: number,
  protocol = getPepProtocol(weightKg),
) => (
  protocol === 'under2kg'
    ? 30 * weightKg + 70
    : 70 * weightKg ** 0.75
)

export const calculatePep = (input: PepInput): PepResult | undefined => {
  if (!hasPositiveNumber(input.weightKg)) {
    return undefined
  }

  const weightKg = input.weightKg
  const protocol = getPepProtocol(weightKg)
  const energyFactor = readPositiveWithDefault(input.energyFactor, pepDefaultInput.energyFactor)
  const pepPercent = readPositiveWithDefault(input.pepPercent, pepDefaultInput.pepPercent)
  const proteinGPer100Kcal = readPositiveWithDefault(
    input.proteinGPer100Kcal,
    pepDefaultInput.proteinGPer100Kcal,
  )
  const aminoSolutionPercent = readPositiveWithDefault(
    input.aminoSolutionPercent,
    pepDefaultInput.aminoSolutionPercent,
  )
  const carbohydrateEnergyPercent = readNonNegativeNumber(
    input.carbohydrateEnergyPercent ?? pepDefaultInput.carbohydrateEnergyPercent,
  )
  const lipidEnergyPercent = Math.max(0, 100 - carbohydrateEnergyPercent)
  const glucoseSolutionPercent = readPositiveWithDefault(
    input.glucoseSolutionPercent,
    pepDefaultInput.glucoseSolutionPercent,
  )
  const lipidSolutionPercent = readPositiveWithDefault(
    input.lipidSolutionPercent,
    pepDefaultInput.lipidSolutionPercent,
  )
  const aminoOsmolarityMosmL = readNonNegativeNumber(
    input.aminoOsmolarityMosmL ?? pepDefaultInput.aminoOsmolarityMosmL,
  )
  const lipidOsmolarityMosmL = readNonNegativeNumber(
    input.lipidOsmolarityMosmL ?? pepDefaultInput.lipidOsmolarityMosmL,
  )
  const aminoPotassiumMmolL = readNonNegativeNumber(
    input.aminoPotassiumMmolL ?? pepDefaultInput.aminoPotassiumMmolL,
  )
  const targetPotassiumMmolL = readNonNegativeNumber(
    input.targetPotassiumMmolL ?? pepDefaultInput.targetPotassiumMmolL,
  )
  const insulinGlucoseGPerUnit = readNonNegativeNumber(input.insulinGlucoseGPerUnit)

  const basalEnergyKcalDay = calculatePepBasalEnergy(weightKg, protocol)
  const illEnergyKcalDay = basalEnergyKcalDay * energyFactor
  const pepEnergyKcalDay = illEnergyKcalDay * pepPercent / 100
  const proteinGramsDay = pepEnergyKcalDay * proteinGPer100Kcal / 100
  const aminoVolumeMlDay = proteinGramsDay * 100 / aminoSolutionPercent
  const nonProteinEnergyKcalDay = protocol === 'under2kg'
    ? Math.max(0, pepEnergyKcalDay - proteinGramsDay * 4)
    : pepEnergyKcalDay
  const glucoseVolumeMlDay = carbohydrateEnergyPercent > 0
    ? nonProteinEnergyKcalDay * carbohydrateEnergyPercent /
      (100 * glucoseKcalPerMlPerPercent * glucoseSolutionPercent)
    : 0
  const glucoseGramsDay = glucoseVolumeMlDay * glucoseSolutionPercent / 100
  const lipidVolumeMlDay = lipidEnergyPercent > 0
    ? nonProteinEnergyKcalDay * lipidEnergyPercent /
      (100 * lipidKcalPerMlPerPercent * lipidSolutionPercent)
    : 0
  const lipidGramsDay = lipidVolumeMlDay * lipidSolutionPercent / 100
  const glucoseOsmolarityMosmL = glucoseSolutionPercent * 55.5
  const totalPepVolumeMlDay = aminoVolumeMlDay + glucoseVolumeMlDay + lipidVolumeMlDay
  const potassiumChlorideVolumeMlDay = Math.max(
    0,
    targetPotassiumMmolL * kcl4PercentMlPerMmol * totalPepVolumeMlDay / 1000 -
      kcl4PercentMlPerMmol * aminoVolumeMlDay * aminoPotassiumMmolL / 1000,
  )
  const theoreticalOsmolarityMosmL = totalPepVolumeMlDay > 0
    ? aminoVolumeMlDay / totalPepVolumeMlDay * aminoOsmolarityMosmL +
      glucoseVolumeMlDay / totalPepVolumeMlDay * glucoseOsmolarityMosmL +
      lipidVolumeMlDay / totalPepVolumeMlDay * lipidOsmolarityMosmL
    : 0
  const additionalLossMlKgDay =
    readNonNegativeNumber(input.feverLossMlKgDay) +
    readNonNegativeNumber(input.respiratoryLossMlKgDay) +
    readNonNegativeNumber(input.intestinalLossMlKgDay) +
    readNonNegativeNumber(input.diarrheaLossMlKgDay) +
    readNonNegativeNumber(input.vomitingLossMlKgDay) +
    readNonNegativeNumber(input.ventilationLossMlKgDay)
  const dehydrationPercent = readNonNegativeNumber(input.dehydrationPercent)
  const totalFluidMlDay = weightKg * 30 + 70 + weightKg * dehydrationPercent * 8 +
    additionalLossMlKgDay * weightKg
  const additionalFluidMlDay = totalFluidMlDay - totalPepVolumeMlDay
  const insulinUnitsDay = insulinGlucoseGPerUnit > 0
    ? glucoseGramsDay / insulinGlucoseGPerUnit
    : undefined

  return {
    additionalFluidMlDay,
    additionalLossMlKgDay,
    aminoVolumeMl12h: aminoVolumeMlDay / 2,
    aminoVolumeMlDay,
    basalEnergyKcalDay,
    glucoseGramsDay,
    glucoseOsmolarityMosmL,
    glucoseVolumeMl12h: glucoseVolumeMlDay / 2,
    glucoseVolumeMlDay,
    illEnergyKcalDay,
    insulinUnits12h: insulinUnitsDay === undefined ? undefined : insulinUnitsDay / 2,
    insulinUnitsDay,
    lipidEnergyPercent,
    lipidGramsDay,
    lipidVolumeMl12h: lipidVolumeMlDay / 2,
    lipidVolumeMlDay,
    pepEnergyKcalDay,
    pepRateMlHour: totalPepVolumeMlDay / 24,
    potassiumChlorideVolumeMl12h: potassiumChlorideVolumeMlDay / 2,
    potassiumChlorideVolumeMlDay,
    proteinGramsDay,
    protocol,
    theoreticalOsmolarityMosmL,
    totalFluidMlDay,
    totalPepVolumeMl12h: totalPepVolumeMlDay / 2,
    totalPepVolumeMlDay,
  }
}

export const formatPepNumber = (value: number, digits = 2): string => {
  const multiplier = 10 ** digits
  const roundedValue = Math.round((value + Number.EPSILON) * multiplier) / multiplier

  return roundedValue.toFixed(digits).replace(/\.?0+$/, '')
}
