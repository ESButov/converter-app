export type EchoSpecies = 'cat' | 'dog' | 'horse' | 'pony' | 'ferret' | 'rabbit'
export type EchoSex = 'male' | 'female' | 'unknown'
export type EchoUnit = 'см' | '%' | ''
export type EchoIntervalKind =
  | 'predictionInterval'
  | 'referenceInterval'
  | 'observedRange'
  | 'mean2sdEstimate'
  | 'clinicalCutoff'
  | 'calculated'

export type EchoIndicatorId =
  | 'ivsd'
  | 'lvidd'
  | 'lviddn'
  | 'lvfwd'
  | 'ivss'
  | 'lvids'
  | 'lvidsn'
  | 'lvfws'
  | 'la'
  | 'ao'
  | 'laAo'
  | 'pa'

export type EchoRange = {
  value?: number
  min?: number
  max?: number
  maxExclusive?: number
  unit: EchoUnit
  intervalKind: EchoIntervalKind
}

export type EchoNorm = EchoRange & {
  id: EchoIndicatorId
  label: string
  sourceCode: string
  input: boolean
  derived: boolean
  hasNorm: boolean
  sourceKey?: string
  note?: string
}

export type EchoMeasurements = Partial<Record<EchoIndicatorId, number>>
export type EchoStatus = 'empty' | 'normal' | 'abnormal'

export const echoSpeciesKeys = ['cat', 'dog', 'horse', 'pony', 'ferret', 'rabbit'] as const satisfies readonly EchoSpecies[]

const round = (value: number, digits = 2) => Number(value.toFixed(digits))

const cmFromMm = (valueMm: number, digits = 2) => round(valueMm / 10, digits)

const range = (
  value: number,
  min: number,
  max: number,
  unit: EchoUnit,
  intervalKind: EchoIntervalKind,
): EchoRange => ({
  value,
  min,
  max,
  unit,
  intervalKind,
})

const cmRangeFromMm = (
  valueMm: number,
  minMm: number,
  maxMm: number,
  intervalKind: EchoIntervalKind,
): EchoRange => ({
  value: cmFromMm(valueMm),
  min: cmFromMm(minMm),
  max: cmFromMm(maxMm),
  unit: 'см',
  intervalKind,
})

const echoMeta: Record<EchoIndicatorId, Pick<EchoNorm, 'label' | 'sourceCode' | 'unit'>> = {
  ivsd: { label: 'МЖПд', sourceCode: 'IVSd', unit: 'см' },
  lvidd: { label: 'ЛЖд', sourceCode: 'LVIDd', unit: 'см' },
  lviddn: { label: 'КДРн', sourceCode: 'LVIDdN', unit: '' },
  lvfwd: { label: 'ЗСЛЖд', sourceCode: 'LVFWd', unit: 'см' },
  ivss: { label: 'МЖПс', sourceCode: 'IVSs', unit: 'см' },
  lvids: { label: 'ЛЖс', sourceCode: 'LVIDs', unit: 'см' },
  lvidsn: { label: 'КСРн', sourceCode: 'LVIDsN', unit: '' },
  lvfws: { label: 'ЗСЛЖс', sourceCode: 'LVFWs', unit: 'см' },
  la: { label: 'ЛП', sourceCode: 'LA', unit: 'см' },
  ao: { label: 'Ао', sourceCode: 'Ao', unit: 'см' },
  laAo: { label: 'ЛП/Ао', sourceCode: 'LA:Ao', unit: '' },
  pa: { label: 'ЛАрт', sourceCode: 'PA', unit: 'см' },
}

export const getEchoIndicatorLabel = (id: EchoIndicatorId): string => echoMeta[id].label
export const getEchoIndicatorUnit = (id: EchoIndicatorId): EchoUnit => echoMeta[id].unit

const makeNorm = (
  id: EchoIndicatorId,
  data: EchoRange,
  sourceKey: string,
  overrides: Partial<Pick<EchoNorm, 'label' | 'sourceCode' | 'input' | 'derived' | 'hasNorm' | 'note'>> = {},
): EchoNorm => {
  const meta = echoMeta[id]

  return {
    id,
    label: overrides.label ?? meta.label,
    sourceCode: overrides.sourceCode ?? meta.sourceCode,
    unit: data.unit,
    value: data.value,
    min: data.min,
    max: data.max,
    maxExclusive: data.maxExclusive,
    input: overrides.input ?? true,
    derived: overrides.derived ?? false,
    hasNorm: overrides.hasNorm ?? true,
    intervalKind: data.intervalKind,
    sourceKey,
    note: overrides.note,
  }
}

const makeNoNorm = (
  id: EchoIndicatorId,
  sourceKey: string,
  overrides: Partial<Pick<EchoNorm, 'label' | 'sourceCode' | 'input' | 'derived' | 'note'>> = {},
): EchoNorm => {
  const meta = echoMeta[id]

  return {
    id,
    label: overrides.label ?? meta.label,
    sourceCode: overrides.sourceCode ?? meta.sourceCode,
    unit: meta.unit,
    input: overrides.input ?? true,
    derived: overrides.derived ?? false,
    hasNorm: false,
    intervalKind: 'calculated',
    sourceKey,
    note: overrides.note,
  }
}

export const echoSources = {
  catHaggstrom2016: {
    authors: 'Häggström J. et al.',
    year: 2016,
    title: 'Effect of Body Weight on Echocardiographic Measurements in 19,866 Pure-Bred Cats with or without Heart Disease',
    url: 'https://doi.org/10.1111/jvim.14569',
  },
  dogEsser2020: {
    authors: 'Esser LC. et al.',
    year: 2020,
    title: 'Left ventricular M-mode prediction intervals in 7651 dogs: Population-wide and selected breed-specific values',
    url: 'https://doi.org/10.1111/jvim.15914',
  },
  dogCornell2004: {
    authors: 'Cornell CC. et al.',
    year: 2004,
    title: 'Allometric Scaling of M-Mode Cardiac Measurements in Normal Adult Dogs',
    url: 'https://doi.org/10.1111/j.1939-1676.2004.tb02551.x',
  },
  dogRishniw2023: {
    authors: 'Rishniw M.',
    year: 2023,
    title: 'Proposed limits for ordinal echocardiographic estimates of left atrial enlargement in dogs',
    url: 'https://doi.org/10.1016/j.jvc.2023.04.003',
  },
  dogBoon1983: {
    authors: 'Boon J., Wingfield W., Miller C.',
    year: 1983,
    title: 'Echocardiographic indices in the normal dog',
    url: 'https://doi.org/10.1111/j.1740-8261.1983.tb00718.x',
  },
  dogBoon1998: {
    authors: 'Boon J.',
    year: 1998,
    title: 'Manual of Veterinary Echocardiography',
  },
  dogGoncalves2002: {
    authors: 'Gonçalves AC., Orton EC., Boon JA., Salman MD.',
    year: 2002,
    title: 'Linear, logarithmic, and polynomial models of M-mode echocardiographic measurements in dogs',
    url: 'https://doi.org/10.2460/ajvr.2002.63.994',
  },
  horseSelecky2025: {
    authors: 'Selecky ME., Williams Louie E., Donnelly C., Finno CJ., Morgan JM.',
    year: 2025,
    title: 'Reference Values and Association of Body Weight, Age, and Sex With Echocardiographic Measurements in Non-Athletic Quarter Horses',
    url: 'https://doi.org/10.1111/jvim.70237',
  },
  ponyMatos2026: {
    authors: 'Matos JI., Pitti L., Parra-Quijano M., Arencibia A., Ramírez G., Díaz-Bertrana ML.',
    year: 2026,
    title: 'Integrative anatomical and two-dimensional ultrasonographic assessment of the heart in Shetland ponies',
    url: 'https://doi.org/10.3389/fvets.2025.1721000',
  },
  ferretDudasGyorki2011: {
    authors: 'Dudás-Györki Z., Szabó Z., Manczur F., Vörös K.',
    year: 2011,
    title: 'Echocardiographic and electrocardiographic examination of clinically healthy, conscious ferrets',
    url: 'https://doi.org/10.1111/j.1748-5827.2010.01010.x',
  },
  rabbitGiannico2015: {
    authors: 'Giannico AT., Garcia DAA., Lima L., de Lara FA., Ponczek CAC., Shaw GC., Montiani-Ferreira F., Froes TR.',
    year: 2015,
    title: 'Determination of Normal Echocardiographic, Electrocardiographic, and Radiographic Cardiac Parameters in the Conscious New Zealand White Rabbit',
    url: 'https://doi.org/10.1053/j.jepm.2015.04.013',
  },
} as const

