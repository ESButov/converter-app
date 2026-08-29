import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import GlucoseInsulinPage from './glucose-insulin'

afterEach(() => {
  cleanup()
})

describe('GlucoseInsulinPage', () => {
  it('calculates the regular insulin and 50% glucose protocol', async () => {
    const user = userEvent.setup()

    render(<GlucoseInsulinPage />)

    expect(screen.getByRole('heading', { name: 'Расчет глюкозо-инсулиновой смеси' })).toBeTruthy()

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса, кг'), '10')
    await user.type(screen.getByLabelText('Начальный K+, ммоль/л'), '8')
    await user.type(screen.getByLabelText('Желаемый K+, ммоль/л'), '6')

    expect(screen.getByText(/Цель снижения K\+: 2 ммоль\/л \(8 -> 6\)/)).toBeTruthy()
    expect(screen.getByText(/Выбранный инсулин: Актрапид НМ/)).toBeTruthy()
    expect(screen.getByText(/Инсулин регулярный: 2.5 ЕД IV однократно \(0.25 ЕД\/кг\)/)).toBeTruthy()
    expect(screen.getByText(/Глюкоза 50% болюсно: 10 мл \(5 г\)/)).toBeTruthy()
    expect(screen.getByText(/добавить 20-40 мл 0.9% NaCl/)).toBeTruthy()
    expect(screen.getByText(/Итоговый объем разведенного болюса: 30-50 мл/)).toBeTruthy()
    expect(screen.getByText(/Цель снижения больше 1.5 ммоль\/л/)).toBeTruthy()
  })

  it('calculates the BSAVA dextrose per insulin unit protocol', async () => {
    const user = userEvent.setup()

    render(<GlucoseInsulinPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'cat')
    await user.type(screen.getByLabelText('Масса, кг'), '10')
    await user.type(screen.getByLabelText('Начальный K+, ммоль/л'), '7.5')
    await user.type(screen.getByLabelText('Желаемый K+, ммоль/л'), '6.5')
    await user.selectOptions(screen.getByLabelText('Инсулин короткого действия'), 'humalog')
    await user.selectOptions(screen.getByLabelText('Протокол'), 'bsava05')

    expect(screen.getByText(/Выбранный инсулин: Хумалог/)).toBeTruthy()
    expect(screen.getByText(/Инсулин растворимый: 5 ЕД IV однократно \(0.5 ЕД\/кг\)/)).toBeTruthy()
    expect(screen.getByText(/Декстроза всего: 10-15 г/)).toBeTruthy()
    expect(screen.getByText(/Глюкоза 50% всего: 20-30 мл/)).toBeTruthy()
    expect(screen.getByText(/1\/2 объема глюкозы болюсно: 10-15 мл \(5-7.5 г\)/)).toBeTruthy()
    expect(screen.getByText(/Остаток глюкозы IV за 4-6 часов: 10-15 мл/)).toBeTruthy()
  })

  it('recalculates glucose volume by selected concentration', async () => {
    const user = userEvent.setup()

    render(<GlucoseInsulinPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса, кг'), '10')
    await user.type(screen.getByLabelText('Начальный K+, ммоль/л'), '8')
    await user.type(screen.getByLabelText('Желаемый K+, ммоль/л'), '6')
    await user.selectOptions(screen.getByLabelText('Концентрация глюкозы'), '40')

    expect(screen.getByText(/Глюкоза 40% болюсно: 12.5 мл \(5 г\)/)).toBeTruthy()
    expect(screen.getByText(/добавить 25-50 мл 0.9% NaCl/)).toBeTruthy()
    expect(screen.getByText(/Итоговый объем разведенного болюса: 37.5-62.5 мл/)).toBeTruthy()
  })

  it('warns when target kalium is not lower than current kalium', async () => {
    const user = userEvent.setup()

    render(<GlucoseInsulinPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса, кг'), '10')
    await user.type(screen.getByLabelText('Начальный K+, ммоль/л'), '5')
    await user.type(screen.getByLabelText('Желаемый K+, ммоль/л'), '5')

    expect(screen.getByRole('alert').textContent).toContain(
      'Желаемый K+ должен быть ниже начального',
    )
    expect(screen.queryByText(/Инсулин регулярный/)).toBeNull()
  })
})
