import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import ElectrolytesPage from './electrolytes'

afterEach(() => {
  cleanup()
})

const getSodiumFluidOptionLabels = () => Array.from(
  screen.getByLabelText('Раствор/препарат').querySelectorAll('option'),
  (option) => option.textContent ?? '',
)

describe('ElectrolytesPage', () => {
  it('calculates sodium correction and filters fluids by direction', async () => {
    const user = userEvent.setup()

    render(<ElectrolytesPage />)

    expect(screen.getByRole('heading', { name: 'Корректировка электролитов' })).toBeTruthy()
    expect(screen.getByLabelText('Протокол')).toHaveProperty('disabled', true)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса, кг'), '10')
    await user.selectOptions(screen.getByLabelText('Электролит'), 'sodium')
    await user.type(screen.getByLabelText('Начальный уровень, ммоль/л'), '115')
    await user.type(screen.getByLabelText('Желаемый уровень, ммоль/л'), '125')

    expect(screen.getByText('Направление коррекции: гипонатриемия, повышение натрия.')).toBeTruthy()
    expect(screen.getByLabelText('Протокол')).toHaveProperty('value', 'sodium-controlled')

    const fluidLabels = getSodiumFluidOptionLabels()

    expect(fluidLabels.some((label) => label.includes('Раствор Рингера-лактат'))).toBe(true)
    expect(fluidLabels.some((label) => label.includes('3% натрия хлорид'))).toBe(true)
    expect(fluidLabels.some((label) => label.includes('5% глюкоза в воде'))).toBe(false)

    await user.selectOptions(screen.getByLabelText('Раствор/препарат'), 'normosolR')

    expect(screen.getByText(/Общая вода организма: 6 л/)).toBeTruthy()
    expect(screen.getByText(/Дефицит натрия: 60 ммоль/)).toBeTruthy()
    expect(screen.getByText(/Расчетный объем раствора: 2800 мл/)).toBeTruthy()
    expect(screen.getByText(/Расчетная скорость: 140 мл\/ч/)).toBeTruthy()
  })

  it('calculates kalium replacement for hypokalemia', async () => {
    const user = userEvent.setup()

    render(<ElectrolytesPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'cat')
    await user.type(screen.getByLabelText('Масса, кг'), '10')
    await user.selectOptions(screen.getByLabelText('Электролит'), 'kalium')
    await user.type(screen.getByLabelText('Начальный уровень, ммоль/л'), '2.8')
    await user.type(screen.getByLabelText('Желаемый уровень, ммоль/л'), '4')

    expect(screen.getByText('Направление коррекции: гипокалиемия, восполнение калия.')).toBeTruthy()
    expect(screen.getByLabelText('Протокол')).toHaveProperty('value', 'kalium-replacement')
    expect(screen.getByLabelText('Концентрация калия хлорида, %')).toHaveProperty('value', '4')
    expect(screen.getByText(/Доза калия: 0.37-0.47 мл\/кг\/ч/)).toBeTruthy()
    expect(screen.getByText(/Потребность калия: 3.7-4.7 мл\/ч/)).toBeTruthy()
    expect(screen.getByText(/Концентрация калия хлорида: 4%/)).toBeTruthy()
  })

  it('calculates glucose-insulin mixture for hyperkalemia', async () => {
    const user = userEvent.setup()

    render(<ElectrolytesPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса, кг'), '10')
    await user.selectOptions(screen.getByLabelText('Электролит'), 'kalium')
    await user.type(screen.getByLabelText('Начальный уровень, ммоль/л'), '8')
    await user.type(screen.getByLabelText('Желаемый уровень, ммоль/л'), '6')

    expect(screen.getByText('Направление коррекции: гиперкалиемия, снижение калия.')).toBeTruthy()
    expect(screen.getByLabelText('Протокол')).toHaveProperty('value', 'regular025')
    expect(screen.getByText(/Выбранный инсулин: Актрапид НМ/)).toBeTruthy()
    expect(screen.getByText(/Инсулин регулярный: 2.5 ЕД в\/в однократно \(0.25 ЕД\/кг\)/)).toBeTruthy()
    expect(screen.getByText(/Глюкоза 50% болюсно: 10 мл \(5 г\)/)).toBeTruthy()
    expect(screen.getByText(/добавить 20-40 мл 0.9% раствора натрия хлорида/)).toBeTruthy()

    await user.selectOptions(screen.getByLabelText('Протокол'), 'bsava05')

    expect(screen.getByText(/Инсулин растворимый: 5 ЕД в\/в однократно \(0.5 ЕД\/кг\)/)).toBeTruthy()
    expect(screen.getByText(/Декстроза всего: 10-15 г/)).toBeTruthy()
  })

  it('calculates corrected chloride and filters fluids by direction', async () => {
    const user = userEvent.setup()

    render(<ElectrolytesPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса, кг'), '10')
    await user.selectOptions(screen.getByLabelText('Электролит'), 'chloride')
    await user.type(screen.getByLabelText('Начальный уровень, ммоль/л'), '90')
    await user.type(screen.getByLabelText('Желаемый уровень, ммоль/л'), '110')
    await user.type(screen.getByLabelText('Натрий пациента, ммоль/л'), '125')

    expect(screen.getByText('Направление коррекции: гипохлоремия, восполнение хлора.')).toBeTruthy()
    expect(screen.getByLabelText('Протокол')).toHaveProperty('value', 'chloride-replacement')

    const fluidLabels = Array.from(
      screen.getByLabelText('Раствор/препарат').querySelectorAll('option'),
      (option) => option.textContent ?? '',
    )

    expect(fluidLabels.some((label) => label.includes('0.9% раствор натрия хлорида'))).toBe(true)
    expect(fluidLabels.some((label) => label.includes('Раствор Рингера-лактат'))).toBe(false)

    await user.selectOptions(screen.getByLabelText('Раствор/препарат'), 'sodiumChloride09')

    expect(screen.getByText(/Скорректированный хлор: 104.4 ммоль\/л/)).toBeTruthy()
    expect(screen.getByText(/Разница по скорректированному хлору: \+5.6 ммоль\/л/)).toBeTruthy()
    expect(screen.getByText(/Выбранный раствор: 0.9% раствор натрия хлорида; хлор 154 ммоль\/л/)).toBeTruthy()
  })

  it('calculates calcium gluconate dose for hypocalcemia', async () => {
    const user = userEvent.setup()

    render(<ElectrolytesPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'cat')
    await user.type(screen.getByLabelText('Масса, кг'), '10')
    await user.selectOptions(screen.getByLabelText('Электролит'), 'calcium')
    await user.type(screen.getByLabelText('Начальный уровень, ммоль/л'), '1.4')
    await user.type(screen.getByLabelText('Желаемый уровень, ммоль/л'), '1.8')

    expect(screen.getByText('Направление коррекции: гипокальциемия, восполнение кальция.')).toBeTruthy()
    expect(screen.getByLabelText('Протокол')).toHaveProperty('value', 'calcium-gluconate')
    expect(screen.getByLabelText('Концентрация кальция глюконата, %')).toHaveProperty('value', '10')
    expect(screen.getByText(/Кальция глюконат 10%: 0.5-1.5 мл\/кг/)).toBeTruthy()
    expect(screen.getByText(/Объем на массу животного: 5-15 мл/)).toBeTruthy()
    expect(screen.getByText(/Время введения: 20-30 мин/)).toBeTruthy()
  })

  it('shows hypercalcemia fluid protocol without a target-based dose', async () => {
    const user = userEvent.setup()

    render(<ElectrolytesPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса, кг'), '10')
    await user.selectOptions(screen.getByLabelText('Электролит'), 'calcium')
    await user.type(screen.getByLabelText('Начальный уровень, ммоль/л'), '3.5')
    await user.type(screen.getByLabelText('Желаемый уровень, ммоль/л'), '2.8')

    expect(screen.getByText('Направление коррекции: гиперкальциемия, снижение кальция.')).toBeTruthy()
    expect(screen.getByLabelText('Протокол')).toHaveProperty('value', 'calcium-hypercalcemia')

    await user.selectOptions(screen.getByLabelText('Раствор/препарат'), 'balancedIsotonic')

    expect(screen.getByText(/Выбранный раствор: Буферный изотонический кристаллоид/)).toBeTruthy()
    expect(screen.getByText(/Расчет объема инфузии: по клинической гидратации, перфузии и потерям/)).toBeTruthy()
  })
})