export const horseEchoSourceFooter = `${echoSources.horseSelecky2025.title}. ${echoSources.horseSelecky2025.authors} ${echoSources.horseSelecky2025.year}.`
export const ponyEchoSourceFooter = `${echoSources.ponyMatos2026.title}. ${echoSources.ponyMatos2026.authors} ${echoSources.ponyMatos2026.year}.`
export const ferretEchoSourceFooter = `${echoSources.ferretDudasGyorki2011.title}. ${echoSources.ferretDudasGyorki2011.authors} ${echoSources.ferretDudasGyorki2011.year}.`
export const rabbitEchoSourceFooter = `${echoSources.rabbitGiannico2015.title}. ${echoSources.rabbitGiannico2015.authors} ${echoSources.rabbitGiannico2015.year}.`

export const catEchoIndicatorOrder = [
  'ivsd',
  'lvidd',
  'lvfwd',
  'ivss',
  'lvids',
  'lvfws',
  'la',
  'ao',
  'laAo',
] as const satisfies readonly EchoIndicatorId[]

type CatEchoIndicatorId = (typeof catEchoIndicatorOrder)[number]
type CatEchoRow = {
  weightKg: number
  norms: Record<CatEchoIndicatorId, EchoRange>
}

export const catEchoNormRows2016: readonly CatEchoRow[] = [
  {
    weightKg: 1.5,
    norms: {
      ivsd: cmRangeFromMm(3.1, 2.3, 4.0, 'predictionInterval'),
      lvidd: cmRangeFromMm(11.9, 9.5, 15.0, 'predictionInterval'),
      lvfwd: cmRangeFromMm(2.9, 2.2, 3.8, 'predictionInterval'),
      ivss: cmRangeFromMm(4.8, 3.5, 6.7, 'predictionInterval'),
      lvids: cmRangeFromMm(6.4, 4.2, 9.6, 'predictionInterval'),
      lvfws: cmRangeFromMm(4.8, 3.6, 6.5, 'predictionInterval'),
      la: cmRangeFromMm(7.7, 5.8, 10.2, 'predictionInterval'),
      ao: cmRangeFromMm(7.0, 5.5, 8.8, 'predictionInterval'),
      laAo: range(1.13, 0.85, 1.4, '', 'predictionInterval'),
    },
  },
  {
    weightKg: 2.0,
    norms: {
      ivsd: cmRangeFromMm(3.3, 2.5, 4.3, 'predictionInterval'),
      lvidd: cmRangeFromMm(12.8, 10.2, 16.0, 'predictionInterval'),
      lvfwd: cmRangeFromMm(3.1, 2.4, 4.1, 'predictionInterval'),
      ivss: cmRangeFromMm(5.2, 3.7, 7.2, 'predictionInterval'),
      lvids: cmRangeFromMm(6.9, 4.6, 10.5, 'predictionInterval'),
      lvfws: cmRangeFromMm(5.2, 3.9, 7.1, 'predictionInterval'),
      la: cmRangeFromMm(8.5, 6.3, 11.2, 'predictionInterval'),
      ao: cmRangeFromMm(7.5, 6.0, 9.5, 'predictionInterval'),
      laAo: range(1.13, 0.85, 1.4, '', 'predictionInterval'),
    },
  },
  {
    weightKg: 2.5,
    norms: {
      ivsd: cmRangeFromMm(3.4, 2.6, 4.5, 'predictionInterval'),
      lvidd: cmRangeFromMm(13.6, 10.9, 17.0, 'predictionInterval'),
      lvfwd: cmRangeFromMm(3.2, 2.5, 4.4, 'predictionInterval'),
      ivss: cmRangeFromMm(5.4, 3.9, 7.6, 'predictionInterval'),
      lvids: cmRangeFromMm(7.4, 4.8, 11.2, 'predictionInterval'),
      lvfws: cmRangeFromMm(5.5, 4.1, 7.5, 'predictionInterval'),
      la: cmRangeFromMm(9.1, 6.8, 12.0, 'predictionInterval'),
      ao: cmRangeFromMm(8.0, 6.3, 10.1, 'predictionInterval'),
      laAo: range(1.14, 0.86, 1.41, '', 'predictionInterval'),
    },
  },
  {
    weightKg: 3.0,
    norms: {
      ivsd: cmRangeFromMm(3.5, 2.7, 4.7, 'predictionInterval'),
      lvidd: cmRangeFromMm(14.2, 11.4, 17.8, 'predictionInterval'),
      lvfwd: cmRangeFromMm(3.4, 2.6, 4.5, 'predictionInterval'),
      ivss: cmRangeFromMm(5.7, 4.1, 7.9, 'predictionInterval'),
      lvids: cmRangeFromMm(7.7, 5.1, 11.7, 'predictionInterval'),
      lvfws: cmRangeFromMm(5.8, 4.3, 7.9, 'predictionInterval'),
      la: cmRangeFromMm(9.6, 7.2, 12.7, 'predictionInterval'),
      ao: cmRangeFromMm(8.4, 6.7, 10.7, 'predictionInterval'),
      laAo: range(1.14, 0.86, 1.42, '', 'predictionInterval'),
    },
  },
  {
    weightKg: 3.5,
    norms: {
      ivsd: cmRangeFromMm(3.7, 2.8, 4.9, 'predictionInterval'),
      lvidd: cmRangeFromMm(14.8, 11.9, 18.5, 'predictionInterval'),
      lvfwd: cmRangeFromMm(3.6, 2.7, 4.7, 'predictionInterval'),
      ivss: cmRangeFromMm(5.9, 4.2, 8.2, 'predictionInterval'),
      lvids: cmRangeFromMm(8.0, 5.3, 12.2, 'predictionInterval'),
      lvfws: cmRangeFromMm(6.0, 4.5, 8.2, 'predictionInterval'),
      la: cmRangeFromMm(10.0, 7.6, 13.4, 'predictionInterval'),
      ao: cmRangeFromMm(8.8, 7.0, 11.1, 'predictionInterval'),
      laAo: range(1.15, 0.87, 1.42, '', 'predictionInterval'),
    },
  },
  {
    weightKg: 4.0,
    norms: {
      ivsd: cmRangeFromMm(3.8, 2.8, 4.9, 'predictionInterval'),
      lvidd: cmRangeFromMm(15.4, 12.2, 19.2, 'predictionInterval'),
      lvfwd: cmRangeFromMm(3.7, 2.8, 4.8, 'predictionInterval'),
      ivss: cmRangeFromMm(6.0, 4.3, 8.4, 'predictionInterval'),
      lvids: cmRangeFromMm(8.3, 5.5, 12.6, 'predictionInterval'),
      lvfws: cmRangeFromMm(6.3, 4.6, 8.5, 'predictionInterval'),
      la: cmRangeFromMm(10.5, 7.9, 13.9, 'predictionInterval'),
      ao: cmRangeFromMm(9.1, 7.2, 11.6, 'predictionInterval'),
      laAo: range(1.15, 0.88, 1.43, '', 'predictionInterval'),
    },
  },
  {
    weightKg: 4.5,
    norms: {
      ivsd: cmRangeFromMm(3.9, 2.9, 5.1, 'predictionInterval'),
      lvidd: cmRangeFromMm(15.8, 12.7, 19.8, 'predictionInterval'),
      lvfwd: cmRangeFromMm(3.8, 2.9, 5.0, 'predictionInterval'),
      ivss: cmRangeFromMm(6.2, 4.4, 8.7, 'predictionInterval'),
      lvids: cmRangeFromMm(8.6, 5.7, 13.0, 'predictionInterval'),
      lvfws: cmRangeFromMm(6.5, 4.8, 8.7, 'predictionInterval'),
      la: cmRangeFromMm(10.9, 8.2, 14.5, 'predictionInterval'),
      ao: cmRangeFromMm(9.4, 7.5, 11.9, 'predictionInterval'),
      laAo: range(1.15, 0.88, 1.43, '', 'predictionInterval'),
    },
  },
  {
    weightKg: 5.0,
    norms: {
      ivsd: cmRangeFromMm(3.9, 3.0, 5.2, 'predictionInterval'),
      lvidd: cmRangeFromMm(16.3, 13.0, 20.3, 'predictionInterval'),
      lvfwd: cmRangeFromMm(3.9, 3.0, 5.1, 'predictionInterval'),
      ivss: cmRangeFromMm(6.4, 4.6, 8.9, 'predictionInterval'),
      lvids: cmRangeFromMm(8.8, 5.8, 13.4, 'predictionInterval'),
      lvfws: cmRangeFromMm(6.6, 4.9, 9.0, 'predictionInterval'),
      la: cmRangeFromMm(11.2, 8.4, 14.9, 'predictionInterval'),
      ao: cmRangeFromMm(9.7, 7.7, 12.3, 'predictionInterval'),
      laAo: range(1.16, 0.88, 1.43, '', 'predictionInterval'),
    },
  },
  {
    weightKg: 5.5,
    norms: {
      ivsd: cmRangeFromMm(4.0, 3.0, 5.3, 'predictionInterval'),
      lvidd: cmRangeFromMm(16.7, 13.4, 20.9, 'predictionInterval'),
      lvfwd: cmRangeFromMm(4.0, 3.0, 5.3, 'predictionInterval'),
      ivss: cmRangeFromMm(6.5, 4.7, 9.1, 'predictionInterval'),
      lvids: cmRangeFromMm(9.0, 6.0, 13.7, 'predictionInterval'),
      lvfws: cmRangeFromMm(6.8, 5.0, 9.2, 'predictionInterval'),
      la: cmRangeFromMm(11.6, 8.7, 15.4, 'predictionInterval'),
      ao: cmRangeFromMm(10.0, 7.9, 12.6, 'predictionInterval'),
      laAo: range(1.16, 0.89, 1.44, '', 'predictionInterval'),
    },
  },
  {
    weightKg: 6.0,
    norms: {
      ivsd: cmRangeFromMm(4.1, 3.1, 5.4, 'predictionInterval'),
      lvidd: cmRangeFromMm(17.1, 13.7, 21.4, 'predictionInterval'),
      lvfwd: cmRangeFromMm(4.1, 3.1, 5.4, 'predictionInterval'),
      ivss: cmRangeFromMm(6.6, 4.7, 9.3, 'predictionInterval'),
      lvids: cmRangeFromMm(9.3, 6.1, 14.1, 'predictionInterval'),
      lvfws: cmRangeFromMm(7.0, 5.1, 9.4, 'predictionInterval'),
      la: cmRangeFromMm(11.9, 8.9, 15.8, 'predictionInterval'),
      ao: cmRangeFromMm(10.2, 8.1, 12.9, 'predictionInterval'),
      laAo: range(1.16, 0.89, 1.44, '', 'predictionInterval'),
    },
  },
  {
    weightKg: 6.5,
    norms: {
      ivsd: cmRangeFromMm(4.2, 3.1, 5.5, 'predictionInterval'),
      lvidd: cmRangeFromMm(17.4, 14.0, 21.8, 'predictionInterval'),
      lvfwd: cmRangeFromMm(4.2, 3.1, 5.5, 'predictionInterval'),
      ivss: cmRangeFromMm(6.7, 4.8, 9.4, 'predictionInterval'),
      lvids: cmRangeFromMm(9.4, 6.2, 14.3, 'predictionInterval'),
      lvfws: cmRangeFromMm(7.1, 5.3, 9.6, 'predictionInterval'),
      la: cmRangeFromMm(12.2, 9.2, 16.2, 'predictionInterval'),
      ao: cmRangeFromMm(10.5, 8.3, 13.2, 'predictionInterval'),
      laAo: range(1.17, 0.9, 1.45, '', 'predictionInterval'),
    },
  },
  {
    weightKg: 7.0,
    norms: {
      ivsd: cmRangeFromMm(4.2, 3.2, 5.6, 'predictionInterval'),
      lvidd: cmRangeFromMm(17.8, 14.2, 22.2, 'predictionInterval'),
      lvfwd: cmRangeFromMm(4.3, 3.2, 5.6, 'predictionInterval'),
      ivss: cmRangeFromMm(6.9, 4.9, 9.6, 'predictionInterval'),
      lvids: cmRangeFromMm(9.6, 6.3, 14.6, 'predictionInterval'),
      lvfws: cmRangeFromMm(7.3, 5.4, 9.8, 'predictionInterval'),
      la: cmRangeFromMm(12.5, 9.4, 16.6, 'predictionInterval'),
      ao: cmRangeFromMm(10.7, 8.4, 13.5, 'predictionInterval'),
      laAo: range(1.18, 0.9, 1.46, '', 'predictionInterval'),
    },
  },
  {
    weightKg: 7.5,
    norms: {
      ivsd: cmRangeFromMm(4.3, 3.2, 5.7, 'predictionInterval'),
      lvidd: cmRangeFromMm(18.1, 14.5, 22.6, 'predictionInterval'),
      lvfwd: cmRangeFromMm(4.3, 3.3, 5.7, 'predictionInterval'),
      ivss: cmRangeFromMm(7.0, 5.0, 9.7, 'predictionInterval'),
      lvids: cmRangeFromMm(9.8, 6.5, 14.9, 'predictionInterval'),
      lvfws: cmRangeFromMm(7.4, 5.5, 10.0, 'predictionInterval'),
      la: cmRangeFromMm(12.7, 9.6, 16.9, 'predictionInterval'),
      ao: cmRangeFromMm(10.9, 8.6, 13.8, 'predictionInterval'),
      laAo: range(1.18, 0.91, 1.46, '', 'predictionInterval'),
    },
  },
  {
    weightKg: 8.0,
    norms: {
      ivsd: cmRangeFromMm(4.3, 3.3, 5.8, 'predictionInterval'),
      lvidd: cmRangeFromMm(18.4, 14.7, 23.0, 'predictionInterval'),
      lvfwd: cmRangeFromMm(4.4, 3.3, 5.8, 'predictionInterval'),
      ivss: cmRangeFromMm(7.1, 5.1, 9.9, 'predictionInterval'),
      lvids: cmRangeFromMm(10.0, 6.6, 15.1, 'predictionInterval'),
      lvfws: cmRangeFromMm(7.5, 5.6, 10.2, 'predictionInterval'),
      la: cmRangeFromMm(13.0, 9.8, 17.3, 'predictionInterval'),
      ao: cmRangeFromMm(11.1, 8.8, 14.0, 'predictionInterval'),
      laAo: range(1.19, 0.91, 1.47, '', 'predictionInterval'),
    },
  },
  {
    weightKg: 8.5,
    norms: {
      ivsd: cmRangeFromMm(4.4, 3.3, 5.8, 'predictionInterval'),
      lvidd: cmRangeFromMm(18.7, 15.0, 23.4, 'predictionInterval'),
      lvfwd: cmRangeFromMm(4.4, 3.4, 5.9, 'predictionInterval'),
      ivss: cmRangeFromMm(7.2, 5.1, 10.0, 'predictionInterval'),
      lvids: cmRangeFromMm(10.1, 6.7, 15.4, 'predictionInterval'),
      lvfws: cmRangeFromMm(7.6, 5.6, 10.3, 'predictionInterval'),
      la: cmRangeFromMm(13.2, 10.0, 17.6, 'predictionInterval'),
      ao: cmRangeFromMm(11.3, 8.9, 14.3, 'predictionInterval'),
      laAo: range(1.19, 0.92, 1.47, '', 'predictionInterval'),
    },
  },
  {
    weightKg: 9.0,
    norms: {
      ivsd: cmRangeFromMm(4.4, 3.3, 5.9, 'predictionInterval'),
      lvidd: cmRangeFromMm(19.0, 15.2, 23.7, 'predictionInterval'),
      lvfwd: cmRangeFromMm(4.5, 3.4, 5.9, 'predictionInterval'),
      ivss: cmRangeFromMm(7.3, 5.2, 10.2, 'predictionInterval'),
      lvids: cmRangeFromMm(10.3, 6.8, 15.6, 'predictionInterval'),
      lvfws: cmRangeFromMm(7.7, 5.7, 10.5, 'predictionInterval'),
      la: cmRangeFromMm(13.5, 10.1, 17.9, 'predictionInterval'),
      ao: cmRangeFromMm(11.5, 9.1, 14.5, 'predictionInterval'),
      laAo: range(1.2, 0.92, 1.47, '', 'predictionInterval'),
    },
  },
  {
    weightKg: 9.5,
    norms: {
      ivsd: cmRangeFromMm(4.5, 3.4, 6.0, 'predictionInterval'),
      lvidd: cmRangeFromMm(19.3, 15.4, 24.0, 'predictionInterval'),
      lvfwd: cmRangeFromMm(4.6, 3.4, 5.9, 'predictionInterval'),
      ivss: cmRangeFromMm(7.4, 5.3, 10.3, 'predictionInterval'),
      lvids: cmRangeFromMm(10.4, 6.9, 15.8, 'predictionInterval'),
      lvfws: cmRangeFromMm(7.9, 5.8, 10.6, 'predictionInterval'),
      la: cmRangeFromMm(13.7, 10.3, 18.2, 'predictionInterval'),
      ao: cmRangeFromMm(11.6, 9.1, 14.7, 'predictionInterval'),
      laAo: range(1.2, 0.92, 1.48, '', 'predictionInterval'),
    },
  },
  {
    weightKg: 10.0,
    norms: {
      ivsd: cmRangeFromMm(4.5, 3.4, 6.0, 'predictionInterval'),
      lvidd: cmRangeFromMm(19.5, 15.6, 24.4, 'predictionInterval'),
      lvfwd: cmRangeFromMm(4.6, 3.5, 6.1, 'predictionInterval'),
      ivss: cmRangeFromMm(7.4, 5.3, 10.4, 'predictionInterval'),
      lvids: cmRangeFromMm(10.5, 6.9, 16.0, 'predictionInterval'),
      lvfws: cmRangeFromMm(8.0, 5.9, 10.8, 'predictionInterval'),
      la: cmRangeFromMm(13.9, 10.5, 18.5, 'predictionInterval'),
      ao: cmRangeFromMm(11.8, 9.3, 14.9, 'predictionInterval'),
      laAo: range(1.21, 0.92, 1.48, '', 'predictionInterval'),
    },
  },
  {
    weightKg: 10.5,
    norms: {
      ivsd: cmRangeFromMm(4.6, 3.5, 6.1, 'predictionInterval'),
      lvidd: cmRangeFromMm(19.8, 15.8, 24.7, 'predictionInterval'),
      lvfwd: cmRangeFromMm(4.7, 3.5, 6.2, 'predictionInterval'),
      ivss: cmRangeFromMm(7.5, 5.4, 10.5, 'predictionInterval'),
      lvids: cmRangeFromMm(10.7, 7.1, 16.3, 'predictionInterval'),
      lvfws: cmRangeFromMm(8.1, 6.0, 10.9, 'predictionInterval'),
      la: cmRangeFromMm(14.1, 10.6, 18.8, 'predictionInterval'),
      ao: cmRangeFromMm(11.9, 9.5, 15.1, 'predictionInterval'),
      laAo: range(1.22, 0.94, 1.49, '', 'predictionInterval'),
    },
  },
  {
    weightKg: 11.0,
    norms: {
      ivsd: cmRangeFromMm(4.6, 3.5, 6.1, 'predictionInterval'),
      lvidd: cmRangeFromMm(20.0, 16.0, 25.0, 'predictionInterval'),
      lvfwd: cmRangeFromMm(4.7, 3.5, 6.2, 'predictionInterval'),
      ivss: cmRangeFromMm(7.6, 5.4, 10.6, 'predictionInterval'),
      lvids: cmRangeFromMm(10.8, 7.2, 16.5, 'predictionInterval'),
      lvfws: cmRangeFromMm(8.1, 6.0, 11.0, 'predictionInterval'),
      la: cmRangeFromMm(14.3, 10.8, 19.1, 'predictionInterval'),
      ao: cmRangeFromMm(12.1, 9.6, 15.3, 'predictionInterval'),
      laAo: range(1.22, 0.94, 1.5, '', 'predictionInterval'),
    },
  },
]

