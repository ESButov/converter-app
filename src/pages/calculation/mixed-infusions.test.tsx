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
    expect(screen.getByText('Собака: 1.2-4.8 мг/кг/ч (20-80 мкг/кг/мин)')).toBeTruthy()
    expect(within(resultTable).getByText('Лидокаин 2%')).toBeTruthy()
    expect(within(resultTable).getByText('Церукал (метоклопрамид)')).toBeTruthy()
    expect(screen.getByText(/Общий объем препаратов в растворе: 2.4 мл/)).toBeTruthy()
    expect(screen.getByText(/Добавить физ\. раствор: 17.6 мл/)).toBeTruthy()
    expect(screen.getByText(/Конечная скорость подачи: 6.67 мл\/ч/)).toBeTruthy()
  })

  it('calculates FLK drugs as mixed infusion components', async () => {
    const user = userEvent.setup()

    render(<MixedInfusionsPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса, кг'), '34.5')
    await user.selectOptions(screen.getByLabelText('Препарат 1'), 'fentanyl')
    await user.type(screen.getAllByLabelText(/Доза введения/)[0], '0.02')
    await user.selectOptions(screen.getByLabelText('Препарат 2'), 'l-2')
    await user.type(screen.getAllByLabelText(/Доза введения/)[1], '17')
    await user.selectOptions(screen.getByLabelText('Препарат 3'), 'ketamine')
    await user.type(screen.getAllByLabelText(/Доза введения/)[2], '10')

    const resultTable = screen.getByLabelText('Расчет препаратов смешанной инфузии')

    expect(within(resultTable).getByText('Фентанил')).toBeTruthy()
    expect(within(resultTable).getByText('Кетамин')).toBeTruthy()
    expect(within(resultTable).getByText('2.48 мл')).toBeTruthy()
    expect(within(resultTable).getByText('5.28 мл')).toBeTruthy()
    expect(within(resultTable).getByText('0.62 мл')).toBeTruthy()
    expect(screen.getByText(/Общий объем препаратов в растворе: 8.38 мл/)).toBeTruthy()
    expect(screen.getByText(/Добавить физ\. раствор: 11.62 мл/)).toBeTruthy()
    expect(screen.getByText(/Конечная скорость подачи: 6.67 мл\/ч/)).toBeTruthy()
    expect(screen.getByText(/Фентанил в\/м или в\/в: 0.002 мг\/кг = 1.38 мл/)).toBeTruthy()
    expect(screen.getByText(/Лидокаин 2% в\/в: .*1 мг\/кг = 1.73 мл/)).toBeTruthy()
    expect(screen.getByText(/Кетамин в\/в: .*0.5 мг\/кг = 0.17 мл/)).toBeTruthy()
  })

  it('allows two decimal places for ketamine dose input', async () => {
    const user = userEvent.setup()

    render(<MixedInfusionsPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.selectOptions(screen.getByLabelText('Препарат 1'), 'ketamine')

    const ketamineDoseInput = screen.getAllByLabelText(/Доза введения/)[0] as HTMLInputElement

    expect(ketamineDoseInput.step).toBe('0.01')

    await user.type(ketamineDoseInput, '10.25')

    expect(ketamineDoseInput.value).toBe('10.25')

    await user.type(ketamineDoseInput, '6')

    expect(ketamineDoseInput.value).toBe('10.25')
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
