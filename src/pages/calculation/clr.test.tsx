import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import ClrPage from './clr'

afterEach(() => {
  cleanup()
})

describe('ClrPage', () => {
  it('renders CPR drug calculator', () => {
    render(<ClrPage />)

    expect(screen.getByRole('heading', { name: 'Расчет препаратов для СЛР' })).toBeTruthy()
    expect(screen.getByLabelText('Вид животного')).toBeTruthy()
    expect(screen.getByLabelText('Масса, кг')).toBeTruthy()
  })

  it('calculates drug volumes after species and weight entry', async () => {
    const user = userEvent.setup()

    render(<ClrPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса, кг'), '5')

    expect(screen.getByText('Адреналин')).toBeTruthy()
    expect(screen.queryByText('0.05 мл')).toBeNull()
    expect(screen.getByText('Разведение: 1 мл препарата 1 мг/мл + 9 мл 0.9% раствора натрия хлорида')).toBeTruthy()
    expect(screen.getAllByText('0.5 мл').length).toBeGreaterThan(0)
    expect(screen.getByText('Интратрахеально: 0.1 мл-0.5 мл (0.1 мг-0.5 мг)')).toBeTruthy()
    expect(screen.getByText('Натрия бикарбонат 8.4%')).toBeTruthy()
    expect(screen.getAllByText('5 мл').length).toBeGreaterThan(0)
  })

  it('shows cat restriction for lidocaine', async () => {
    const user = userEvent.setup()

    render(<ClrPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'cat')
    await user.type(screen.getByLabelText('Масса, кг'), '5')

    expect(screen.getByText('Лидокаин')).toBeTruthy()
    expect(screen.getByText('не рекомендован для выбранного вида')).toBeTruthy()
  })

  it('shows special epinephrine dilution for exotic animals under 1 kg', async () => {
    const user = userEvent.setup()

    render(<ClrPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'exotic')
    await user.type(screen.getByLabelText('Масса, кг'), '0.3')

    expect(screen.getByText('Разведение: 0.1 мл адреналина 1 мг/мл + 9.9 мл 0.9% раствора натрия хлорида')).toBeTruthy()
    expect(screen.getByText('Разведение: 0.1 мл атропина 0.5 мг/мл + 9.9 мл 0.9% раствора натрия хлорида')).toBeTruthy()
    expect(screen.getByText('2.4 мл-3.24 мл')).toBeTruthy()
    expect(screen.getByText('Налоксон')).toBeTruthy()
    expect(screen.getByText('Атипамезол')).toBeTruthy()
    expect(screen.queryByText('Вазопрессин')).toBeNull()
    expect(screen.queryByText('нет дозы для выбранного вида')).toBeNull()
  })
})
