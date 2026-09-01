import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import PdrPage from './pdr'

afterEach(() => {
  cleanup()
})

describe('PdrPage', () => {
  it('calculates feline expected parturition date by BP', async () => {
    const user = userEvent.setup()

    render(<PdrPage />)

    expect(screen.getByRole('heading', { name: 'Калькулятор ПДР' })).toBeTruthy()

    await user.selectOptions(screen.getByLabelText('Вид/размер животного'), 'cat')
    fireEvent.change(screen.getByLabelText('Дата УЗИ'), {
      target: {
        value: '2026-09-01',
      },
    })
    await user.type(screen.getByLabelText('Средний BP / БПД, мм'), '20')

    expect(screen.getByText(/Группа: Кошка/)).toBeTruthy()
    expect(screen.getByText(/Дней до родов: 7.2 дн/)).toBeTruthy()
    expect(screen.getByText(/Предполагаемая дата родов: 08.09.2026/)).toBeTruthy()
    expect(screen.getByText(/Ориентировочный диапазон: 06.09.2026 - 10.09.2026/)).toBeTruthy()
  })

  it('calculates large dog date by BP', async () => {
    const user = userEvent.setup()

    render(<PdrPage />)

    await user.selectOptions(screen.getByLabelText('Вид/размер животного'), 'dogLarge')
    fireEvent.change(screen.getByLabelText('Дата УЗИ'), {
      target: {
        value: '2026-09-01',
      },
    })
    await user.type(screen.getByLabelText('Средний BP / БПД, мм'), '24')

    expect(screen.getByText(/Группа: Собака крупная, 26-40 кг/)).toBeTruthy()
    expect(screen.getByText(/Формула: \(30 - BPмм\) \/ 0.8/)).toBeTruthy()
    expect(screen.getByText(/Предполагаемая дата родов: 09.09.2026/)).toBeTruthy()
  })

  it('calculates giant dog date by BP', async () => {
    const user = userEvent.setup()

    render(<PdrPage />)

    await user.selectOptions(screen.getByLabelText('Вид/размер животного'), 'dogGiant')
    fireEvent.change(screen.getByLabelText('Дата УЗИ'), {
      target: {
        value: '2026-09-01',
      },
    })
    await user.type(screen.getByLabelText('Средний BP / БПД, мм'), '24')

    expect(screen.getByText(/Группа: Собака гигантская, более 40 кг/)).toBeTruthy()
    expect(screen.getByText(/Формула: \(29 - BPмм\) \/ 0.7/)).toBeTruthy()
    expect(screen.getByText(/Предполагаемая дата родов: 08.09.2026/)).toBeTruthy()
  })

  it('warns when BP calculation is outside the recommended period', async () => {
    const user = userEvent.setup()

    render(<PdrPage />)

    await user.selectOptions(screen.getByLabelText('Вид/размер животного'), 'dogSmall')
    fireEvent.change(screen.getByLabelText('Дата УЗИ'), {
      target: {
        value: '2026-09-01',
      },
    })
    await user.type(screen.getByLabelText('Средний BP / БПД, мм'), '26')

    expect(screen.getByRole('alert').textContent).toContain(
      'Значение вне рекомендованного периода применения BP',
    )
  })
})
