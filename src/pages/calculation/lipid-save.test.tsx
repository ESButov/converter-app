import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import LipidSavePage from './lipid-save'

afterEach(() => {
  cleanup()
})

describe('LipidSavePage', () => {
  it('renders the lipid rescue protocol values from patient weight', async () => {
    const user = userEvent.setup()

    render(<LipidSavePage />)

    await user.type(screen.getByLabelText('Масса (кг)'), '10')

    expect(await screen.findByText(/Болюс 15\.00 мл/)).toBeTruthy()
    expect(screen.getByText(/начинаем со скорости 150\.00 мл\/ч/)).toBeTruthy()
    expect(screen.getByText(/максимальный подъем скорости до 300\.00 мл\/ч/)).toBeTruthy()
    expect(screen.getByText(/100\.00 - 200\.00 мл/)).toBeTruthy()
  })
})
