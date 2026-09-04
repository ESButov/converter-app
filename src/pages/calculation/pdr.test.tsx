import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import PdrPage from './pdr'

afterEach(() => {
  cleanup()
})

const renderPdrPage = () => {
  render(
    <MemoryRouter>
      <PdrPage />
    </MemoryRouter>,
  )
}

describe('PdrPage', () => {
  it('calculates feline expected parturition date by BP', async () => {
    const user = userEvent.setup()

    renderPdrPage()

    expect(screen.getByRole('heading', { name: 'Калькулятор ПДР' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Назад на главную' }).getAttribute('href')).toBe('/home')

    await user.selectOptions(screen.getByLabelText('Вид/размер животного'), 'cat')
    fireEvent.change(screen.getByLabelText('Дата УЗИ'), {
      target: {
        value: '2026-09-01',
      },
    })
    await user.type(screen.getByLabelText('Бипариетальный диаметр, мм'), '20')

    expect(screen.getByText(/Группа: Кошка/)).toBeTruthy()
    expect(screen.getByText(/Расчет: После 5 недель/)).toBeTruthy()
    expect(screen.getByText(/Дней до родов: 7.2 дн/)).toBeTruthy()
    expect(screen.getByText(/Предполагаемая дата родов: 08.09.2026/)).toBeTruthy()
    expect(screen.getByText(/Ориентировочный диапазон: 06.09.2026 - 10.09.2026/)).toBeTruthy()
  })

  it('calculates early pregnancy date by chorionic cavity', async () => {
    const user = userEvent.setup()

    renderPdrPage()

    await user.selectOptions(screen.getByLabelText('Вид/размер животного'), 'cat')
    await user.selectOptions(screen.getByLabelText('Срок беременности'), 'beforeFiveWeeks')
    fireEvent.change(screen.getByLabelText('Дата УЗИ'), {
      target: {
        value: '2026-09-01',
      },
    })
    await user.type(screen.getByLabelText('Внутренний диаметр хориальной полости, мм'), '30')

    expect(screen.getByText(/Расчет: До 5 недель/)).toBeTruthy()
    expect(screen.getByText(/Показатель: ВДХП 30 мм/)).toBeTruthy()
    expect(screen.getByText(/Предполагаемая дата родов: 30.09.2026/)).toBeTruthy()
  })

  it('uses Maine Coon and miniature dog groups', async () => {
    const user = userEvent.setup()

    renderPdrPage()

    await user.selectOptions(screen.getByLabelText('Вид/размер животного'), 'catMaineCoon')
    fireEvent.change(screen.getByLabelText('Дата УЗИ'), {
      target: {
        value: '2026-09-01',
      },
    })
    await user.type(screen.getByLabelText('Бипариетальный диаметр, мм'), '20')

    expect(screen.getByText(/Группа: Кошка, мейн-кун/)).toBeTruthy()
    expect(screen.getByText(/Предполагаемая дата родов: 13.09.2026/)).toBeTruthy()

    await user.selectOptions(screen.getByLabelText('Вид/размер животного'), 'dogToy')

    expect(screen.getByText(/Группа: Собака карликовая, до 5 кг/)).toBeTruthy()
    expect(screen.getByText(/Предполагаемая дата родов: 08.09.2026/)).toBeTruthy()
  })

  it('calculates large dog date by BP', async () => {
    const user = userEvent.setup()

    renderPdrPage()

    await user.selectOptions(screen.getByLabelText('Вид/размер животного'), 'dogLarge')
    fireEvent.change(screen.getByLabelText('Дата УЗИ'), {
      target: {
        value: '2026-09-01',
      },
    })
    await user.type(screen.getByLabelText('Бипариетальный диаметр, мм'), '24')

    expect(screen.getByText(/Группа: Собака крупная, 26-40 кг/)).toBeTruthy()
    expect(screen.getByText(/Формула: \(30 - БПДмм\) \/ 0.8/)).toBeTruthy()
    expect(screen.getByText(/Предполагаемая дата родов: 09.09.2026/)).toBeTruthy()
  })

  it('calculates giant dog date by BP', async () => {
    const user = userEvent.setup()

    renderPdrPage()

    await user.selectOptions(screen.getByLabelText('Вид/размер животного'), 'dogGiant')
    fireEvent.change(screen.getByLabelText('Дата УЗИ'), {
      target: {
        value: '2026-09-01',
      },
    })
    await user.type(screen.getByLabelText('Бипариетальный диаметр, мм'), '24')

    expect(screen.getByText(/Группа: Собака гигантская, более 40 кг/)).toBeTruthy()
    expect(screen.getByText(/Формула: \(29 - БПДмм\) \/ 0.7/)).toBeTruthy()
    expect(screen.getByText(/Предполагаемая дата родов: 08.09.2026/)).toBeTruthy()
  })

  it('warns when BP calculation is outside the recommended period', async () => {
    const user = userEvent.setup()

    renderPdrPage()

    await user.selectOptions(screen.getByLabelText('Вид/размер животного'), 'dogSmall')
    fireEvent.change(screen.getByLabelText('Дата УЗИ'), {
      target: {
        value: '2026-09-01',
      },
    })
    await user.type(screen.getByLabelText('Бипариетальный диаметр, мм'), '26')

    expect(screen.getByRole('alert').textContent).toContain(
      'Значение вне рекомендованного периода применения выбранного показателя',
    )
  })
})
