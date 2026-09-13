export type RespiratoryRateTimerDuration = 15 | 30 | 60

export const respiratoryRateTimerDurations = [15, 30, 60] as const satisfies readonly RespiratoryRateTimerDuration[]

const hasFiniteNumber = (value: number) => (
  Number.isFinite(value)
)

export const calculateRespiratoryRatePerMinute = (
  breathCount: number,
  durationSeconds: number,
): number | undefined => {
  if (
    !hasFiniteNumber(breathCount) ||
    !hasFiniteNumber(durationSeconds) ||
    breathCount < 0 ||
    durationSeconds <= 0
  ) {
    return undefined
  }

  return Math.round(breathCount * 60 / durationSeconds)
}

export const formatRespiratoryRateTimer = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.ceil(seconds))
  const minutes = Math.floor(safeSeconds / 60)
  const restSeconds = safeSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(restSeconds).padStart(2, '0')}`
}
