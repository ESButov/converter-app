import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import EcgPage from './ecg'

afterEach(() => {
  cleanup()
})

const renderEcgPage = () => {
  render(
    <MemoryRouter>
      <EcgPage />
    </MemoryRouter>,
  )
}

describe('EcgPage', () => {
  it('calculates ECG values from mm with default calibration', async () => {
    const user = userEvent.setup()

    renderEcgPage()

    expect(screen.getByRole('heading', { name: 'ЭКГ' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Назад на главную' }).getAttribute('href')).toBe('/home')
    expect(screen.getByLabelText('Скорость, мм/с')).toHaveProperty('value', '50')
    expect(screen.getByLabelText('Вольтаж, мм/1 мВ')).toHaveProperty('value', '10')
    expect(Array.from(
      screen.getByLabelText('Скорость, мм/с').querySelectorAll('option'),
      (option) => option.value,
    )).toEqual(['', '25', '50', '75', '100'])
    expect(Array.from(
      screen.getByLabelText('Вольтаж, мм/1 мВ').querySelectorAll('option'),
      (option) => option.value,
    )).toEqual(['', '5', '10', '20'])

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('R-R, мм'), '20')
    await user.type(screen.getByLabelText('P ширина, мм'), '2')
    await user.type(screen.getByLabelText('P высота, мм'), '2')
    await user.type(screen.getByLabelText('QRS, мм'), '3')
    await user.type(screen.getByLabelText('Q, мм'), '2')
    await user.type(screen.getByLabelText('R, мм'), '21')
    await user.type(screen.getByLabelText('QT, мм'), '11')
    await user.type(screen.getByLabelText('ST, мм'), '1')
    await user.type(screen.getByLabelText('T, мм'), '2')

    expect(screen.getByText(/ЧСС: 150 уд\/мин/)).toBeTruthy()
    expect(screen.getByText(/P: 40 мс \/ 0.2 мВ/)).toBeTruthy()
    expect(screen.getByText(/QRS: 60 мс/)).toBeTruthy()
    expect(screen.getByText(/Q: 0.2 мВ/)).toBeTruthy()
    expect(screen.getByText(/R: 2.1 мВ/)).toBeTruthy()
    expect(screen.getByText(/QT: 220 мс/)).toBeTruthy()
    expect(screen.getByText(/ST: 0.1 мВ/)).toBeTruthy()
    expect(screen.getByText(/T: 0.2 мВ/)).toBeTruthy()
    expect(screen.getByText(/Заключение:/)).toBeTruthy()
  })

  it('uses selected calibration beside fields and standard calibration in conclusion', async () => {
    const user = userEvent.setup()

    renderEcgPage()

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'cat')
    await user.selectOptions(screen.getByLabelText('Скорость, мм/с'), '25')
    await user.selectOptions(screen.getByLabelText('Вольтаж, мм/1 мВ'), '20')
    await user.type(screen.getByLabelText('P ширина, мм'), '2')
    await user.type(screen.getByLabelText('R, мм'), '21')

    expect(screen.getByText(/^80 мс$/)).toBeTruthy()
    expect(screen.getByText(/^1.05 мВ$/)).toBeTruthy()
    expect(screen.getByText(/P: 80 мс/)).toBeTruthy()
    expect(screen.getByText(/R: 1.05 мВ/)).toBeTruthy()
    expect(screen.queryByText(/P: 40 мс/)).toBeNull()
    expect(screen.queryByText(/R: 2.1 мВ/)).toBeNull()
  })
})
