import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import FlkPage from './flk'

afterEach(() => {
  cleanup()
})

describe('FlkPage', () => {
  it('calculates FLK composition and does not render weight converter', async () => {
    const user = userEvent.setup()

    render(<FlkPage />)

    expect(screen.getByRole('heading', { name: 'Расчет FLK' })).toBeTruthy()
    expect(screen.queryByText(/Конвертер веса/)).toBeNull()
    expect(screen.getByLabelText('Вид животного')).toHaveProperty('value', '')
    expect(screen.getByLabelText('Время ИПС, часы')).toHaveProperty('value', '3')
    expect(screen.getByLabelText('Время ИПС, минуты')).toHaveProperty('value', '0')
    expect(screen.getByLabelText('Размер шприца, мл')).toHaveProperty('step', '1')
    expect(screen.getByLabelText('Фентанил, мкг/кг/мин')).toHaveProperty('step', '0.01')
    expect(screen.getByLabelText('Лидокаин, мкг/кг/мин')).toHaveProperty('step', '1')
    expect(screen.getByLabelText('Кетамин, мкг/кг/мин')).toHaveProperty('step', '1')

    await user.type(screen.getByLabelText('Масса пациента, кг'), '34.5')

    expect(screen.getByText('Фентанил')).toBeTruthy()
    expect(screen.getByText('0.124 мг')).toBeTruthy()
    expect(screen.getByText('2.48 мл')).toBeTruthy()
    expect(screen.getByText('5.28 мл')).toBeTruthy()
    expect(screen.getByText('0.62 мл')).toBeTruthy()
    expect(screen.getByText(/Общий объем препаратов в растворе: 8.38 мл/)).toBeTruthy()
    expect(screen.getByText(/Добавить физ. раствор: 11.62 мл/)).toBeTruthy()
    expect(screen.getByText(/Конечная скорость подачи: 6.67 мл\/ч/)).toBeTruthy()
  })

  it('shows dose hints for the selected species', async () => {
    const user = userEvent.setup()

    render(<FlkPage />)

    expect(screen.getAllByText('Выберите вид животного, чтобы увидеть подсказку по дозе.')).toHaveLength(3)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')

    expect(screen.getByText('Собака: 1.2-4.8 мг/кг/ч (20-80 мкг/кг/мин)')).toBeTruthy()
    expect(screen.getByText(/Лидокаин: 1\.2-4\.8 мг\/кг\/ч \(20-80 мкг\/кг\/мин\)/)).toBeTruthy()

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'cat')

    expect(screen.getByText('Кошка: 0.6-1.8 мг/кг/ч (10-30 мкг/кг/мин)')).toBeTruthy()
    expect(screen.getByText(/Лидокаин: 0\.6-1\.8 мг\/кг\/ч \(10-30 мкг\/кг\/мин\)/)).toBeTruthy()
  })

  it('changes lidocaine volume by selected concentration', async () => {
    const user = userEvent.setup()

    render(<FlkPage />)

    await user.type(screen.getByLabelText('Масса пациента, кг'), '34.5')
    await user.selectOptions(screen.getByLabelText('Концентрация лидокаина'), '100')

    expect(screen.getByLabelText('Концентрация лидокаина')).toHaveProperty('value', '100')
    expect(screen.getByText('1.06 мл')).toBeTruthy()
    expect(screen.getByText(/Общий объем препаратов в растворе: 4.16 мл/)).toBeTruthy()
    expect(screen.getByText(/Добавить физ. раствор: 15.84 мл/)).toBeTruthy()
  })

  it('warns when syringe volume is smaller than drug volume', async () => {
    const user = userEvent.setup()

    render(<FlkPage />)

    await user.type(screen.getByLabelText('Масса пациента, кг'), '34.5')
    await user.clear(screen.getByLabelText('Размер шприца, мл'))
    await user.type(screen.getByLabelText('Размер шприца, мл'), '5')

    expect(screen.getByText(/не хватает 3.38 мл/)).toBeTruthy()
    expect(screen.getByRole('alert', { name: '' })).toBeTruthy()
    expect(screen.getByText('Взять шприц большего объема или сократить длительность ИПС.')).toBeTruthy()
  })
})
