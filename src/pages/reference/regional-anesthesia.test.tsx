import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import RegionalAnesthesiaReferencePage from './regional-anesthesia'

afterEach(() => {
  cleanup()
})

const renderRegionalRoutes = (initialEntry = '/reference/regional-anesthesia') => {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/reference/regional-anesthesia" element={<RegionalAnesthesiaReferencePage />} />
        <Route path="/reference/regional-anesthesia/:blockId" element={<RegionalAnesthesiaReferencePage />} />
        <Route path="/reference" element={<h1>Справочник</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RegionalAnesthesiaReferencePage', () => {
  it('renders filters and the first ultrasound head block', () => {
    renderRegionalRoutes()

    expect(screen.getByRole('heading', { name: 'Регионарная анестезия' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Назад к справочнику' }).getAttribute('href')).toBe('/reference')
    expect(screen.getByLabelText('Вид животного')).toBeTruthy()
    expect(screen.getByLabelText('Область')).toBeTruthy()
    expect(screen.getByLabelText('Метод навигации')).toBeTruthy()
    expect((screen.getByLabelText('Область') as HTMLSelectElement).value).toBe('all')
    expect((screen.getByLabelText('Метод навигации') as HTMLSelectElement).value).toBe('all')
    expect(screen.getByText('УЗИ-навигация блокад нервов головы')).toBeTruthy()
    expect(screen.queryByText('Препараты и дозы')).toBeNull()
    expect(screen.queryByText('Безопасный объем')).toBeNull()
    expect(screen.getByRole('navigation', { name: 'Основная навигация' })).toBeTruthy()
  })

  it('filters blocks by selected species, area and navigation method', async () => {
    const user = userEvent.setup()

    renderRegionalRoutes()

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'cat')
    await user.selectOptions(screen.getByLabelText('Область'), 'reproductive')
    await user.selectOptions(screen.getByLabelText('Метод навигации'), 'ultrasound')

    const list = screen.getByLabelText('Список блокад')
    expect(within(list).getByText('Пудендальная блокада у котов')).toBeTruthy()
    expect(screen.getByText('Найдено: 1')).toBeTruthy()
  })

  it('shows an empty state for combinations without configured blocks', async () => {
    const user = userEvent.setup()

    renderRegionalRoutes()

    await user.selectOptions(screen.getByLabelText('Область'), 'chest')
    await user.selectOptions(screen.getByLabelText('Метод навигации'), 'nerve-stimulator')

    expect(screen.getByText('Для выбранной комбинации пока нет оформленных блокад.')).toBeTruthy()
  })

  it('opens the selected block as a full detail page', async () => {
    const user = userEvent.setup()

    renderRegionalRoutes()

    await user.click(screen.getByRole('link', {
      name: /УЗИ-навигация блокад нервов головы. Открыть полную карточку блокады/,
    }))

    expect(screen.getByRole('heading', { name: 'УЗИ-навигация блокад нервов головы' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Назад к блокадам' }).getAttribute('href')).toBe('/reference/regional-anesthesia')
    expect(screen.getByText('Препараты и дозы')).toBeTruthy()
    expect(screen.getByText('Безопасный объем')).toBeTruthy()
    expect(screen.getByText('Риски')).toBeTruthy()
    expect(screen.getByText('Техника')).toBeTruthy()
  })
})
