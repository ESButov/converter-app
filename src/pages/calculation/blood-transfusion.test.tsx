import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import BloodTransfusionPage from './blood-transfusion'

afterEach(() => {
  cleanup()
})

describe('BloodTransfusionPage', () => {
  it('shows and hides blood component help by question button or outside click', async () => {
    const user = userEvent.setup()

    render(<BloodTransfusionPage />)

    const helpButton = screen.getByRole('button', { name: 'Показать справку по компонентам крови' })

    expect(screen.queryByRole('dialog', { name: 'Практическое использование компонентов крови' })).toBeNull()

    await user.click(helpButton)

    expect(screen.getByRole('dialog', { name: 'Практическое использование компонентов крови' })).toBeTruthy()
    expect(screen.getByText('Острая анемия')).toBeTruthy()
    expect(screen.getByText('Коагулопатия / родентициды')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Закрыть справку по компонентам крови' })).toBeNull()
    expect(helpButton.getAttribute('aria-expanded')).toBe('true')

    await user.click(helpButton)

    expect(screen.queryByRole('dialog', { name: 'Практическое использование компонентов крови' })).toBeNull()
    expect(helpButton.getAttribute('aria-expanded')).toBe('false')

    await user.click(helpButton)

    expect(screen.getByRole('dialog', { name: 'Практическое использование компонентов крови' })).toBeTruthy()

    await user.click(screen.getByRole('heading', { name: 'Расчет крови и компонентов крови' }))

    expect(screen.queryByRole('dialog', { name: 'Практическое использование компонентов крови' })).toBeNull()
  })

  it('calculates whole blood volume without transfusion speed fields', async () => {
    const user = userEvent.setup()

    render(<BloodTransfusionPage />)

    expect(screen.getByRole('heading', { name: 'Расчет крови и компонентов крови' })).toBeTruthy()

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса, кг'), '10')
    await user.type(screen.getByLabelText('Текущий HCT/PCV, %'), '15')
    await user.type(screen.getByLabelText('Целевой HCT/PCV, %'), '25')
    await user.type(screen.getByLabelText('HCT/PCV продукта / донора, %'), '40')

    expect(screen.getByLabelText('HCT/PCV продукта / донора, %')).toBeTruthy()
    expect(screen.queryByLabelText('Планируемый объем, мл')).toBeNull()
    expect(screen.queryByLabelText('Время трансфузии, часы')).toBeNull()
    expect(screen.queryByLabelText('Скорость трансфузии, мл/ч')).toBeNull()
    expect(screen.queryByText(/BV:/)).toBeNull()
    expect(screen.getByText(/Расчетный объем компонента: 225 мл/)).toBeTruthy()
    expect(screen.getByText(/Объем на кг: 22.5 мл\/кг/)).toBeTruthy()
    expect(screen.queryByText(/Скорость:/)).toBeNull()
  })

  it('calculates packed RBC volume without transfusion speed fields', async () => {
    const user = userEvent.setup()

    render(<BloodTransfusionPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса, кг'), '10')
    await user.selectOptions(screen.getByLabelText('Компонент крови'), 'packedRbc')
    await user.type(screen.getByLabelText('Текущий HCT/PCV, %'), '15')
    await user.type(screen.getByLabelText('Целевой HCT/PCV, %'), '25')
    await user.type(screen.getByLabelText('HCT/PCV продукта, %'), '40')

    expect(screen.getByLabelText('HCT/PCV продукта, %')).toBeTruthy()
    expect(screen.queryByLabelText('HCT/PCV продукта / донора, %')).toBeNull()
    expect(screen.queryByLabelText('Время трансфузии, часы')).toBeNull()
    expect(screen.queryByLabelText('Скорость трансфузии, мл/ч')).toBeNull()
    expect(screen.getByText(/Расчетный объем компонента: 225 мл/)).toBeTruthy()
    expect(screen.queryByText(/Скорость:/)).toBeNull()
    expect(screen.queryByText(/BV:/)).toBeNull()
  })

  it('calculates expected PCV from a planned volume', async () => {
    const user = userEvent.setup()

    render(<BloodTransfusionPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса, кг'), '10')
    await user.selectOptions(screen.getByLabelText('Компонент крови'), 'packedRbc')
    await user.type(screen.getByLabelText('Текущий HCT/PCV, %'), '15')
    await user.type(screen.getByLabelText('Целевой HCT/PCV, %'), '25')
    await user.type(screen.getByLabelText('HCT/PCV продукта, %'), '40')
    await user.type(screen.getByLabelText('Планируемый объем, мл'), '100')

    expect(screen.getByText(/Планируемый объем: 100 мл/)).toBeTruthy()
    expect(screen.getByText(/Ожидаемый HCT\/PCV по планируемому объему: 19.4% \(\+4.4%\)/)).toBeTruthy()
  })

  it('calculates plasma volume range without transfusion speed fields', async () => {
    const user = userEvent.setup()

    render(<BloodTransfusionPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'cat')
    await user.type(screen.getByLabelText('Масса, кг'), '4')
    await user.selectOptions(screen.getByLabelText('Компонент крови'), 'plasma')

    expect(screen.queryByLabelText('Время трансфузии, часы')).toBeNull()
    expect(screen.queryByLabelText('Скорость трансфузии, мл/ч')).toBeNull()
    expect(screen.getByText(/Доза плазмы: 6-10 мл\/кг/)).toBeTruthy()
    expect(screen.getByText(/Объем плазмы: 24-40 мл/)).toBeTruthy()
    expect(screen.queryByText(/Время:/)).toBeNull()
    expect(screen.queryByText(/Скорость:/)).toBeNull()
  })

  it('calculates platelet unit dose', async () => {
    const user = userEvent.setup()

    render(<BloodTransfusionPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса, кг'), '23')
    await user.selectOptions(screen.getByLabelText('Компонент крови'), 'platelets')

    expect(screen.getByText(/Доза: 1 ед. на 10 кг/)).toBeTruthy()
    expect(screen.getByText(/Расчетно: 2.30 ед./)).toBeTruthy()
    expect(screen.getByText(/Округление: 3 ед./)).toBeTruthy()
  })

  it('calculates donor blood collection volume without recipient fields', async () => {
    const user = userEvent.setup()

    render(<BloodTransfusionPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса, кг'), '40')
    await user.selectOptions(screen.getByLabelText('Компонент крови'), 'donorCollection')

    expect(screen.queryByLabelText('Текущий HCT/PCV, %')).toBeNull()
    expect(screen.queryByLabelText('Целевой HCT/PCV, %')).toBeNull()
    expect(screen.queryByLabelText('HCT/PCV продукта / донора, %')).toBeNull()
    expect(screen.queryByLabelText('HCT/PCV продукта, %')).toBeNull()
    expect(screen.queryByLabelText('Планируемый объем, мл')).toBeNull()
    expect(screen.getByText(/Компонент: Забор крови у донора/)).toBeTruthy()
    expect(screen.getByText(/Расчетный объем забора: 600 мл/)).toBeTruthy()
    expect(screen.getByText(/Ориентир: 15 мл\/кг/)).toBeTruthy()
    expect(screen.queryByText(/не более 450 мл/)).toBeNull()
    expect(screen.getByText(/Краткие требования к донору:/)).toBeTruthy()
    expect(screen.getByText(/масса от 25 кг/)).toBeTruthy()
    expect(screen.queryByText(/Перед трансфузией:/)).toBeNull()

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'cat')
    await user.clear(screen.getByLabelText('Масса, кг'))
    await user.type(screen.getByLabelText('Масса, кг'), '10')

    expect(screen.getByText(/Расчетный объем забора: 100-120 мл/)).toBeTruthy()
    expect(screen.getByText(/Ориентир: 10-12 мл\/кг/)).toBeTruthy()
    expect(screen.queryByText(/не более 60 мл/)).toBeNull()
  })

  it('calculates albumin replacement from the blood component selector', async () => {
    const user = userEvent.setup()

    render(<BloodTransfusionPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса, кг'), '10')
    await user.selectOptions(screen.getByLabelText('Компонент крови'), 'albumin')
    await user.type(screen.getByLabelText('Альбумин крови, г/л'), '20')
    await user.type(screen.getByLabelText('Желаемый альбумин, г/л'), '25')

    expect(screen.queryByLabelText('Текущий HCT/PCV, %')).toBeNull()
    expect(screen.getByText(/Компонент: Альбумин/)).toBeTruthy()
    expect(screen.getByText(/Объем 20% альбумина: 75 мл/)).toBeTruthy()
    expect(screen.getByText(/Скорость для 20% альбумина: 6.25 мл\/ч/)).toBeTruthy()
    expect(screen.getByText(/добавить 75 мл/)).toBeTruthy()
    expect(screen.getByText(/Скорость разведенного раствора 20% альбумина: 12.5 мл\/ч/)).toBeTruthy()
    expect(screen.getByText(/Объем 10% альбумина: 150 мл/)).toBeTruthy()
    expect(screen.getByText(/Скорость для 10% альбумина: 12.5 мл\/ч/)).toBeTruthy()
    expect(screen.getByText('Расчет проводится на 12 часов ИПС.')).toBeTruthy()
    expect(screen.queryByText(/Перед трансфузией необходимо/)).toBeNull()
  })
})