export const getCatEchoWeightBucket = (weightKg: number): number | undefined => {
  if (!Number.isFinite(weightKg) || weightKg < 1.5) return undefined

  return Math.min(11, Math.floor(weightKg * 2) / 2)
}

export const getCatEchoNorms = (weightKg: number): Record<CatEchoIndicatorId, EchoNorm> | undefined => {
  const bucket = getCatEchoWeightBucket(weightKg)
  if (bucket === undefined) return undefined

  const row = catEchoNormRows2016.find((item) => item.weightKg === bucket)
  if (!row) return undefined

  return Object.fromEntries(
    catEchoIndicatorOrder.map((id) => [id, makeNorm(id, row.norms[id], 'catHaggstrom2016')]),
  ) as Record<CatEchoIndicatorId, EchoNorm>
}

export const dogEchoIndicatorOrder = [
  'ivsd',
  'lvidd',
  'lviddn',
  'lvfwd',
  'ivss',
  'lvids',
  'lvidsn',
  'lvfws',
  'la',
  'ao',
  'laAo',
] as const satisfies readonly EchoIndicatorId[]

type DogEchoIndicatorId = (typeof dogEchoIndicatorOrder)[number]

type DogPrintedTableColumnId = Exclude<DogEchoIndicatorId, 'lviddn' | 'lvidsn' | 'laAo'>

