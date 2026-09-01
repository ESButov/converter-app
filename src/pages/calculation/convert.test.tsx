import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import ConvertPage from './convert'

afterEach(() => {
  cleanup()
})

describe('ConvertPage', () => {
  it('converts mass by default', async () => {
    const user = userEvent.setup()

    render(<ConvertPage />)

    expect(screen.getByRole('heading', { name: 'Конвертер едениц измерения' })).toBeTruthy()

    await user.type(screen.getByLabelText('Значение'), '2.5')

    expect(screen.getByText('Масса: 2.5 кг = 2500 г')).toBeTruthy()
  })

  it('converts blood glucose from conventional to SI units', async () => {
    const user = userEvent.setup()

    render(<ConvertPage />)

    await user.selectOptions(screen.getByLabelText('Раздел'), 'biochemistry')
    await user.selectOptions(screen.getByLabelText('Показатель'), 'blood_glucose')
    await user.type(screen.getByLabelText('Значение'), '100')

    expect(screen.getByText('Глюкоза крови: 100 мг/дл = 5.55 ммоль/л')).toBeTruthy()
  })

  it('converts KCl percent to mEq per ml', async () => {
    const user = userEvent.setup()

    render(<ConvertPage />)

    await user.selectOptions(screen.getByLabelText('Раздел'), 'concentrations')
    await user.selectOptions(screen.getByLabelText('Показатель'), 'kcl')
    await user.type(screen.getByLabelText('Значение'), '4')

    expect(screen.getByText('KCl: 4 % = 0.5366 mEq/мл')).toBeTruthy()
  })

  it('keeps excluded metrics out and shows urine protein creatinine ratio in Russian', async () => {
    render(<ConvertPage />)

    expect(screen.queryByText('Длина')).toBeNull()
    expect(screen.queryByText('Давление')).toBeNull()
    expect(screen.queryByText('Т3')).toBeNull()

    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText('Раздел'), 'hormones')

    expect(screen.getByText('Соотношение белок/креатинин в моче')).toBeTruthy()
  })
})
