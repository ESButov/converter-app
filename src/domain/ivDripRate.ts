export type InfusionSpeedUnit = 'mlPerHour' | 'dropsPerMinute'
export type InfusionCalculationMode = 'byTime' | 'bySpeed'

export type DropFactorOption = {
  value: number
  system: string
  usage: string
}

export type InfusionInput = {
  volumeMl?: number
  timeHours?: number
  timeMinutes?: number
  speed?: number
  speedUnit: InfusionSpeedUnit
  dropFactor: number
}

export type InfusionResult = {
  mode: InfusionCalculationMode
  totalTimeMinutes: number
  mlPerHour: number
  dropsPerMinute: number
  roundedDropsPerMinute: number
  secondsPerDrop: number
}

export const dropFactorOptions = [
  {
    value: 10,
    system: 'Макрокапельница (кровь)',
    usage: 'Для вязких жидкостей, крови и крупных капель.',
  },
  {
    value: 15,
    system: 'Макрокапельница (стандарт 15)',
    usage: 'Стандартный вариант для кристаллоидных растворов.',
  },
  {
    value: 20,
    system: 'Макрокапельница (стандарт 20)',
    usage: 'Частый вариант для NaCl 0.9%, глюкозы и похожих растворов.',
  },
  {
    value: 60,
    system: 'Микрокапельница',
    usage: 'Для малых объемов и более точной ручной настройки.',
  },
] as const satisfies readonly DropFactorOption[]

const round = (value: number, digits = 1) => Number(value.toFixed(digits))

const hasPositiveNumber = (value: number | undefined): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value > 0
)

export const getInfusionTimeMinutes = (
  hours?: number,
  minutes?: number,
): number | undefined => {
  const safeHours = Number.isFinite(hours) ? Number(hours) : 0
  const safeMinutes = Number.isFinite(minutes) ? Number(minutes) : 0
  const totalMinutes = safeHours * 60 + safeMinutes

  return totalMinutes > 0 ? totalMinutes : undefined
}

export const calculateIvDripRate = ({
  dropFactor,
  speed,
  speedUnit,
  timeHours,
  timeMinutes,
  volumeMl,
}: InfusionInput): InfusionResult | undefined => {
  if (!hasPositiveNumber(volumeMl) || !hasPositiveNumber(dropFactor)) {
    return undefined
  }

  const totalTimeMinutes = getInfusionTimeMinutes(timeHours, timeMinutes)

  if (totalTimeMinutes !== undefined) {
    const dropsPerMinute = volumeMl * dropFactor / totalTimeMinutes
    const mlPerHour = volumeMl / (totalTimeMinutes / 60)

    return {
      mode: 'byTime',
      totalTimeMinutes: round(totalTimeMinutes),
      mlPerHour: round(mlPerHour),
      dropsPerMinute: round(dropsPerMinute),
      roundedDropsPerMinute: Math.round(dropsPerMinute),
      secondsPerDrop: round(60 / dropsPerMinute, 1),
    }
  }

  if (!hasPositiveNumber(speed)) {
    return undefined
  }

  const mlPerHour = speedUnit === 'mlPerHour'
    ? speed
    : speed * 60 / dropFactor
  const dropsPerMinute = speedUnit === 'dropsPerMinute'
    ? speed
    : speed * dropFactor / 60
  const calculatedTimeMinutes = volumeMl / mlPerHour * 60

  return {
    mode: 'bySpeed',
    totalTimeMinutes: round(calculatedTimeMinutes),
    mlPerHour: round(mlPerHour),
    dropsPerMinute: round(dropsPerMinute),
    roundedDropsPerMinute: Math.round(dropsPerMinute),
    secondsPerDrop: round(60 / dropsPerMinute, 1),
  }
}

export const formatInfusionNumber = (value: number, digits = 1): string => (
  value.toFixed(digits).replace(/\.0$/, '')
)

export const formatInfusionDuration = (totalMinutes: number): string => {
  const roundedMinutes = Math.round(totalMinutes)
  const hours = Math.floor(roundedMinutes / 60)
  const minutes = roundedMinutes % 60

  if (hours > 0 && minutes > 0) return `${hours} ч ${minutes} мин`
  if (hours > 0) return `${hours} ч`

  return `${minutes} мин`
}