type DogPrintedTableRowMm = Record<DogPrintedTableColumnId, readonly [number, number]>

type DogPrintedTableModel = {
  transform: 'log' | 'sqrt'
  minCoefficients: readonly [number, number, number, number]
  maxCoefficients: readonly [number, number, number, number]
}

const dogPrintedTableColumns = [
  'ivsd',
  'lvidd',
  'lvfwd',
  'ivss',
  'lvids',
  'lvfws',
  'ao',
  'la',
] as const satisfies readonly DogPrintedTableColumnId[]

const dogPrintedTableSource = 'dogGoncalves2002'
const poundsPerKg = 2.20462

const dogPrintedTableAnchorRowsMm: Partial<Record<number, DogPrintedTableRowMm>> = {
  1: {
    ivsd: [4.4, 6.8],
    lvidd: [-7.7, 4.2],
    lvfwd: [3.5, 5.4],
    ivss: [6.7, 9.4],
    lvids: [-8.7, 1.6],
    lvfws: [6.1, 8.5],
    ao: [-11.3, 2.6],
    la: [-14.2, 1.2],
  },
  2: {
    ivsd: [4.7, 6.9],
    lvidd: [-1.2, 10.7],
    lvfwd: [3.7, 5.5],
    ivss: [7.1, 9.6],
    lvids: [-4.2, 6.1],
    lvfws: [6.4, 8.7],
    ao: [-6.7, 7.2],
    la: [-8.4, 7.1],
  },
  5: {
    ivsd: [5.3, 7.3],
    lvidd: [7.5, 19.3],
    lvfwd: [4.2, 5.8],
    ivss: [7.9, 10.2],
    lvids: [1.8, 12.1],
    lvfws: [7.1, 9.2],
    ao: [-0.6, 13.3],
    la: [0.9, 16.3],
  },
  11: {
    ivsd: [6.1, 7.8],
    lvidd: [14.9, 26.7],
    lvfwd: [4.9, 6.2],
    ivss: [9.2, 11.1],
    lvids: [6.9, 17.2],
    lvfws: [8.1, 9.9],
    ao: [4.7, 18.5],
    la: [6.1, 21.4],
  },
  17: {
    ivsd: [6.8, 8.2],
    lvidd: [19.0, 30.8],
    lvfwd: [5.4, 6.6],
    ivss: [10.2, 11.8],
    lvids: [9.8, 20.1],
    lvfws: [9.0, 10.4],
    ao: [7.6, 21.4],
    la: [9.7, 25.0],
  },
  22: {
    ivsd: [7.3, 8.5],
    lvidd: [21.5, 33.2],
    lvfwd: [5.8, 6.9],
    ivss: [10.9, 12.3],
    lvids: [11.5, 21.7],
    lvfws: [9.6, 10.9],
    ao: [9.3, 23.1],
    la: [11.8, 27.2],
  },
  28: {
    ivsd: [7.8, 8.9],
    lvidd: [23.7, 35.5],
    lvfwd: [6.3, 7.2],
    ivss: [11.7, 13.0],
    lvids: [13.1, 23.3],
    lvfws: [10.3, 11.4],
    ao: [11.0, 24.7],
    la: [13.9, 29.2],
  },
  33: {
    ivsd: [8.2, 9.2],
    lvidd: [25.3, 37.0],
    lvfwd: [6.6, 7.4],
    ivss: [12.4, 13.5],
    lvids: [14.1, 24.4],
    lvfws: [10.8, 11.8],
    ao: [12.1, 25.8],
    la: [15.3, 30.6],
  },
  44: {
    ivsd: [9.0, 9.9],
    lvidd: [28.0, 39.7],
    lvfwd: [7.2, 8.0],
    ivss: [13.5, 14.5],
    lvids: [16.0, 26.2],
    lvfws: [11.7, 12.6],
    ao: [14.0, 27.7],
    la: [17.7, 33.0],
  },
  55: {
    ivsd: [9.6, 10.6],
    lvidd: [30.1, 41.8],
    lvfwd: [7.8, 8.6],
    ivss: [14.6, 15.6],
    lvids: [17.5, 27.7],
    lvfws: [12.5, 13.5],
    ao: [15.5, 29.2],
    la: [19.6, 34.9],
  },
  69: {
    ivsd: [10.3, 11.5],
    lvidd: [32.3, 43.9],
    lvfwd: [8.3, 9.3],
    ivss: [15.7, 17.0],
    lvids: [19.0, 29.2],
    lvfws: [13.4, 14.7],
    ao: [17.0, 30.7],
    la: [21.5, 36.8],
  },
  88: {
    ivsd: [11.1, 12.7],
    lvidd: [34.5, 46.3],
    lvfwd: [8.9, 10.3],
    ivss: [17.0, 18.8],
    lvids: [20.5, 30.8],
    lvfws: [14.4, 16.1],
    ao: [18.6, 32.4],
    la: [23.5, 38.9],
  },
  110: {
    ivsd: [11.9, 14.0],
    lvidd: [36.6, 48.4],
    lvfwd: [9.6, 11.4],
    ivss: [18.3, 20.7],
    lvids: [22.0, 32.3],
    lvfws: [15.5, 17.8],
    ao: [20.1, 34.0],
    la: [25.4, 40.9],
  },
  117: {
    ivsd: [12.1, 14.4],
    lvidd: [37.2, 49.0],
    lvfwd: [9.8, 11.7],
    ivss: [18.7, 21.3],
    lvids: [22.4, 32.7],
    lvfws: [15.8, 18.3],
    ao: [20.5, 34.4],
    la: [25.9, 41.4],
  },
  143: {
    ivsd: [13.0, 15.9],
    lvidd: [39.0, 51.0],
    lvfwd: [10.5, 12.9],
    ivss: [20.2, 23.4],
    lvids: [23.6, 34.1],
    lvfws: [16.9, 20.0],
    ao: [21.7, 35.8],
    la: [27.4, 43.1],
  },
  154: {
    ivsd: [13.3, 16.5],
    lvidd: [39.6, 51.7],
    lvfwd: [10.8, 13.4],
    ivss: [20.8, 24.3],
    lvids: [24.0, 34.6],
    lvfws: [17.4, 20.7],
    ao: [22.1, 36.3],
    la: [28.0, 43.8],
  },
  165: {
    ivsd: [13.6, 17.0],
    lvidd: [40.2, 52.4],
    lvfwd: [11.0, 13.9],
    ivss: [21.4, 25.1],
    lvids: [24.4, 35.1],
    lvfws: [17.8, 21.4],
    ao: [22.5, 36.8],
    la: [28.5, 44.4],
  },
  180: {
    ivsd: [14.1, 17.8],
    lvidd: [41.0, 53.3],
    lvfwd: [11.4, 14.5],
    ivss: [22.1, 26.3],
    lvids: [25.0, 35.7],
    lvfws: [18.4, 22.3],
    ao: [23.0, 37.5],
    la: [29.2, 45.3],
  },
  198: {
    ivsd: [14.6, 18.7],
    lvidd: [41.8, 54.3],
    lvfwd: [11.8, 15.3],
    ivss: [23.0, 27.6],
    lvids: [25.5, 36.4],
    lvfws: [19.1, 23.4],
    ao: [23.5, 38.2],
    la: [29.8, 46.2],
  },
  200: {
    ivsd: [14.6, 18.8],
    lvidd: [41.8, 54.4],
    lvfwd: [11.9, 15.3],
    ivss: [23.1, 27.7],
    lvids: [25.5, 36.5],
    lvfws: [19.2, 23.5],
    ao: [23.6, 38.3],
    la: [29.9, 46.3],
  },
}

