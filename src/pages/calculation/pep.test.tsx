import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import PepPage from './pep'

afterEach(() => {
  cleanup()
})

describe('PepPage', () => {
  it('renders compact parameter/value inputs and calculates the more than 2 kg protocol', async () => {
    const user = userEvent.setup()

    render(<PepPage />)

    expect(screen.getByRole('heading', { name: 'Расчет ПЭП' })).toBeTruthy()
    expect(screen.getByLabelText('Вид животного')).toHaveProperty('value', '')
    expect(screen.getByLabelText('Коэффициент энергии k')).toHaveProperty('value', '1.2')
    expect(screen.getByLabelText('ПЭП от потребности, %')).toHaveProperty('value', '25')

    const energyHelpButton = screen.getByRole('button', { name: 'Показать подсказку: Пациент и энергия' })

    await user.click(energyHelpButton)

    const energyHelp = screen.getByRole('dialog', { name: 'Пациент и энергия' })

    expect(energyHelp.textContent).toContain('BER/RER до 2 кг = 30 × BW + 70.')
    expect(energyHelp.textContent).toContain('BER/RER более 2 кг = 70 × BW^0.75.')

    await user.click(energyHelpButton)

    expect(screen.queryByRole('dialog', { name: 'Пациент и энергия' })).toBeNull()

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса, кг'), '4.7')

    const composition = screen.getByLabelText('Состав ПЭП')

    expect(within(composition).getByText('Аминокислоты 10%')).toBeTruthy()
    expect(within(composition).getByText('40.22 мл')).toBeTruthy()
    expect(within(composition).getByText('20.11 мл')).toBeTruthy()
    expect(within(composition).getByText('49.29 мл')).toBeTruthy()
    expect(within(composition).getByText('16.76 мл')).toBeTruthy()
    expect(within(composition).getByText('106.27 мл')).toBeTruthy()
    expect(screen.getByText(/Режим: более 2 кг/)).toBeTruthy()
    expect(screen.getByText(/BER\/RER: 223.45 ккал\/сут/)).toBeTruthy()
    expect(screen.getByText(/Скорость ПЭП: 4.43 мл\/ч/)).toBeTruthy()
    expect(screen.getByText(/Ввести еще жидкости, кроме ПЭП: 104.73 мл\/сут/)).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Показать подсказку: Состав и скорость' }))

    expect(screen.getByRole('dialog', { name: 'Состав и скорость' }).textContent).toContain(
      'Скорость введения ПЭП = объем растворов ПЭП / 24.',
    )
  })

  it('switches to the up to 2 kg protocol and shows species-specific protein hints', async () => {
    const user = userEvent.setup()

    render(<PepPage />)

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'cat')
    await user.type(screen.getByLabelText('Масса, кг'), '1.6')

    const helpButton = screen.getByRole('button', { name: 'Показать подсказку по белку' })

    expect(screen.queryByRole('dialog', { name: 'Подсказка по белку' })).toBeNull()

    await user.click(helpButton)

    expect(screen.getByText('Белок: кошка 3-6-6 г/100 ккал.')).toBeTruthy()
    expect(helpButton.getAttribute('aria-expanded')).toBe('true')

    await user.click(helpButton)

    expect(screen.queryByRole('dialog', { name: 'Подсказка по белку' })).toBeNull()
    expect(helpButton.getAttribute('aria-expanded')).toBe('false')

    await user.click(helpButton)
    await user.click(screen.getByRole('heading', { name: 'Расчет ПЭП' }))

    expect(screen.queryByRole('dialog', { name: 'Подсказка по белку' })).toBeNull()
    expect(screen.getByText(/Режим: до 2 кг/)).toBeTruthy()
    expect(screen.getByText(/BER\/RER: 118 ккал\/сут/)).toBeTruthy()
  })

  it('warns when energy and fluid inputs are outside workbook comments', async () => {
    const user = userEvent.setup()

    render(<PepPage />)

    await user.type(screen.getByLabelText('Масса, кг'), '4')
    await user.clear(screen.getByLabelText('Коэффициент энергии k'))
    await user.type(screen.getByLabelText('Коэффициент энергии k'), '1.5')
    await user.clear(screen.getByLabelText('ПЭП от потребности, %'))
    await user.type(screen.getByLabelText('ПЭП от потребности, %'), '120')
    await user.clear(screen.getByLabelText('Дегидратация, %'))
    await user.type(screen.getByLabelText('Дегидратация, %'), '6')

    const alert = screen.getByRole('alert')

    expect(alert.textContent).toContain('Коэффициент энергии обычно 1.0-1.2.')
    expect(alert.textContent).toContain('% ПЭП обычно 25-100%.')
    expect(alert.textContent).toContain('При гиповолемии ПЭП нельзя.')
  })
})
