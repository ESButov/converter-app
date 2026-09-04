import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import ActiveSubstancesReferencePage from './substances'

afterEach(() => {
  cleanup()
})

const renderSubstancesRoutes = (initialEntry = '/reference/substances') => {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/reference/substances" element={<ActiveSubstancesReferencePage />} />
        <Route path="/reference/substances/:substanceId" element={<ActiveSubstancesReferencePage />} />
        <Route path="/reference/preparations/:preparationId" element={<h1>Карточка препарата</h1>} />
        <Route path="/reference" element={<h1>Справочник</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ActiveSubstancesReferencePage', () => {
  it('renders the active substances list in the reference style', () => {
    renderSubstancesRoutes()

    expect(screen.getByText('VetTools')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Действующие вещества' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Назад к справочнику' }).getAttribute('href')).toBe('/reference')
    expect(screen.getByLabelText('Поиск по действующему веществу')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Фильтр по фармакологической группе' })).toBeTruthy()
    expect(screen.getByText('Найдено: 1 · группа: все')).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Основная навигация' })).toBeTruthy()
  })

  it('shows russian and english names with the main pharmacological group', () => {
    renderSubstancesRoutes()

    const list = screen.getByRole('list', { name: 'Список действующих веществ' })
    const card = within(list).getByRole('link', {
      name: /Витамин K1 \/ фитоменадион. Открыть карточку действующего вещества/,
    })

    expect(within(card).getByText('Витамин K1 / фитоменадион / Vitamin K1')).toBeTruthy()
    expect(within(card).getByText('Витамин; антигеморрагическое средство')).toBeTruthy()
  })

  it('filters by active substance name', async () => {
    const user = userEvent.setup()

    renderSubstancesRoutes()

    await user.type(screen.getByLabelText('Поиск по действующему веществу'), 'фитоменадион')

    expect(screen.getByText('Найдено: 1 · группа: все')).toBeTruthy()
    expect(screen.getByText('Витамин K1 / фитоменадион / Vitamin K1')).toBeTruthy()

    await user.clear(screen.getByLabelText('Поиск по действующему веществу'))
    await user.clear(screen.getByLabelText('Поиск по действующему веществу'))
    await user.type(screen.getByLabelText('Поиск по действующему веществу'), 'Конафлион')

    expect(screen.getByText('Найдено: 1 · группа: все')).toBeTruthy()
    expect(screen.getByText('Витамин K1 / фитоменадион / Vitamin K1')).toBeTruthy()

    await user.clear(screen.getByLabelText('Поиск по действующему веществу'))
    await user.type(screen.getByLabelText('Поиск по действующему веществу'), 'несуществующее вещество')

    expect(screen.getByText('Найдено: 0 · группа: все')).toBeTruthy()
    expect(screen.getByText('Ничего не найдено')).toBeTruthy()
  })

  it('filters by pharmacological group', async () => {
    const user = userEvent.setup()

    renderSubstancesRoutes()

    await user.click(screen.getByRole('button', { name: 'Фильтр по фармакологической группе' }))
    await user.click(screen.getByRole('menuitemradio', { name: 'Витамин; антигеморрагическое средство' }))

    expect(screen.getByText('Найдено: 1 · группа: Витамин; антигеморрагическое средство')).toBeTruthy()
    expect(screen.getByText('Витамин K1 / фитоменадион / Vitamin K1')).toBeTruthy()
  })

  it('opens active substance card as a separate page', async () => {
    const user = userEvent.setup()

    renderSubstancesRoutes()

    await user.click(screen.getByRole('link', {
      name: /Витамин K1 \/ фитоменадион. Открыть карточку действующего вещества/,
    }))

    expect(screen.getByRole('heading', { level: 1, name: 'Витамин K1 / фитоменадион' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Назад к действующим веществам' }).getAttribute('href')).toBe('/reference/substances')
    expect(screen.getByText('Фармакологическое действие')).toBeTruthy()
    expect(screen.getByText('Использование')).toBeTruthy()
    expect(screen.getByText('Дозировки и пути введения по видам животных')).toBeTruthy()
    expect(screen.getAllByText('Собаки и кошки')).toHaveLength(1)
    expect(screen.getByText('Важные взаимодействия')).toBeTruthy()
    expect(screen.queryByText('Дополнительная информация')).toBeNull()
  })

  it('shows trade names before substance details and opens a preparation card', async () => {
    const user = userEvent.setup()

    renderSubstancesRoutes('/reference/substances/Vitamin_K1')

    expect(screen.queryByText('Торговые названия')).toBeNull()
    const tradeNamesBlock = screen.getByLabelText('Торговые названия')
    const konaflionLink = within(tradeNamesBlock).getByRole('link', { name: 'Конафлион' })

    expect(within(tradeNamesBlock).queryByRole('list')).toBeNull()
    expect(tradeNamesBlock.textContent).toBe('Конафлион, Сангвения, Солвестан, КогаПЕТ')
    expect(konaflionLink.getAttribute('href')).toBe('/reference/preparations/konaflion')
    expect(konaflionLink.className).not.toContain('app-toxic-calculator-link')
    expect(screen.getByRole('link', { name: 'Сангвения' }).getAttribute('href')).toBe('/reference/preparations/sangvenia')
    expect(screen.getByRole('link', { name: 'Солвестан' }).getAttribute('href')).toBe('/reference/preparations/solvestan')
    expect(screen.getByRole('link', { name: 'КогаПЕТ' }).getAttribute('href')).toBe('/reference/preparations/kogapet')

    await user.click(konaflionLink)

    expect(screen.getByRole('heading', { name: 'Карточка препарата' })).toBeTruthy()
  })

  it('shows unavailable page for unknown active substance id', () => {
    renderSubstancesRoutes('/reference/substances/unknown')

    expect(screen.getByRole('heading', { name: 'Действующие вещества' })).toBeTruthy()
    expect(screen.getByText('Карточка действующего вещества не найдена.')).toBeTruthy()
  })
})