const dogPrintedTableModels: Record<DogPrintedTableColumnId, DogPrintedTableModel> = {
  ivsd: {
    transform: 'sqrt',
    minCoefficients: [3.4947289181836, 1.21757661634231, 0.00205994089111882, -0.000812841794238892],
    maxCoefficients: [6.71598094530728, 0.102008274722315, 0.154556007774187, -0.00334951329894584],
  },
  lvidd: {
    transform: 'log',
    minCoefficients: [-0.568773413956032, 9.86002027837434, -0.124581798125951, 0.00664583251667207],
    maxCoefficients: [11.415835859458, 9.93712347968853, -0.32415625804908, 0.0516316271759451],
  },
  lvfwd: {
    transform: 'sqrt',
    minCoefficients: [2.72328788320697, 1.01400980979251, -0.00323309306410309, -0.000304271083826729],
    maxCoefficients: [5.28782271488225, 0.135093090745103, 0.118286053375193, -0.00226249962624827],
  },
  ivss: {
    transform: 'sqrt',
    minCoefficients: [5.40826289578934, 1.67873607570827, 0.0340975362112377, -0.00170095501912795],
    maxCoefficients: [9.0584183730635, 0.421262162088451, 0.204127894733396, -0.00446559261451191],
  },
  lvids: {
    transform: 'log',
    minCoefficients: [-3.79005394595697, 6.79102885232203, -0.051918276021014, -0.00159708339640693],
    maxCoefficients: [6.60917482116884, 6.89785459584103, -0.231579982070015, 0.0376936319316234],
  },
  lvfws: {
    transform: 'sqrt',
    minCoefficients: [4.95214111605624, 1.47373062599673, 0.00706398285185849, -0.000598221441151394],
    maxCoefficients: [8.31798090629498, 0.2638571121108, 0.181878976921892, -0.00441005706798173],
  },
  ao: {
    transform: 'log',
    minCoefficients: [-6.30879246469352, 6.91452173167143, -0.00749852087287393, -0.0111580436000159],
    maxCoefficients: [7.7179941082975, 7.03384647017344, -0.253670437179246, 0.043438463824261],
  },
  la: {
    transform: 'log',
    minCoefficients: [-7.36373314766635, 9.30563471881152, -0.494058764233285, 0.0609839445068638],
    maxCoefficients: [8.19858044872154, 9.43769724778328, -0.741779965900167, 0.116470089733027],
  },
}

