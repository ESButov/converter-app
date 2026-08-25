import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import GlucosePage from './glucose'

afterEach(() => {
  cleanup()
})

describe('GlucosePage', () => {
  it('shows dilution result after volume and target concentration are filled', async () => {
    const user = userEvent.setup()

    render(<GlucosePage />)

    expect(screen.getByRole('heading', { name: 'Приготовление раствора глюкозы' })).toBeTruthy()
    expect(screen.queryByText(/Для приготовления/)).toBeNull()

    await user.type(screen.getByLabelText('Необходимое количество раствора (мл)'), '100')
    await user.selectOptions(screen.getByLabelText('Необходимая концентрация раствора (%)'), '10')

    expect(
      screen.getByText(
        'Для приготовления 100 мл 10% раствора необходимо смешать 14.3 мл 40% глюкозы и 85.7 мл 5% глюкозы',
      ),
    ).toBeTruthy()
  })

  it('limits volume input to one decimal place', async () => {
    const user = userEvent.setup()

    render(<GlucosePage />)

    await user.type(screen.getByLabelText('Необходимое количество раствора (мл)'), '12.34')

    const volumeInput = screen.getByLabelText('Необходимое количество раствора (мл)') as HTMLInputElement

    expect(volumeInput.value).toBe('12.3')
  })
})
