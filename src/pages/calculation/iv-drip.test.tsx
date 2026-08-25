import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import IvDripPage from './iv-drip'

afterEach(() => {
  cleanup()
})

describe('IvDripPage', () => {
  it('calculates drip tempo from volume and infusion time', async () => {
    const user = userEvent.setup()

    render(<IvDripPage />)

    expect(screen.getByRole('heading', { name: 'Расчет капельного введения' })).toBeTruthy()
    expect(screen.queryByText('Макрокапельница (стандарт 20)')).toBeNull()

    await user.type(screen.getByLabelText('Общий объем, мл'), '500')
    await user.type(screen.getByLabelText('Время инфузии, часы'), '4')

    const visualization = screen.getByLabelText('Визуализация капельного введения')
    const pumpText = screen.getByText(/Инфузомат: 125 мл\/ч/)

    expect(visualization.compareDocumentPosition(pumpText)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(screen.getByText('42 кап/мин · 1.4 сек/капля')).toBeTruthy()
  })

  it('shows and hides drop factor help by question button or outside click', async () => {
    const user = userEvent.setup()

    render(<IvDripPage />)

    const helpButton = screen.getByRole('button', { name: 'Показать справку по Drop Factor' })

    expect(screen.queryByRole('dialog', { name: 'Справка по Drop Factor' })).toBeNull()

    await user.click(helpButton)

    expect(screen.getByRole('dialog', { name: 'Справка по Drop Factor' })).toBeTruthy()
    expect(screen.getByText('Макрокапельница (стандарт 20)')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Закрыть справку по Drop Factor' })).toBeNull()
    expect(helpButton.getAttribute('aria-expanded')).toBe('true')

    await user.click(helpButton)

    expect(screen.queryByRole('dialog', { name: 'Справка по Drop Factor' })).toBeNull()
    expect(helpButton.getAttribute('aria-expanded')).toBe('false')

    await user.click(helpButton)

    expect(screen.getByRole('dialog', { name: 'Справка по Drop Factor' })).toBeTruthy()

    await user.click(screen.getByRole('heading', { name: 'Расчет капельного введения' }))

    expect(screen.queryByRole('dialog', { name: 'Справка по Drop Factor' })).toBeNull()
  })

  it('calculates infusion time when speed is filled and time is empty', async () => {
    const user = userEvent.setup()

    render(<IvDripPage />)

    await user.type(screen.getByLabelText('Общий объем, мл'), '500')
    await user.type(screen.getByLabelText('Скорость инфузии'), '40')
    await user.selectOptions(screen.getByLabelText('Единица скорости'), 'dropsPerMinute')

    expect(screen.getByText('40 кап/мин · 1.5 сек/капля')).toBeTruthy()
    expect(screen.getByText(/Время: 4 ч 10 мин/)).toBeTruthy()
  })
})