export const getDogEchoWeightBucket = (weightKg: number): number | undefined => {
  if (!Number.isFinite(weightKg) || weightKg <= 0) return undefined

  return Math.min(200, Math.max(1, Math.floor(weightKg * poundsPerKg + Number.EPSILON)))
}

const dogPrintedTableWeightKg = (lbs: number) => round(lbs / poundsPerKg, 1)

const evaluateDogPrintedTableModel = (
  model: DogPrintedTableModel,
  coefficients: readonly [number, number, number, number],
  weightKg: number,
): number => {
  const transformedWeight = model.transform === 'log' ? Math.log(weightKg) : Math.sqrt(weightKg)

  return round(
    coefficients.reduce((sum, coefficient, index) => sum + coefficient * transformedWeight ** index, 0),
    1,
  )
}

const getDogPrintedTableRowMm = (lbs: number): DogPrintedTableRowMm => {
  const anchor = dogPrintedTableAnchorRowsMm[lbs]
  if (anchor) return anchor

  const weightKg = dogPrintedTableWeightKg(lbs)

  const row: Partial<DogPrintedTableRowMm> = {}

  dogPrintedTableColumns.forEach((id) => {
    const model = dogPrintedTableModels[id]

    row[id] = [
      evaluateDogPrintedTableModel(model, model.minCoefficients, weightKg),
      evaluateDogPrintedTableModel(model, model.maxCoefficients, weightKg),
    ]
  })

  return row as DogPrintedTableRowMm
}

const dogPrintedTableRange = (id: DogPrintedTableColumnId, lbs: number): EchoRange => {
  const [minMm, maxMm] = getDogPrintedTableRowMm(lbs)[id]

  return {
    min: cmFromMm(minMm),
    max: cmFromMm(maxMm),
    unit: 'см',
    intervalKind: 'predictionInterval',
  }
}

const dogNormalizedRangeFromPrintedTable = (
  id: Extract<DogPrintedTableColumnId, 'lvidd' | 'lvids'>,
  lbs: number,
  exponent: number,
): EchoRange => {
  const [minMm, maxMm] = getDogPrintedTableRowMm(lbs)[id]
  const normalizer = dogPrintedTableWeightKg(lbs) ** exponent

  return {
    min: round(cmFromMm(minMm) / normalizer),
    max: round(cmFromMm(maxMm) / normalizer),
    unit: '',
    intervalKind: 'predictionInterval',
  }
}

