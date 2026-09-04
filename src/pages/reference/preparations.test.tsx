import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import VeterinaryPreparationsReferencePage from './preparations'

afterEach(() => {
  cleanup()
})

const renderPreparationsRoutes = (initialEntry = '/reference/preparations') => {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/reference/preparations" element={<VeterinaryPreparationsReferencePage />} />
        <Route path="/reference/preparations/:preparationId" element={<VeterinaryPreparationsReferencePage />} />
        <Route path="/reference/substances/:substanceId" element={<h1>Карточка действующего вещества</h1>} />
        <Route path="/reference" element={<h1>Справочник</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('VeterinaryPreparationsReferencePage', () => {
  it('renders four veterinary preparation cards in the reference style', () => {
    renderPreparationsRoutes()

    expect(screen.getByText('VetTools')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Ветеринарные препараты' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Назад к справочнику' }).getAttribute('href')).toBe('/reference')
    expect(screen.getByLabelText('Поиск по ветеринарным препаратам')).toBeTruthy()
    expect(screen.getByText('Найдено: 4')).toBeTruthy()

    const list = screen.getByRole('list', { name: 'Список ветеринарных препаратов' })

    expect(within(list).getByRole('link', { name: /Конафлион. Открыть карточку ветеринарного препарата/ })).toBeTruthy()
    expect(within(list).getByRole('link', { name: /Сангвения. Открыть карточку ветеринарного препарата/ })).toBeTruthy()
    expect(within(list).getByRole('link', { name: /Солвестан. Открыть карточку ветеринарного препарата/ })).toBeTruthy()
    expect(within(list).getByRole('link', { name: /КогаПЕТ. Открыть карточку ветеринарного препарата/ })).toBeTruthy()
  })

  it('opens a veterinary preparation card with the requested fields', async () => {
    const user = userEvent.setup()

    renderPreparationsRoutes()

    await user.click(screen.getByRole('link', {
      name: /Конафлион. Открыть карточку ветеринарного препарата/,
    }))

    expect(screen.getByRole('heading', { level: 1, name: 'Конафлион' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Назад к ветеринарным препаратам' }).getAttribute('href')).toBe('/reference/preparations')
    expect(screen.getByText('Действующее вещество')).toBeTruthy()
    expect(screen.getByText('Форма выпуска')).toBeTruthy()
    expect(screen.getByText('Дозировка')).toBeTruthy()
    expect(screen.getByText('Производитель')).toBeTruthy()
    expect(screen.getByText('Conaflion')).toBeTruthy()
    expect(screen.getByText(/флаконы 1, 2, 10, 20, 50, 100 мл/i)).toBeTruthy()
    expect(screen.getByText('Показания')).toBeTruthy()
    expect(screen.getByText(/Кровотечения при травмах\/операциях/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Фитоменадион' }).getAttribute('href')).toBe('/reference/substances/Vitamin_K1')
    expect(screen.getByText('Аналоги')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Сангвения' }).getAttribute('href')).toBe('/reference/preparations/sangvenia')
    expect(screen.getByRole('link', { name: 'Солвестан' }).getAttribute('href')).toBe('/reference/preparations/solvestan')
    expect(screen.getByRole('link', { name: 'КогаПЕТ' }).getAttribute('href')).toBe('/reference/preparations/kogapet')
  })

  it('filters preparations by name', async () => {
    const user = userEvent.setup()

    renderPreparationsRoutes()

    await user.type(screen.getByLabelText('Поиск по ветеринарным препаратам'), 'КогаПет')

    expect(screen.getByText('Найдено: 1')).toBeTruthy()
    expect(screen.getByText('КогаПЕТ')).toBeTruthy()
    expect(screen.queryByText('Конафлион')).toBeNull()
  })

  it('shows unavailable page for unknown preparation id', () => {
    renderPreparationsRoutes('/reference/preparations/unknown')

    expect(screen.getByRole('heading', { name: 'Ветеринарные препараты' })).toBeTruthy()
    expect(screen.getByText('Карточка ветеринарного препарата не найдена.')).toBeTruthy()
  })
})
