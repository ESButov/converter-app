import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CalcForm from './CalcForm'

const drugs = [
  {
    key: 'nad',
    name: 'Норадреналин',
    allowedAnimals: ['ALL'],
    description: '0.05 - 2 мкг/кг/мин',
    injectorLock: 24,
    speedLock: 1,
    additionalDescription: 'Калькулятор считает Норадреналин на 24 часа.',
  },
]

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      json: async () => drugs,
      ok: true,
      status: 200,
    })),
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('CalcForm', () => {
  it('loads drugs, locks drug-defined fields and shows calculated result', async () => {
    const user = userEvent.setup()

    render(<CalcForm />)

    expect(screen.getByText('Загрузка препаратов...')).toBeTruthy()

    await waitFor(() => {
      expect(screen.queryByText('Загрузка препаратов...')).toBeNull()
    })

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'cat')
    await screen.findByRole('option', { name: 'Норадреналин' })
    await user.selectOptions(screen.getByLabelText('Препарат'), 'nad')
    await user.type(screen.getByLabelText('Масса (кг)'), '10')
    await user.type(screen.getByLabelText('Доза'), '0.1')

    const injectorInput = screen.getByLabelText('Объем шприца (мл)') as HTMLInputElement
    const speedInput = screen.getByLabelText('Скорость инфузии (мл/ч)') as HTMLInputElement

    expect(injectorInput.value).toBe('24')
    expect(injectorInput.disabled).toBe(true)
    expect(speedInput.value).toBe('1')
    expect(speedInput.disabled).toBe(true)
    expect(await screen.findByText('Объем препарата: 0.72 мл.')).toBeTruthy()
    expect(screen.getByText('Калькулятор считает Норадреналин на 24 часа.')).toBeTruthy()
  })
})
