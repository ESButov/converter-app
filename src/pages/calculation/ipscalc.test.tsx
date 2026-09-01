import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import IpscalcPage from './ipscalc'

afterEach(() => {
  cleanup()
})

describe('IpscalcPage', () => {
  it('calculates dehydration, maintenance and ongoing losses', async () => {
    const user = userEvent.setup()

    render(<IpscalcPage />)

    expect(screen.getByRole('heading', { name: 'Калькулятор расчета инфузионной терапии' })).toBeTruthy()
    expect(screen.getByLabelText('Период, за который измерены потери, ч')).toHaveProperty('value', '24')

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса, кг'), '10')
    await user.type(screen.getByLabelText('Дегидратация, %'), '8')
    await user.type(screen.getByLabelText('Восполнить дефицит за, ч'), '24')
    await user.type(screen.getByLabelText('Рвота, мл за период'), '100')
    await user.type(screen.getByLabelText('Диарея, мл за период'), '50')

    expect(screen.getByText(/Дефицит жидкости: 800 мл/)).toBeTruthy()
    expect(screen.getByText(/Скорость восполнения дефицита: 33.33 мл\/ч/)).toBeTruthy()
    expect(screen.getByText(/Поддерживающий объем: 370 мл\/сут/)).toBeTruthy()
    expect(screen.getByText(/Поддерживающий объем: 15.42 мл\/ч/)).toBeTruthy()
    expect(screen.getByText(/Продолжающиеся потери: 150 мл за 24 ч/)).toBeTruthy()
    expect(screen.getByText(/Добавить для компенсации потерь: 6.25 мл\/ч на следующие 24 ч, затем переоценить/)).toBeTruthy()
    expect(screen.getByText(/Эквивалент при сохранении потерь: 150 мл\/сут/)).toBeTruthy()
    expect(screen.getByText(/Итоговая скорость на период восполнения дефицита: 55 мл\/ч/)).toBeTruthy()
    expect(screen.getByText(/Объем за первые 24 часа: 1320 мл/)).toBeTruthy()
    expect(screen.queryByText(/мл\/кг\/ч/)).toBeNull()
    expect(screen.queryByText(/проверить риск перегрузки объемом/)).toBeNull()
  })

  it('keeps replacement hours as integer input', async () => {
    const user = userEvent.setup()

    render(<IpscalcPage />)

    await user.type(screen.getByLabelText('Восполнить дефицит за, ч'), '12.5')

    expect(screen.getByLabelText('Восполнить дефицит за, ч')).toHaveProperty('value', '12')
  })

  it('warns when dehydration is 10 percent or higher', async () => {
    const user = userEvent.setup()

    render(<IpscalcPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'cat')
    await user.type(screen.getByLabelText('Масса, кг'), '4')
    await user.type(screen.getByLabelText('Дегидратация, %'), '10')
    await user.type(screen.getByLabelText('Восполнить дефицит за, ч'), '24')

    expect(screen.getByRole('alert').textContent).toContain('Дегидратация 10% и выше')
  })
})
