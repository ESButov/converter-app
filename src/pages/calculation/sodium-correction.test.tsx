import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import SodiumCorrectionPage from './sodium-correction'

afterEach(() => {
  cleanup()
})

const getFluidOptionLabels = () => Array.from(
  screen.getByLabelText('Раствор/препарат для коррекции').querySelectorAll('option'),
  (option) => option.textContent ?? '',
)

describe('SodiumCorrectionPage', () => {
  it('calculates hyponatremia correction and filters fluids for sodium increase', async () => {
    const user = userEvent.setup()

    render(<SodiumCorrectionPage />)

    expect(screen.getByRole('heading', { name: 'Коррекция натрия' })).toBeTruthy()
    expect(screen.getByLabelText('Раствор/препарат для коррекции')).toHaveProperty('disabled', true)
    expect(getFluidOptionLabels()).toEqual(['Сначала укажите уровни Na+'])

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса, кг'), '10')
    await user.type(screen.getByLabelText('Начальный Na+, ммоль/л'), '115')
    await user.type(screen.getByLabelText('Желаемый Na+, ммоль/л'), '125')

    const fluidLabels = getFluidOptionLabels()

    expect(screen.getByLabelText('Раствор/препарат для коррекции')).toHaveProperty('disabled', false)
    expect(screen.getByLabelText('Раствор/препарат для коррекции')).toHaveProperty('value', '')
    expect(fluidLabels[0]).toBe('-')
    expect(fluidLabels).not.toContain('Сначала укажите уровни Na+')
    expect(fluidLabels.some((label) => label.includes('Раствор Рингера-лактат'))).toBe(true)
    expect(fluidLabels.some((label) => label.includes('3% NaCl'))).toBe(true)
    expect(fluidLabels.some((label) => label.includes('5% глюкоза'))).toBe(false)

    await user.selectOptions(screen.getByLabelText('Раствор/препарат для коррекции'), 'normosolR')

    expect(screen.getByText('Тип коррекции: гипонатриемия / повышение Na+')).toBeTruthy()
    expect(screen.getByText(/Общая вода организма: 6 л/)).toBeTruthy()
    expect(screen.getByText(/Дефицит натрия: 60 ммоль/)).toBeTruthy()
    expect(screen.getByText(/Ожидаемое изменение Na\+ на 1 л: \+3.57 ммоль\/л/)).toBeTruthy()
    expect(screen.getByText(/Расчетный объем раствора: 2800 мл/)).toBeTruthy()
    expect(screen.getByText(/Минимальное время коррекции: 20 ч/)).toBeTruthy()
    expect(screen.getByText(/Расчетная скорость: 140 мл\/ч/)).toBeTruthy()
  })

  it('calculates hypernatremia correction and filters fluids for sodium decrease', async () => {
    const user = userEvent.setup()

    render(<SodiumCorrectionPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'cat')
    await user.type(screen.getByLabelText('Масса, кг'), '5')
    await user.type(screen.getByLabelText('Начальный Na+, ммоль/л'), '175')
    await user.type(screen.getByLabelText('Желаемый Na+, ммоль/л'), '145')

    const fluidLabels = getFluidOptionLabels()

    expect(screen.getByLabelText('Раствор/препарат для коррекции')).toHaveProperty('value', '')
    expect(fluidLabels[0]).toBe('-')
    expect(fluidLabels.some((label) => label.includes('5% глюкоза'))).toBe(true)
    expect(fluidLabels.some((label) => label.includes('0.45% NaCl'))).toBe(true)
    expect(fluidLabels.some((label) => label.includes('Plasma-Lyte A'))).toBe(false)
    expect(fluidLabels.some((label) => label.includes('0.9% NaCl'))).toBe(false)

    await user.selectOptions(screen.getByLabelText('Раствор/препарат для коррекции'), 'dextrose5')

    expect(screen.getByText('Тип коррекции: гипернатриемия / снижение Na+')).toBeTruthy()
    expect(screen.getByText(/Дефицит свободной воды: 620.7 мл/)).toBeTruthy()
    expect(screen.getByText(/Ожидаемое изменение Na\+ на 1 л: -43.75 ммоль\/л/)).toBeTruthy()
    expect(screen.getByText(/Расчетный объем раствора: 685.7 мл/)).toBeTruthy()
    expect(screen.getByText(/Минимальное время коррекции: 60 ч/)).toBeTruthy()
    expect(screen.getByText(/Расчетная скорость: 11.43 мл\/ч/)).toBeTruthy()
    expect(screen.getByText(/Болюс при гиповолемии для кошек: 5-10 мл\/кг/)).toBeTruthy()
  })

  it('shows a hypertonic saline bolus reference for selected hypertonic sodium increase', async () => {
    const user = userEvent.setup()

    render(<SodiumCorrectionPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса, кг'), '10')
    await user.type(screen.getByLabelText('Начальный Na+, ммоль/л'), '115')
    await user.type(screen.getByLabelText('Желаемый Na+, ммоль/л'), '125')
    await user.selectOptions(screen.getByLabelText('Раствор/препарат для коррекции'), 'sodiumChloride3')

    expect(screen.getByText(/Болюсный ориентир гипертонического NaCl при неврологических признаках: 20-60 мл за 10-15 минут/)).toBeTruthy()
  })
})
