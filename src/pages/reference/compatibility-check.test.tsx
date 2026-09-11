import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import CompatibilityCheckPage from './compatibility-check'

afterEach(() => {
  cleanup()
})

const renderCompatibilityRoutes = () => {
  render(
    <MemoryRouter initialEntries={['/reference/compatibility']}>
      <Routes>
        <Route path="/reference/compatibility" element={<CompatibilityCheckPage />} />
        <Route path="/reference" element={<h1>Справочник</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('CompatibilityCheckPage', () => {
  it('renders the compatibility checker in reference layout', () => {
    renderCompatibilityRoutes()

    expect(screen.getByRole('heading', { name: 'Проверка совместимости' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Назад к справочнику' }).getAttribute('href')).toBe('/reference')
    expect(screen.getByLabelText('Анализ по')).toBeTruthy()
    expect(screen.getByLabelText('Действующее вещество 1')).toBeTruthy()
    expect(screen.getByLabelText('Действующее вещество 2')).toBeTruthy()
  })

  it('selects substances from suggestions and shows serotonin syndrome warning', async () => {
    const user = userEvent.setup()

    renderCompatibilityRoutes()

    await user.type(screen.getByLabelText('Действующее вещество 1'), 'флуо')
    await user.click(screen.getByRole('button', { name: /Выбрать Флуоксетин/ }))
    await user.type(screen.getByLabelText('Действующее вещество 2'), 'трам')
    await user.click(screen.getByRole('button', { name: /Выбрать Трамадол/ }))

    const result = screen.getByText('Не рекомендуется сочетать').closest('article')

    expect(result).not.toBeNull()
    expect(within(result as HTMLElement).getByText('Не совместимо')).toBeTruthy()
    expect(within(result as HTMLElement).getByText(/серотонинового синдрома/)).toBeTruthy()
    expect(within(result as HTMLElement).getByText('Как лучше поступить')).toBeTruthy()
  })

  it('switches labels to preparation mode', async () => {
    const user = userEvent.setup()

    renderCompatibilityRoutes()

    await user.selectOptions(screen.getByLabelText('Анализ по'), 'preparation')

    expect(screen.getByLabelText('Препарат 1')).toBeTruthy()
    expect(screen.getByLabelText('Препарат 2')).toBeTruthy()
  })
})
