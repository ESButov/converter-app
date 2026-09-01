export type PdrGroupId = 'cat' | 'dogGiant' | 'dogLarge' | 'dogMedium' | 'dogSmall'

export type PdrGroup = {
  bpCoefficient: number
  bpConstantMm: number
  id: PdrGroupId
  label: string
  recommendedDbpMax: number
  recommendedDbpMin: number
}

export type PdrInput = {
  bpMm?: number
  examDateIso?: string
  groupId?: PdrGroupId
}

export type PdrResult = {
  bpMm: number
  daysBeforeParturition: number
  dueDateIso: string
  group: PdrGroup
  isOutsideRecommendedPeriod: boolean
  rangeEndIso: string
  rangeStartIso: string
  roundedDaysBeforeParturition: number
}

export const pdrGroups = [
  {
    bpCoefficient: 0.47,
    bpConstantMm: 23.39,
    id: 'cat',
    label: 'Кошка',
    recommendedDbpMax: 25,
    recommendedDbpMin: 0,
  },
  {
    bpCoefficient: 0.61,
    bpConstantMm: 25.11,
    id: 'dogSmall',
    label: 'Собака мелкая, до 10 кг',
    recommendedDbpMax: 37,
    recommendedDbpMin: 1,
  },
  {
    bpCoefficient: 0.7,
    bpConstantMm: 29.18,
    id: 'dogMedium',
    label: 'Собака средняя, 10-25 кг',
    recommendedDbpMax: 37,
    recommendedDbpMin: 1,
  },
  {
    bpCoefficient: 0.8,
    bpConstantMm: 30,
    id: 'dogLarge',
    label: 'Собака крупная, 26-40 кг',
    recommendedDbpMax: 30,
    recommendedDbpMin: 2,
  },
  {
    bpCoefficient: 0.7,
    bpConstantMm: 29,
    id: 'dogGiant',
    label: 'Собака гигантская, более 40 кг',
    recommendedDbpMax: 35,
    recommendedDbpMin: 1,
  },
] as const satisfies readonly PdrGroup[]

export const pdrGroupIds = pdrGroups.map((group) => group.id)

const pdrGroupById = new Map<PdrGroupId, PdrGroup>(
  pdrGroups.map((group) => [group.id, group]),
)

const pdrAccuracyDays = 2

const hasPositiveNumber = (value: number | undefined): value is number => (
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value > 0
)

const parseIsoDate = (dateIso: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateIso)

  if (match === null) {
    return undefined
  }

  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, monthIndex, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== monthIndex ||
    date.getUTCDate() !== day
  ) {
    return undefined
  }

  return date
}

const formatDateToIso = (date: Date) => (
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
)

export const addDaysToIsoDate = (
  dateIso: string,
  days: number,
): string | undefined => {
  const date = parseIsoDate(dateIso)

  if (date === undefined || !Number.isFinite(days)) {
    return undefined
  }

  const nextDate = new Date(date)
  nextDate.setUTCDate(nextDate.getUTCDate() + days)

  return formatDateToIso(nextDate)
}

export const getPdrGroupById = (groupId: PdrGroupId) => (
  pdrGroupById.get(groupId)
)

export const calculatePdr = ({
  bpMm,
  examDateIso,
  groupId,
}: PdrInput): PdrResult | undefined => {
  if (
    groupId === undefined ||
    examDateIso === undefined ||
    !hasPositiveNumber(bpMm)
  ) {
    return undefined
  }

  const group = pdrGroupById.get(groupId)

  if (group === undefined || parseIsoDate(examDateIso) === undefined) {
    return undefined
  }

  const daysBeforeParturition = (group.bpConstantMm - bpMm) / group.bpCoefficient
  const roundedDaysBeforeParturition = Math.round(daysBeforeParturition)
  const dueDateIso = addDaysToIsoDate(examDateIso, roundedDaysBeforeParturition)
  const rangeStartIso = dueDateIso === undefined
    ? undefined
    : addDaysToIsoDate(dueDateIso, -pdrAccuracyDays)
  const rangeEndIso = dueDateIso === undefined
    ? undefined
    : addDaysToIsoDate(dueDateIso, pdrAccuracyDays)

  if (
    dueDateIso === undefined ||
    rangeStartIso === undefined ||
    rangeEndIso === undefined
  ) {
    return undefined
  }

  return {
    bpMm,
    daysBeforeParturition,
    dueDateIso,
    group,
    isOutsideRecommendedPeriod:
      daysBeforeParturition < group.recommendedDbpMin ||
      daysBeforeParturition > group.recommendedDbpMax,
    rangeEndIso,
    rangeStartIso,
    roundedDaysBeforeParturition,
  }
}

export const formatPdrDate = (dateIso: string): string => {
  const date = parseIsoDate(dateIso)

  if (date === undefined) {
    return dateIso
  }

  return `${String(date.getUTCDate()).padStart(2, '0')}.${String(date.getUTCMonth() + 1).padStart(2, '0')}.${date.getUTCFullYear()}`
}

export const formatPdrNumber = (value: number, digits = 1): string => {
  const multiplier = 10 ** digits
  const roundedValue = Math.round((value + Number.EPSILON) * multiplier) / multiplier

  return roundedValue.toFixed(digits).replace(/\.?0+$/, '')
}
