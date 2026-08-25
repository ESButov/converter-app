import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import {
  CalculatorForm,
  CalculatorNumberField,
  CalculatorPanel,
  CalculatorSelectField,
} from './CalculatorForm'

afterEach(() => {
  cleanup()
})

describe('CalculatorForm UI primitives', () => {
  it('renders the shared calculator layout with accessible fields', () => {
    render(
      <CalculatorForm title="Тестовый калькулятор">
        <CalculatorSelectField
          label="Вид животного"
          options={[
            { label: 'Кошка', value: 'cat' },
            { label: 'Собака', value: 'dog' },
          ]}
          value=""
          onChange={() => undefined}
        />
        <CalculatorNumberField
          label="Масса (кг)"
          min="0"
          step="0.001"
          value=""
          onChange={() => undefined}
        />
        <CalculatorPanel>Текст подсказки</CalculatorPanel>
      </CalculatorForm>,
    )

    expect(screen.getByRole('heading', { name: 'Тестовый калькулятор' })).toBeTruthy()
    expect(screen.getByLabelText('Вид животного')).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Кошка' })).toBeTruthy()
    expect(screen.getByLabelText('Масса (кг)').getAttribute('type')).toBe('number')
    expect(screen.getByText('Текст подсказки')).toBeTruthy()
  })
})
