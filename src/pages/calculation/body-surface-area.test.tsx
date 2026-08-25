import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import BodySurfaceAreaPage from './body-surface-area'

afterEach(() => {
  cleanup()
})

describe('BodySurfaceAreaPage', () => {
  it('renders species and weight fields and shows result after valid input', async () => {
    const user = userEvent.setup()

    render(<BodySurfaceAreaPage />)

    expect(screen.getByRole('heading', { name: 'Расчет площади тела' })).toBeTruthy()
    expect(screen.queryByText(/Площадь тела:/)).toBeNull()

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса (кг)'), '10')

    expect(screen.getByText('Площадь тела: 0.469 м^2')).toBeTruthy()
  })

  it('limits weight input to three decimal places', async () => {
    const user = userEvent.setup()

    render(<BodySurfaceAreaPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'cat')
    await user.type(screen.getByLabelText('Масса (кг)'), '1.2345')

    const weightInput = screen.getByLabelText('Масса (кг)') as HTMLInputElement

    expect(weightInput.value).toBe('1.234')
    expect(screen.getByText('Площадь тела: 0.115 м^2')).toBeTruthy()
  })
})
