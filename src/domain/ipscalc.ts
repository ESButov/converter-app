export type IpscalcSpecies = 'cat' | 'dog'

export type IpscalcLosses = {
  diarrheaMl?: number
  drainMl?: number
  otherMl?: number
  polyuriaMl?: number
  vomitingMl?: number
}

export type IpscalcInput = {
  dehydrationPercent?: number
  losses?: IpscalcLosses
  lossesPeriodHours?: number
  rehydrationHours?: number
  species?: IpscalcSpecies
  weightKg?: number
}

export type IpscalcResult = {
  deficitRateMlHour: number
  dehydrationDeficitMl: number
  firstDayVolumeMl: number
  maintenanceMlDay: number
  maintenanceMlHour: number
  ongoingLossesMlDay: number
  ongoingLossesMlHour: number
  ongoingLossesTotalMl: number
  rateAfterDeficitMlHour: number
  rehydrationHours: number
  rehydrationPeriodVolumeMl: number
  totalRateDuringRehydrationMlHour: number
}

const hoursPerDay = 24

const hasPositiveNumber = (value: number | undefined): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value > 0
)

const hasNonNegativeNumber = (value: number | undefined): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value >= 0
)

const round = (value: number, digits = 2) => {
  const multiplier = 10 ** digits

  return Math.round((value + Number.EPSILON) * multiplier) / multiplier
}

const sumLosses = (losses: IpscalcLosses = {}) => (
  Object.values(losses).reduce((sum, value) => (
    hasNonNegativeNumber(value) ? sum + value : sum
  ), 0)
)

export const calculateMaintenanceMlDay = (weightKg: number) => (
  30 * weightKg + 70
)

export const calculateIpscalc = ({
  dehydrationPercent,
  losses,
  lossesPeriodHours = hoursPerDay,
  rehydrationHours,
  species,
  weightKg,
}: IpscalcInput): IpscalcResult | undefined => {
  if (
    species === undefined ||
    !hasPositiveNumber(weightKg) ||
    !hasNonNegativeNumber(dehydrationPercent) ||
    !hasPositiveNumber(rehydrationHours) ||
    !Number.isInteger(rehydrationHours) ||
    !hasPositiveNumber(lossesPeriodHours) ||
    !Number.isInteger(lossesPeriodHours)
  ) {
    return undefined
  }

  const dehydrationDeficitMl = weightKg * dehydrationPercent * 10
  const deficitRateMlHour = dehydrationDeficitMl / rehydrationHours
  const maintenanceMlDay = calculateMaintenanceMlDay(weightKg)
  const maintenanceMlHour = maintenanceMlDay / hoursPerDay
  const ongoingLossesTotalMl = sumLosses(losses)
  const ongoingLossesMlHour = ongoingLossesTotalMl / lossesPeriodHours
  const ongoingLossesMlDay = ongoingLossesMlHour * hoursPerDay
  const rateAfterDeficitMlHour = maintenanceMlHour + ongoingLossesMlHour
  const totalRateDuringRehydrationMlHour = deficitRateMlHour + rateAfterDeficitMlHour

  return {
    deficitRateMlHour: round(deficitRateMlHour),
    dehydrationDeficitMl: round(dehydrationDeficitMl),
    firstDayVolumeMl: round(
      deficitRateMlHour * Math.min(rehydrationHours, hoursPerDay) +
      maintenanceMlDay +
      ongoingLossesMlDay,
    ),
    maintenanceMlDay: round(maintenanceMlDay),
    maintenanceMlHour: round(maintenanceMlHour),
    ongoingLossesMlDay: round(ongoingLossesMlDay),
    ongoingLossesMlHour: round(ongoingLossesMlHour),
    ongoingLossesTotalMl: round(ongoingLossesTotalMl),
    rateAfterDeficitMlHour: round(rateAfterDeficitMlHour),
    rehydrationHours,
    rehydrationPeriodVolumeMl: round(totalRateDuringRehydrationMlHour * rehydrationHours),
    totalRateDuringRehydrationMlHour: round(totalRateDuringRehydrationMlHour),
  }
}

export const formatIpscalcNumber = (value: number, digits = 1): string => {
  const multiplier = 10 ** digits
  const roundedValue = Math.round((value + Number.EPSILON) * multiplier) / multiplier

  return roundedValue.toFixed(digits).replace(/\.?0+$/, '')
}