export const getDogEchoNorms = (weightKg: number): Record<DogEchoIndicatorId, EchoNorm> | undefined => {
  const lbs = getDogEchoWeightBucket(weightKg)
  if (lbs === undefined) return undefined

  return {
    ivsd: makeNorm('ivsd', dogPrintedTableRange('ivsd', lbs), dogPrintedTableSource),
    lvidd: makeNoNorm('lvidd', dogPrintedTableSource, {
      label: 'КДР/ЛЖд',
      note: 'Только поле ввода. Норма выводится ниже у расчетного показателя КДРн.',
    }),
    lviddn: makeNorm('lviddn', dogNormalizedRangeFromPrintedTable('lvidd', lbs, 0.294), dogPrintedTableSource, {
      input: false,
      derived: true,
      note: 'КДРн = КДР/ЛЖд / масса^0.294. Норма рассчитана из интервала ЛЖ-d исходной таблицы.',
    }),
    lvfwd: makeNorm('lvfwd', dogPrintedTableRange('lvfwd', lbs), dogPrintedTableSource),
    ivss: makeNorm('ivss', dogPrintedTableRange('ivss', lbs), dogPrintedTableSource),
    lvids: makeNoNorm('lvids', dogPrintedTableSource, {
      label: 'КСР/ЛЖс',
      note: 'Только поле ввода. Норма выводится ниже у расчетного показателя КСРн.',
    }),
    lvidsn: makeNorm('lvidsn', dogNormalizedRangeFromPrintedTable('lvids', lbs, 0.315), dogPrintedTableSource, {
      input: false,
      derived: true,
      note: 'КСРн = КСР/ЛЖс / масса^0.315. Норма рассчитана из интервала ЛЖ-s исходной таблицы.',
    }),
    lvfws: makeNorm('lvfws', dogPrintedTableRange('lvfws', lbs), dogPrintedTableSource),
    la: makeNorm('la', dogPrintedTableRange('la', lbs), dogPrintedTableSource),
    ao: makeNorm('ao', dogPrintedTableRange('ao', lbs), dogPrintedTableSource),
    laAo: makeNorm(
      'laAo',
      { maxExclusive: 1.6, unit: '', intervalKind: 'clinicalCutoff' },
      'dogRishniw2023',
      { note: 'Норма ЛП/Ао для собак: < 1.6.' },
    ),
  }
}

export const calculateDogEchoDerivedValues = (
  weightKg: number,
  measurements: EchoMeasurements,
): EchoMeasurements => {
  const values = calculateEchoDerivedValues(measurements)

  if (Number.isFinite(weightKg) && weightKg > 0 && Number.isFinite(values.lvidd)) {
    values.lviddn = round(Number(values.lvidd) / weightKg ** 0.294)
  }

  if (Number.isFinite(weightKg) && weightKg > 0 && Number.isFinite(values.lvids)) {
    values.lvidsn = round(Number(values.lvids) / weightKg ** 0.315)
  }

  return values
}

export const horseEchoIndicatorOrder = [
  'ivsd',
  'lvidd',
  'lvfwd',
  'ivss',
  'lvids',
  'lvfws',
  'la',
  'ao',
  'pa',
  'laAo',
] as const satisfies readonly EchoIndicatorId[]

type HorseEchoIndicatorId = (typeof horseEchoIndicatorOrder)[number]

const horse500KgNorms: Record<HorseEchoIndicatorId, EchoRange> = {
  ivsd: range(2.9, 2.2, 3.5, 'см', 'referenceInterval'),
  lvidd: range(9.8, 8.4, 11.3, 'см', 'referenceInterval'),
  lvfwd: range(2.5, 1.9, 3.2, 'см', 'referenceInterval'),
  ivss: range(4.3, 3.4, 5.2, 'см', 'referenceInterval'),
  lvids: range(5.6, 4.1, 7.0, 'см', 'referenceInterval'),
  lvfws: range(4.0, 3.1, 4.5, 'см', 'referenceInterval'),
  la: range(10.2, 8.7, 11.6, 'см', 'referenceInterval'),
  ao: range(6.2, 5.2, 7.3, 'см', 'referenceInterval'),
  pa: range(5.0, 4.0, 6.0, 'см', 'referenceInterval'),
  laAo: range(1.6, 1.3, 1.9, '', 'referenceInterval'),
}

const scaleHorseFrom500Kg = (data: EchoRange, weightKg: number): EchoRange => {
  if (data.unit !== 'см') return data

  const scale = (value: number | undefined) =>
    value === undefined ? undefined : round(value * (weightKg / 500) ** (1 / 3))

  return {
    ...data,
    value: scale(data.value),
    min: scale(data.min),
    max: scale(data.max),
  }
}

export const getHorseEchoNorms = (weightKg: number): Record<HorseEchoIndicatorId, EchoNorm> | undefined => {
  if (!Number.isFinite(weightKg) || weightKg <= 0) return undefined

  return Object.fromEntries(
    horseEchoIndicatorOrder.map((id) => [
      id,
      makeNorm(id, scaleHorseFrom500Kg(horse500KgNorms[id], weightKg), 'horseSelecky2025'),
    ]),
  ) as Record<HorseEchoIndicatorId, EchoNorm>
}

export const ponyEchoIndicatorOrder = [
  'ivsd',
  'lvidd',
  'lvfwd',
  'ivss',
  'lvids',
  'lvfws',
  'la',
  'ao',
  'pa',
] as const satisfies readonly EchoIndicatorId[]

type PonyEchoIndicatorId = (typeof ponyEchoIndicatorOrder)[number]

export const ponyEchoNorms: Record<PonyEchoIndicatorId, EchoNorm> = {
  ivsd: makeNorm('ivsd', range(1.6, 1.2, 2.2, 'см', 'observedRange'), 'ponyMatos2026'),
  lvidd: makeNorm('lvidd', range(5.4, 4.2, 7.3, 'см', 'observedRange'), 'ponyMatos2026', {
    sourceCode: 'LVd',
  }),
  lvfwd: makeNorm('lvfwd', range(1.8, 1.1, 2.6, 'см', 'observedRange'), 'ponyMatos2026'),
  ivss: makeNorm('ivss', range(2.3, 2.0, 3.0, 'см', 'observedRange'), 'ponyMatos2026'),
  lvids: makeNorm('lvids', range(3.0, 1.9, 4.5, 'см', 'observedRange'), 'ponyMatos2026', {
    sourceCode: 'LVs',
  }),
  lvfws: makeNorm('lvfws', range(2.7, 1.6, 4.0, 'см', 'observedRange'), 'ponyMatos2026'),
  la: makeNorm('la', range(4.2, 3.1, 5.7, 'см', 'observedRange'), 'ponyMatos2026', {
    sourceCode: 'LAd',
  }),
  ao: makeNorm('ao', range(3.6, 2.7, 4.8, 'см', 'observedRange'), 'ponyMatos2026', {
    sourceCode: 'AoVD',
  }),
  pa: makeNorm('pa', range(2.7, 2.5, 3.1, 'см', 'observedRange'), 'ponyMatos2026', {
    sourceCode: 'PTVD',
  }),
}

export const ferretEchoIndicatorOrder = [
  'ivsd',
  'lvidd',
  'lvfwd',
  'ivss',
  'lvids',
  'lvfws',
  'la',
  'ao',
  'pa',
] as const satisfies readonly EchoIndicatorId[]

type FerretEchoIndicatorId = (typeof ferretEchoIndicatorOrder)[number]

const ferretNorm = (
  id: FerretEchoIndicatorId,
  valueMm: number,
  minMm: number,
  maxMm: number,
): EchoNorm => makeNorm(id, cmRangeFromMm(valueMm, minMm, maxMm, 'observedRange'), 'ferretDudasGyorki2011')

