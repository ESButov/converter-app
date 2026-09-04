import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import ToxicologyReferencePage from './toxic'

afterEach(() => {
  cleanup()
})

const renderToxicologyRoutes = (initialEntry = '/reference/toxic') => {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/reference/toxic" element={<ToxicologyReferencePage />} />
        <Route path="/reference/toxic/:itemId" element={<ToxicologyReferencePage />} />
        <Route path="/reference" element={<h1>Справочник</h1>} />
        <Route path="/calculation/lipid-save" element={<h1>Протокол Липидного спасения</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ToxicologyReferencePage', () => {
  it('renders the toxicology reference search list in the home page style', () => {
    renderToxicologyRoutes()

    expect(screen.getByText('VetTools')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Токсикология' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Назад к справочнику' }).getAttribute('href')).toBe('/reference')
    expect(screen.getByLabelText('Поиск по справочнику токсикологии')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Фильтр/ })).toBeTruthy()
    expect(screen.getByText('Найдено: 11 · фильтр: токсин')).toBeTruthy()
    expect(screen.getByRole('list', { name: 'Список ядов и токсинов' })).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Основная навигация' })).toBeTruthy()
  })

  it('shows toxin group under each list item title', () => {
    renderToxicologyRoutes()

    const list = screen.getByRole('list', { name: 'Список ядов и токсинов' })
    const firstCard = within(list).getByRole('link', {
      name: /Парацетамол. Открыть карточку яда/,
    })

    expect(within(firstCard).getByText('Парацетамол')).toBeTruthy()
    expect(within(firstCard).getByText('Анальгетики и жаропонижающие')).toBeTruthy()
  })

  it('filters items by toxin name in the default mode', async () => {
    const user = userEvent.setup()

    renderToxicologyRoutes()

    await user.type(screen.getByLabelText('Поиск по справочнику токсикологии'), 'парацетамол')

    const list = screen.getByRole('list', { name: 'Список ядов и токсинов' })

    expect(within(list).getByText('Парацетамол')).toBeTruthy()
    expect(screen.queryByText('Опиоиды')).toBeNull()
    expect(screen.getByText('Найдено: 1 · фильтр: токсин')).toBeTruthy()
  })

  it('switches filtering to clinical signs', async () => {
    const user = userEvent.setup()

    renderToxicologyRoutes()

    await user.click(screen.getByRole('button', { name: /Фильтр/ }))
    await user.click(screen.getByRole('menuitemradio', { name: 'По клинической симптоматике' }))
    await user.type(screen.getByLabelText('Поиск по справочнику токсикологии'), 'судороги')

    expect(screen.getByText('Найдено: 4 · фильтр: симптоматика')).toBeTruthy()
    expect(screen.getByText('Лидокаин')).toBeTruthy()
    expect(screen.queryByText('Антикоагулянтные родентициды')).toBeNull()
  })

  it('switches filtering to laboratory changes', async () => {
    const user = userEvent.setup()

    renderToxicologyRoutes()

    await user.click(screen.getByRole('button', { name: /Фильтр/ }))
    await user.click(screen.getByRole('menuitemradio', { name: 'По лабораторным изменениям' }))
    await user.type(screen.getByLabelText('Поиск по справочнику токсикологии'), 'нейтропения')

    expect(screen.getByText('Найдено: 1 · фильтр: лаборатория')).toBeTruthy()
    expect(screen.getByText('5-фторурацил')).toBeTruthy()
    expect(screen.queryByText('Парацетамол')).toBeNull()
  })

  it('opens a first-list poison card as a separate page', async () => {
    const user = userEvent.setup()

    renderToxicologyRoutes()

    await user.click(screen.getByRole('link', {
      name: /Парацетамол. Открыть карточку яда/,
    }))

    expect(screen.getByRole('heading', { level: 1, name: 'Парацетамол' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Назад ко всем ядам' }).getAttribute('href')).toBe('/reference/toxic')
    expect(screen.getByText('Клиническая симптоматика')).toBeTruthy()
    expect(screen.getByText('Токсические дозы для разных видов животных')).toBeTruthy()
    expect(screen.getByText('Принципы терапии')).toBeTruthy()
  })

  it('opens local anesthetic toxicity card with lipid rescue calculator link', async () => {
    const user = userEvent.setup()

    renderToxicologyRoutes()

    await user.type(screen.getByLabelText('Поиск по справочнику токсикологии'), 'лидокаин')
    await user.click(screen.getByRole('link', {
      name: /Лидокаин. Открыть карточку яда/,
    }))

    expect(screen.getByRole('heading', { level: 1, name: 'Лидокаин' })).toBeTruthy()
    expect(screen.getByText('Местные анестетики')).toBeTruthy()

    const antidoteSection = screen
      .getByText('Дозы антидотов для разных видов животных')
      .closest('section')
    expect(antidoteSection).not.toBeNull()
    expect(within(antidoteSection as HTMLElement).getAllByText(/Липидная эмульсия 20%: болюс/)).toHaveLength(2)

    const lipidRescueLink = within(antidoteSection as HTMLElement).getByRole('link', {
      name: 'Открыть калькулятор липидного спасения',
    })

    await user.click(lipidRescueLink)

    expect(screen.getByRole('heading', { name: 'Протокол Липидного спасения' })).toBeTruthy()
  })

  it('does not render inline toxicology details inside the list', () => {
    renderToxicologyRoutes()

    expect(screen.queryByText('Токсические дозы для разных видов животных')).toBeNull()
    expect(screen.queryByText('Принципы терапии')).toBeNull()
  })
})
