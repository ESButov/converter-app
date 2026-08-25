import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import KaliumPage from './kalium'

afterEach(() => {
  cleanup()
})

describe('KaliumPage', () => {
  it('calculates kalium replacement rate for KCl 4%', async () => {
    const user = userEvent.setup()

    render(<KaliumPage />)

    expect(screen.getByRole('heading', { name: 'Расчет восполнения калия' })).toBeTruthy()
    expect(screen.getByLabelText('Концентрация KCl, %')).toHaveProperty('value', '4')

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса, кг'), '10')
    await user.type(screen.getByLabelText('Текущий K+, mmol/L'), '2.8')

    expect(screen.queryByText(/Вид: Собака/)).toBeNull()
    expect(screen.queryByText(/Диапазон K\+:/)).toBeNull()
    expect(screen.getByText(/Доза калия: 0.37-0.47 мл\/кг\/ч/)).toBeTruthy()
    expect(screen.getByText(/Потребность калия: 3.7-4.7 мл\/ч/)).toBeTruthy()
    expect(screen.getByText(/Концентрация KCl: 4%/)).toBeTruthy()
    expect(screen.queryByText(/Скорость KCl:/)).toBeNull()
  })

  it('uses editable KCl concentration and shows AAHA source', async () => {
    const user = userEvent.setup()

    render(<KaliumPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'cat')
    await user.type(screen.getByLabelText('Масса, кг'), '10')
    await user.type(screen.getByLabelText('Текущий K+, mmol/L'), '2.8')
    await user.clear(screen.getByLabelText('Концентрация KCl, %'))
    await user.type(screen.getByLabelText('Концентрация KCl, %'), '10')

    expect(screen.getByText(/Доза калия: 0.15-0.19 мл\/кг\/ч/)).toBeTruthy()
    expect(screen.getByText(/Концентрация KCl: 10%/)).toBeTruthy()
    expect(screen.queryByText(/1.341 mEq\/мл/)).toBeNull()
    expect(screen.getByText(/Потребность калия: 1.5-1.9 мл\/ч/)).toBeTruthy()
    expect(screen.getByText('Источник: AAHA 2024.')).toBeTruthy()
  })
})
