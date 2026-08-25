import { describe, expect, it } from 'vitest'
import { renderDescription } from './descriptionTemplates'

describe('renderDescription', () => {
  it('returns static descriptions without changes', () => {
    expect(renderDescription('0.05 - 2 мкг/кг/мин', {})).toBe('0.05 - 2 мкг/кг/мин')
  })

  it('renders dynamic additional descriptions from resolver variables', () => {
    const description = {
      template: '{{resultDisplaing}} мл препарата разводится до 20 мл.',
      variables: {
        resultDisplaing: { resolver: 'resultDisplaing' },
      },
    }

    expect(renderDescription(description, { result: 3.456 })).toBe(
      '3.46 мл препарата разводится до 20 мл.',
    )
  })

  it('removes unknown dynamic variables', () => {
    const description = {
      template: 'Начало {{unknownResolver}} конец',
      variables: {
        unknownResolver: { resolver: 'missingResolver' },
      },
    }

    expect(renderDescription(description, {})).toBe('Начало конец')
  })
})
