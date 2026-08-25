import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import EnteralNutritionPage from './enteral-nutrition'

afterEach(() => {
  cleanup()
})

describe('EnteralNutritionPage', () => {
  it('calculates RER and DER for a dog fixed coefficient need', async () => {
    const user = userEvent.setup()

    render(<EnteralNutritionPage />)

    expect(screen.getByRole('heading', { name: 'Энтеральное питание/НЭП' })).toBeTruthy()
    expect(screen.queryByLabelText('День терапии')).toBeNull()

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса, кг'), '10')
    await user.type(screen.getByLabelText('Калорийность корма, ккал/100 г'), '200')

    expect(screen.getByLabelText('Коэффициент DER')).toHaveProperty('value', '1.6')
    expect(screen.getByText(/RER: 393.6 ккал\/день/)).toBeTruthy()
    expect(screen.getByText(/Масса корма по RER: 196.8 г\/сутки/)).toBeTruthy()
    expect(screen.getByText(/DER: 629.8 ккал\/день/)).toBeTruthy()
    expect(screen.getByText(/Масса корма по DER: 314.9 г\/сутки/)).toBeTruthy()
  })

  it('shows common needs first and removes RER from need labels', async () => {
    const user = userEvent.setup()

    render(<EnteralNutritionPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')

    const options = Array.from(
      screen.getByLabelText('Потребности').querySelectorAll('option'),
      (option) => option.textContent ?? '',
    )

    expect(options.slice(1, 6)).toEqual([
      'Профилактика рефидинг синдрома (1)',
      'Госпитализированный пациент (1.3)',
      'Тяжелая травма или хирургическая операция, рак (1.25-1.5)',
      'Тяжелая инфекция или сепсис (1.5-1.7)',
      'Ожоги (1.7-2)',
    ])
    expect(options.some((label) => label.includes('RER'))).toBe(false)
    expect(screen.getByLabelText('Коэффициент DER')).toHaveProperty('value', '1.6')
  })

  it('allows selecting coefficient from a DER range', async () => {
    const user = userEvent.setup()

    render(<EnteralNutritionPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'cat')
    await user.selectOptions(screen.getByLabelText('Потребности'), 'catAdultIntact')
    await user.selectOptions(screen.getByLabelText('Коэффициент DER'), '1.5')
    await user.type(screen.getByLabelText('Масса, кг'), '4')
    await user.type(screen.getByLabelText('Калорийность корма, ккал/100 г'), '120')

    expect(screen.getByText(/RER: 282.8 ккал\/день/)).toBeTruthy()
    expect(screen.getByText(/Масса корма по RER: 235.7 г\/сутки/)).toBeTruthy()
    expect(screen.getByText(/DER: 424.3 ккал\/день/)).toBeTruthy()
    expect(screen.getByText(/Масса корма по DER: 353.6 г\/сутки/)).toBeTruthy()
  })

  it('shows refeeding fields and unsafe NEP bolus calculation', async () => {
    const user = userEvent.setup()

    render(<EnteralNutritionPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.selectOptions(screen.getByLabelText('Потребности'), 'refeedingPrevention')

    expect(screen.getByLabelText('День терапии')).toBeTruthy()
    expect(screen.getByLabelText('Тип корма')).toBeTruthy()
    expect(screen.getByLabelText('Коэффициент DER')).toHaveProperty('value', '1')

    await user.type(screen.getByLabelText('Масса, кг'), '10')
    await user.type(screen.getByLabelText('Калорийность корма, ккал/100 г'), '100')
    await user.selectOptions(screen.getByLabelText('День терапии'), 'day3')
    await user.selectOptions(screen.getByLabelText('Тип корма'), 'wet')

    expect(screen.getByText(/Масса корма на сутки: 236.2 г/)).toBeTruthy()
    expect(screen.queryByText(/Масса корма по RER:/)).toBeNull()
    expect(screen.queryByText(/Масса корма по DER:/)).toBeNull()
    expect(screen.getByText(/Объем воды для разведения смеси: 708.6 мл/)).toBeTruthy()
    expect(screen.getByText(/Расчетная скорость НЭП: 39.4 мл\/ч/)).toBeTruthy()
    expect(screen.getByText(/Скорость превышает безопасный порог \(3 мл\/кг\/ч\)\./)).toBeTruthy()
    expect(screen.getByText(/Объем докорма \(болюсы\) в сутки: 224.7 мл/)).toBeTruthy()
    expect(screen.getByText(/При кормлении каждые 4 часа \(6 раз в сутки\): 37.5 мл/)).toBeTruthy()
    expect(screen.getByText(/При кормлении каждые 6 часов \(4 раза в сутки\): 56.2 мл/)).toBeTruthy()
  })
})
