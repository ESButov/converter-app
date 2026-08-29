import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import MixedInfusionsPage from './mixed-infusions'

afterEach(() => {
  cleanup()
})

describe('MixedInfusionsPage', () => {
  it('calculates a shared syringe from two selected drugs', async () => {
    const user = userEvent.setup()

    render(<MixedInfusionsPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса, кг'), '10')
    expect(screen.getByLabelText('Скорость введения раствора, мл/ч')).toBeTruthy()
    await user.selectOptions(screen.getByLabelText('Препарат 1'), 'l-2')
    await user.type(screen.getAllByLabelText(/Доза введения/)[0], '20')
    await user.selectOptions(screen.getByLabelText('Препарат 2'), 'cer')
    await user.type(screen.getAllByLabelText(/Доза введения/)[1], '0.1')

    const resultTable = screen.getByLabelText('Расчет препаратов смешанной инфузии')

    expect(screen.queryByText('Доза введения')).toBeNull()
    expect(within(screen.getByLabelText('Блок препарата 1')).getByText('мкг/кг/мин')).toBeTruthy()
    expect(screen.getByText('Собака: 20-80 мкг/кг/мин')).toBeTruthy()
    expect(within(resultTable).getByText('Лидокаин 2%')).toBeTruthy()
    expect(within(resultTable).getByText('Церукал (метоклопрамид)')).toBeTruthy()
    expect(screen.getByText(/Общий объем препаратов в растворе: 2.4 мл/)).toBeTruthy()
    expect(screen.getByText(/Добавить физ\. раствор: 17.6 мл/)).toBeTruthy()
    expect(screen.getByText(/Конечная скорость подачи: 6.67 мл\/ч/)).toBeTruthy()
  })

  it('derives infusion duration from syringe size and solution rate', async () => {
    const user = userEvent.setup()

    render(<MixedInfusionsPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса, кг'), '10')
    await user.type(screen.getByLabelText('Скорость введения раствора, мл/ч'), '5')
    await user.selectOptions(screen.getByLabelText('Препарат 1'), 'l-2')
    await user.type(screen.getAllByLabelText(/Доза введения/)[0], '20')
    await user.selectOptions(screen.getByLabelText('Препарат 2'), 'cer')
    await user.type(screen.getAllByLabelText(/Доза введения/)[1], '0.1')

    expect((screen.getByLabelText('Время, часы') as HTMLInputElement).value).toBe('')
    expect((screen.getByLabelText('Время, минуты') as HTMLInputElement).value).toBe('')
    expect(screen.getByText(/Время инфузии: 4 ч/)).toBeTruthy()
    expect(screen.getByText(/Общий объем препаратов в растворе: 3.2 мл/)).toBeTruthy()
    expect(screen.getByText(/Добавить физ\. раствор: 16.8 мл/)).toBeTruthy()
    expect(screen.getByText(/Конечная скорость подачи: 5 мл\/ч/)).toBeTruthy()
  })

  it('warns when fewer than two drugs are filled', async () => {
    const user = userEvent.setup()

    render(<MixedInfusionsPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'cat')
    await user.selectOptions(screen.getByLabelText('Препарат 1'), 'l-2')
    await user.type(screen.getAllByLabelText(/Доза введения/)[0], '20')

    expect(screen.getByRole('alert').textContent).toContain(
      'Для расчета выберите и заполните минимум 2 препарата.',
    )
  })
})
