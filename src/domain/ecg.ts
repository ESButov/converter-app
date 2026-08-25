export type EcgSpecies = 'dog' | 'cat'

export type EcgInput = {
  pAmplitudeMm?: number
  pDurationMm?: number
  qAmplitudeMm?: number
  qrsDurationMm?: number
  qtIntervalMm?: number
  rAmplitudeMm?: number
  rrIntervalMm?: number
  sAmplitudeMm?: number
  speedMmSec?: number
  stDeviationMm?: number
  tAmplitudeMm?: number
  voltageMmPerMv?: number
}

export type EcgResult = {
  heartRateBpm?: number
  mvPerMm: number
  msPerMm: number
  pAmplitudeMv?: number
  pDurationMs?: number
  qAmplitudeMv?: number
  qrsDurationMs?: number
  qtIntervalMs?: number
  rAmplitudeMv?: number
  sAmplitudeMv?: number
  stDeviationMv?: number
  tAmplitudeMv?: number
}

const round = (value: number, digits = 1) => Number(value.toFixed(digits))

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

const calculateDurationMs = (
  mm: number | undefined,
  speedMmSec: number,
) => (
  hasNonNegativeNumber(mm)
    ? round(mm * 1000 / speedMmSec)
    : undefined
)

const calculateAmplitudeMv = (
  mm: number | undefined,
  voltageMmPerMv: number,
) => (
  hasNonNegativeNumber(mm)
    ? round(mm / voltageMmPerMv, 2)
    : undefined
)

export const calculateEcg = ({
  pAmplitudeMm,
  pDurationMm,
  qAmplitudeMm,
  qrsDurationMm,
  qtIntervalMm,
  rAmplitudeMm,
  rrIntervalMm,
  sAmplitudeMm,
  speedMmSec,
  stDeviationMm,
  tAmplitudeMm,
  voltageMmPerMv,
}: EcgInput): EcgResult | undefined => {
  if (!hasPositiveNumber(speedMmSec) || !hasPositiveNumber(voltageMmPerMv)) {
    return undefined
  }

  return {
    heartRateBpm: hasPositiveNumber(rrIntervalMm)
      ? round(speedMmSec * 60 / rrIntervalMm, 0)
      : undefined,
    mvPerMm: round(1 / voltageMmPerMv, 2),
    msPerMm: round(1000 / speedMmSec),
    pAmplitudeMv: calculateAmplitudeMv(pAmplitudeMm, voltageMmPerMv),
    pDurationMs: calculateDurationMs(pDurationMm, speedMmSec),
    qAmplitudeMv: calculateAmplitudeMv(qAmplitudeMm, voltageMmPerMv),
    qrsDurationMs: calculateDurationMs(qrsDurationMm, speedMmSec),
    qtIntervalMs: calculateDurationMs(qtIntervalMm, speedMmSec),
    rAmplitudeMv: calculateAmplitudeMv(rAmplitudeMm, voltageMmPerMv),
    sAmplitudeMv: calculateAmplitudeMv(sAmplitudeMm, voltageMmPerMv),
    stDeviationMv: calculateAmplitudeMv(stDeviationMm, voltageMmPerMv),
    tAmplitudeMv: calculateAmplitudeMv(tAmplitudeMm, voltageMmPerMv),
  }
}

export const formatEcgNumber = (value: number, digits = 1): string => (
  digits === 0
    ? value.toFixed(0)
    : value.toFixed(digits).replace(/\.?0+$/, '')
)
