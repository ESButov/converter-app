import { describe, expect, it } from 'vitest'
import { calculateClrDrugs } from './clr'

describe('calculateClrDrugs', () => {
  it('calculates RECOVER 2024 drug volumes for a dog', () => {
    const result = calculateClrDrugs('dog', 5)

    expect(result.find((drug) => drug.definition.id === 'epinephrine')?.volumeLabel).toBe('0.05 мл')
    expect(result.find((drug) => drug.definition.id === 'epinephrine')?.dilutionLabel).toBe(
      'Разведение: 1 мл препарата 1 мг/мл + 9 мл 0.9% раствора натрия хлорида',
    )
    expect(result.find((drug) => drug.definition.id === 'epinephrine')?.dilutionVolumeLabel).toBe('0.5 мл')
    expect(result.find((drug) => drug.definition.id === 'epinephrine')?.intratrachealLabel).toBe(
      'Интратрахеально: 0.1 мл-0.5 мл (0.1 мг-0.5 мг)',
    )
    expect(result.find((drug) => drug.definition.id === 'vasopressin')?.volumeLabel).toBe('0.2 мл')
    expect(result.find((drug) => drug.definition.id === 'vasopressin')?.intratrachealLabel).toBe(
      'Интратрахеально: 0.3 мл (6 ЕД)',
    )
    expect(result.find((drug) => drug.definition.id === 'atropine')?.volumeLabel).toBe('0.4 мл-0.54 мл')
    expect(result.find((drug) => drug.definition.id === 'atropine')?.dilutionLabel).toBe(
      'Разведение: 1 мл препарата 0.5 мг/мл + 9 мл 0.9% раствора натрия хлорида',
    )
    expect(result.find((drug) => drug.definition.id === 'atropine')?.dilutionVolumeLabel).toBe('4 мл-5.4 мл')
    expect(result.find((drug) => drug.definition.id === 'atropine')?.intratrachealLabel).toBe(
      'Интратрахеально: 1.5 мл-2 мл (0.75 мг-1 мг)',
    )
    expect(result.find((drug) => drug.definition.id === 'lidocaine')?.volumeLabel).toBe('0.5 мл')
    expect(result.find((drug) => drug.definition.id === 'lidocaine')?.dilutionVolumeLabel).toBe('5 мл')
    expect(result.find((drug) => drug.definition.id === 'lidocaine')?.intratrachealLabel).toBeUndefined()
    expect(result.find((drug) => drug.definition.id === 'sodium_bicarbonate')?.volumeLabel).toBe('5 мл')
  })

  it('does not calculate lidocaine for cats', () => {
    const result = calculateClrDrugs('cat', 5)
    const lidocaine = result.find((drug) => drug.definition.id === 'lidocaine')

    expect(lidocaine?.amountLabel).toBe('не рассчитывается')
    expect(lidocaine?.volumeLabel).toBe('не рекомендован для выбранного вида')
  })

  it('returns empty result until species and weight are entered', () => {
    expect(calculateClrDrugs(undefined, 5)).toHaveLength(0)
    expect(calculateClrDrugs('dog', undefined)).toHaveLength(0)
    expect(calculateClrDrugs('dog', 0)).toHaveLength(0)
  })

  it('calculates only selected emergency drugs for exotic animals', () => {
    const result = calculateClrDrugs('exotic', 0.3)
    const epinephrine = result.find((drug) => drug.definition.id === 'epinephrine')
    const atropine = result.find((drug) => drug.definition.id === 'atropine')
    const naloxone = result.find((drug) => drug.definition.id === 'naloxone')
    const atipamezole = result.find((drug) => drug.definition.id === 'atipamezole')

    expect(result.map((drug) => drug.definition.id)).toEqual([
      'epinephrine',
      'atropine',
      'naloxone',
      'atipamezole',
    ])

    expect(epinephrine?.volumeLabel).toBe('0.3 мл')
    expect(epinephrine?.specialDilutionLabel).toBe(
      'Разведение: 0.1 мл адреналина 1 мг/мл + 9.9 мл 0.9% раствора натрия хлорида',
    )
    expect(atropine?.volumeLabel).toBe('2.4 мл-3.24 мл')
    expect(atropine?.specialDilutionLabel).toBe(
      'Разведение: 0.1 мл атропина 0.5 мг/мл + 9.9 мл 0.9% раствора натрия хлорида',
    )
    expect(naloxone?.volumeLabel).toBe('0.03 мл')
    expect(atipamezole?.volumeLabel).toBe('0.006 мл')
  })
})
