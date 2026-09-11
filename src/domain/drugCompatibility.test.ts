import { describe, expect, it } from 'vitest'
import {
  analyzeCompatibility,
  getCompatibilitySuggestions,
} from './drugCompatibility'

describe('drugCompatibility', () => {
  it('marks fluoxetine and tramadol as an avoid combination', () => {
    const result = analyzeCompatibility('substance', 'fluoxetine', 'tramadol')

    expect(result?.severity).toBe('avoid')
    expect(result?.title).toBe('Не рекомендуется сочетать')
    expect(result?.summary).toContain('серотонинового синдрома')
  })

  it('marks linezolid and sertraline as an avoid combination', () => {
    const result = analyzeCompatibility('substance', 'linezolid', 'sertraline')

    expect(result?.severity).toBe('avoid')
    expect(result?.reasons.join(' ')).toContain('моноаминоксидазы')
  })

  it('marks methylene blue and fluoxetine as an avoid combination', () => {
    const result = analyzeCompatibility('substance', 'methylene_blue', 'fluoxetine')

    expect(result?.severity).toBe('avoid')
    expect(result?.reasons.join(' ')).toContain('антидот')
  })

  it('marks metoclopramide and tramadol as limited use', () => {
    const result = analyzeCompatibility('substance', 'metoclopramide', 'tramadol')

    expect(result?.severity).toBe('caution')
    expect(result?.title).toBe('Ограниченное использование')
  })

  it('marks ondansetron and tramadol as limited use', () => {
    const result = analyzeCompatibility('substance', 'ondansetron', 'tramadol')

    expect(result?.severity).toBe('caution')
    expect(result?.reasons.join(' ')).toContain('5-HT3')
  })

  it('marks fentanyl and mirtazapine as limited use', () => {
    const result = analyzeCompatibility('substance', 'fentanyl', 'mirtazapine')

    expect(result?.severity).toBe('caution')
    expect(result?.title).toBe('Ограниченное использование')
  })

  it('returns active substance suggestions from the reference directory', () => {
    const suggestions = getCompatibilitySuggestions('substance', 'трам')

    expect(suggestions[0]?.id).toBe('tramadol')
    expect(suggestions[0]?.label).toContain('Трамадол')
  })
})
