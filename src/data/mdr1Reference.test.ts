import { describe, expect, it } from 'vitest'
import {
  getMdr1ReferenceResultById,
  getMdr1ReferenceItemById,
  getMdr1Suggestions,
  mdr1BreedFrequencyItems,
  mdr1StatusLabels,
} from './mdr1Reference'

describe('mdr1Reference', () => {
  it('returns MDR1 status for high-risk substances', () => {
    const loperamide = getMdr1ReferenceItemById('loperamide')

    expect(loperamide?.status).toBe('avoid')
    expect(mdr1StatusLabels[loperamide?.status ?? 'avoid']).toBe('избегать')
    expect(loperamide?.mutantMutantRisk).toContain('Очень высокий риск')
  })

  it('finds entries by trade names and maps them to active substances', () => {
    const imodiumSuggestions = getMdr1Suggestions('имодиум')
    const cereniaSuggestions = getMdr1Suggestions('церения')
    const konaflionSuggestions = getMdr1Suggestions('конафлион')

    expect(imodiumSuggestions[0]?.id).toBe('loperamide')
    expect(imodiumSuggestions[0]?.matchType).toBe('Препарат')
    expect(cereniaSuggestions[0]?.id).toBe('maropitant')
    expect(konaflionSuggestions[0]?.id).toBe('preparation:konaflion')
    expect(konaflionSuggestions[0]?.matchType).toBe('Препарат')
  })

  it('finds substances by russian name', () => {
    const suggestions = getMdr1Suggestions('ивермектин')

    expect(suggestions[0]?.id).toBe('ivermectin')
    expect(suggestions[0]?.matchType).toBe('Действующее вещество')
  })

  it('returns a safe instruction-based result for available non-risk references', () => {
    const result = getMdr1ReferenceResultById('preparation:konaflion')

    expect(result?.russianName).toBe('Конафлион')
    expect(result?.status).toBe('label-dose')
    expect(result?.safetyComment).toContain('Использовать по инструкции')
  })

  it('keeps breed frequency data for the MDR1 reference page', () => {
    expect(mdr1BreedFrequencyItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ breed: 'Колли', frequency: '≈70%' }),
        expect.objectContaining({ breed: 'Австралийская овчарка', frequency: '≈50%' }),
        expect.objectContaining({ breed: 'Кошки', frequency: '≈4%' }),
      ]),
    )
  })
})