const maleFerretEchoNorms: Record<FerretEchoIndicatorId, EchoNorm> = {
  ivsd: ferretNorm('ivsd', 3.1, 2.5, 3.5),
  lvidd: ferretNorm('lvidd', 13.0, 9.8, 14.7),
  lvfwd: makeNorm('lvfwd', cmRangeFromMm(3.3, 2.7, 3.9, 'observedRange'), 'ferretDudasGyorki2011', {
    sourceCode: 'LVWd',
  }),
  ivss: ferretNorm('ivss', 4.1, 3.2, 4.7),
  lvids: ferretNorm('lvids', 8.9, 6.6, 10.9),
  lvfws: makeNorm('lvfws', cmRangeFromMm(4.4, 3.5, 5.2, 'observedRange'), 'ferretDudasGyorki2011', {
    sourceCode: 'LVWs',
  }),
  la: ferretNorm('la', 10.0, 8.3, 15.5),
  ao: ferretNorm('ao', 5.5, 4.0, 6.4),
  pa: makeNorm('pa', cmRangeFromMm(5.2, 4.1, 5.8, 'observedRange'), 'ferretDudasGyorki2011', {
    sourceCode: 'A. pulm',
  }),
}

const femaleFerretEchoNorms: Record<FerretEchoIndicatorId, EchoNorm> = {
  ivsd: ferretNorm('ivsd', 2.6, 2.2, 3.7),
  lvidd: ferretNorm('lvidd', 10.4, 7.6, 13.4),
  lvfwd: makeNorm('lvfwd', cmRangeFromMm(2.8, 2.3, 3.6, 'observedRange'), 'ferretDudasGyorki2011', {
    sourceCode: 'LVWd',
  }),
  ivss: ferretNorm('ivss', 3.4, 2.6, 4.4),
  lvids: ferretNorm('lvids', 7.1, 3.6, 10.3),
  lvfws: makeNorm('lvfws', cmRangeFromMm(3.6, 2.6, 4.4, 'observedRange'), 'ferretDudasGyorki2011', {
    sourceCode: 'LVWs',
  }),
  la: ferretNorm('la', 8.9, 6.8, 13.2),
  ao: ferretNorm('ao', 4.6, 4.0, 5.2),
  pa: makeNorm('pa', cmRangeFromMm(4.5, 3.7, 5.2, 'observedRange'), 'ferretDudasGyorki2011', {
    sourceCode: 'A. pulm',
  }),
}

const mergeFerretNorms = (
  male: Record<FerretEchoIndicatorId, EchoNorm>,
  female: Record<FerretEchoIndicatorId, EchoNorm>,
): Record<FerretEchoIndicatorId, EchoNorm> =>
  Object.fromEntries(
    ferretEchoIndicatorOrder.map((id) => {
      const maleNorm = male[id]
      const femaleNorm = female[id]
      const value = maleNorm.value !== undefined && femaleNorm.value !== undefined
        ? round((maleNorm.value + femaleNorm.value) / 2)
        : undefined

      return [
        id,
        {
          ...maleNorm,
          value,
          min: Math.min(maleNorm.min ?? Number.POSITIVE_INFINITY, femaleNorm.min ?? Number.POSITIVE_INFINITY),
          max: Math.max(maleNorm.max ?? Number.NEGATIVE_INFINITY, femaleNorm.max ?? Number.NEGATIVE_INFINITY),
          note: 'Пол не указан: объединен диапазон самцов и самок.',
        },
      ]
    }),
  ) as Record<FerretEchoIndicatorId, EchoNorm>

export const getFerretEchoNorms = (sex: EchoSex): Record<FerretEchoIndicatorId, EchoNorm> => {
  if (sex === 'male') return maleFerretEchoNorms
  if (sex === 'female') return femaleFerretEchoNorms

  return mergeFerretNorms(maleFerretEchoNorms, femaleFerretEchoNorms)
}

export const rabbitEchoIndicatorOrder = [
  'ivsd',
  'lvidd',
  'lvfwd',
  'ivss',
  'lvids',
  'lvfws',
  'la',
  'ao',
  'laAo',
] as const satisfies readonly EchoIndicatorId[]

type RabbitEchoIndicatorId = (typeof rabbitEchoIndicatorOrder)[number]

const mean2sdMm = (id: RabbitEchoIndicatorId, meanMm: number, sdMm: number): EchoNorm =>
  makeNorm(
    id,
    {
      value: cmFromMm(meanMm),
      min: cmFromMm(meanMm - 2 * sdMm),
      max: cmFromMm(meanMm + 2 * sdMm),
      unit: 'см',
      intervalKind: 'mean2sdEstimate',
    },
    'rabbitGiannico2015',
    { note: 'В источнике указано mean +/- SD; интервал в коде рассчитан как mean +/- 2SD.' },
  )

const mean2sd = (id: RabbitEchoIndicatorId, mean: number, sd: number, unit: EchoUnit): EchoNorm =>
  makeNorm(
    id,
    {
      value: round(mean),
      min: round(mean - 2 * sd),
      max: round(mean + 2 * sd),
      unit,
      intervalKind: 'mean2sdEstimate',
    },
    'rabbitGiannico2015',
    { note: 'В источнике указано mean +/- SD; интервал в коде рассчитан как mean +/- 2SD.' },
  )

export const rabbitEchoNorms: Record<RabbitEchoIndicatorId, EchoNorm> = {
  ivsd: mean2sdMm('ivsd', 2.74, 0.51),
  lvidd: mean2sdMm('lvidd', 13.28, 1.91),
  lvfwd: mean2sdMm('lvfwd', 2.78, 0.54),
  ivss: mean2sdMm('ivss', 4.01, 0.7),
  lvids: mean2sdMm('lvids', 8.32, 1.47),
  lvfws: mean2sdMm('lvfws', 3.56, 0.52),
  la: mean2sdMm('la', 8.62, 1.02),
  ao: mean2sdMm('ao', 7.9, 0.77),
  laAo: mean2sd('laAo', 1.09, 0.1, ''),
}

export const calculateEchoDerivedValues = (measurements: EchoMeasurements): EchoMeasurements => {
  const values = { ...measurements }
  const la = Number(values.la)
  const ao = Number(values.ao)

  if (values.laAo === undefined && Number.isFinite(la) && Number.isFinite(ao) && ao > 0) {
    values.laAo = round(la / ao)
  }

  return values
}

export const getEchoStatus = (value: number | undefined, norm: EchoNorm | undefined): EchoStatus => {
  if (value === undefined || !Number.isFinite(value) || !norm?.hasNorm) return 'empty'
  if (norm.min !== undefined && value < norm.min) return 'abnormal'
  if (norm.max !== undefined && value > norm.max) return 'abnormal'
  if (norm.maxExclusive !== undefined && value >= norm.maxExclusive) return 'abnormal'

  return 'normal'
}

export const formatEchoNorm = (norm: EchoNorm | undefined): string => {
  if (!norm?.hasNorm) return ''
  if (norm.min !== undefined && norm.max !== undefined && norm.value !== undefined) {
    return `${norm.value} (${norm.min}-${norm.max})`
  }
  if (norm.min !== undefined && norm.max !== undefined) {
    return `${norm.min}-${norm.max}`
  }
  if (norm.min !== undefined && norm.max === undefined) {
    return `>= ${norm.min}`
  }
  if (norm.maxExclusive !== undefined) {
    return `< ${norm.maxExclusive}`
  }

  return ''
}
