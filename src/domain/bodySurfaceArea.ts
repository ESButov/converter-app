type BodySurfaceAreaSpeciesKey =
  | 'dog'
  | 'cat'
  | 'rabbitPet'
  | 'ferret'
  | 'cattle'
  | 'horse'
  | 'monkey'
  | 'mouse'
  | 'rat'

type BodySurfaceAreaCoefficient = {
  key: BodySurfaceAreaSpeciesKey
  speciesRu: string
  speciesEn: string
  label: string
  coefficientKg: number
}

const bodySurfaceAreaCoefficients = [
  {
    key: 'dog',
    speciesRu: 'Собака',
    speciesEn: 'Dog',
    label: 'Собака',
    coefficientKg: 0.101,
  },
  {
    key: 'cat',
    speciesRu: 'Кошка',
    speciesEn: 'Cat',
    label: 'Кошка',
    coefficientKg: 0.1,
  },
  {
    key: 'rabbitPet',
    speciesRu: 'Кролик, домашний',
    speciesEn: 'Rabbit, pet domestic',
    label: 'Кролик, домашний',
    coefficientKg: 0.099,
  },
  {
    key: 'ferret',
    speciesRu: 'Хорек',
    speciesEn: 'Ferret',
    label: 'Хорек',
    coefficientKg: 0.0994,
  },
  {
    key: 'cattle',
    speciesRu: 'Крупный рогатый скот',
    speciesEn: 'Cattle',
    label: 'Крупный рогатый скот',
    coefficientKg: 0.094,
  },
  {
    key: 'horse',
    speciesRu: 'Лошадь',
    speciesEn: 'Horse',
    label: 'Лошадь',
    coefficientKg: 0.105,
  },
  {
    key: 'monkey',
    speciesRu: 'Примат',
    speciesEn: 'Monkey',
    label: 'Примат',
    coefficientKg: 0.118,
  },
  {
    key: 'mouse',
    speciesRu: 'Мышь',
    speciesEn: 'Mouse',
    label: 'Мышь',
    coefficientKg: 0.079,
  },
  {
    key: 'rat',
    speciesRu: 'Крыса',
    speciesEn: 'Rat',
    label: 'Крыса',
    coefficientKg: 0.095,
  },
] as const satisfies readonly BodySurfaceAreaCoefficient[]

const bodySurfaceAreaCoefficientByKey = bodySurfaceAreaCoefficients.reduce(
  (result, coefficient) => ({
    ...result,
    [coefficient.key]: coefficient,
  }),
  {} as Record<BodySurfaceAreaSpeciesKey, BodySurfaceAreaCoefficient>,
)

const calculateBodySurfaceArea = (
  weightKg: number,
  coefficientKg: number,
) => coefficientKg * Math.pow(weightKg, 2 / 3)

const getBodySurfaceAreaCoefficient = (
  key: string,
): BodySurfaceAreaCoefficient | undefined => {
  if (key in bodySurfaceAreaCoefficientByKey) {
    return bodySurfaceAreaCoefficientByKey[key as BodySurfaceAreaSpeciesKey]
  }

  return undefined
}

export {
  bodySurfaceAreaCoefficientByKey,
  bodySurfaceAreaCoefficients,
  calculateBodySurfaceArea,
  getBodySurfaceAreaCoefficient,
}
export type {
  BodySurfaceAreaCoefficient,
  BodySurfaceAreaSpeciesKey,
}
