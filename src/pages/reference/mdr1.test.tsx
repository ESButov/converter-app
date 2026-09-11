import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import Mdr1ReferencePage from './mdr1'

afterEach(() => {
  cleanup()
})

const renderMdr1Routes = () => {
  render(
    <MemoryRouter initialEntries={['/reference/mdr1']}>
      <Routes>
        <Route path="/reference/mdr1" element={<Mdr1ReferencePage />} />
        <Route path="/reference" element={<h1>Справочник</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Mdr1ReferencePage', () => {
  it('renders MDR1 checker in reference layout', () => {
    renderMdr1Routes()

    expect(screen.getByRole('heading', { name: 'Проверка MDR1' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Назад к справочнику' }).getAttribute('href')).toBe('/reference')
    expect(screen.getByLabelText('Действующее вещество или препарат')).toBeTruthy()
    expect(screen.getByLabelText('Породы риска и частота встречаемости')).toBeTruthy()
    expect(screen.getByText('Колли')).toBeTruthy()
    expect(screen.getByText('≈70%')).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Основная навигация' })).toBeTruthy()
  })

  it('selects a preparation trade name and shows normalized substance result', async () => {
    const user = userEvent.setup()

    renderMdr1Routes()

    await user.type(screen.getByLabelText('Действующее вещество или препарат'), 'имодиум')
    await user.click(screen.getByRole('button', { name: /Имодиум/ }))

    const result = screen.getByText('Лоперамид').closest('article')

    expect(result).not.toBeNull()
    expect(within(result as HTMLElement).getByText('Противодиарейный опиоидный препарат')).toBeTruthy()
    expect(within(result as HTMLElement).getAllByText('избегать').length).toBeGreaterThan(0)
    expect(within(result as HTMLElement).getByText(/Выбрано: препарат · Имодиум/)).toBeTruthy()
    expect(within(result as HTMLElement).getByText('Торговые названия')).toBeTruthy()
    expect(within(result as HTMLElement).getByText('Риск для mutant/normal')).toBeTruthy()
    expect(within(result as HTMLElement).getByText('Риск для mutant/mutant')).toBeTruthy()
    expect(within(result as HTMLElement).getByText('Клинические признаки токсичности')).toBeTruthy()
    expect(within(result as HTMLElement).getByText('Безопасный комментарий')).toBeTruthy()
    expect(within(result as HTMLElement).getByText('Альтернативы')).toBeTruthy()
  })

  it('shows dose-reduction status for Cerenia trade name', async () => {
    const user = userEvent.setup()

    renderMdr1Routes()

    await user.type(screen.getByLabelText('Действующее вещество или препарат'), 'церения')
    await user.click(screen.getByRole('button', { name: /Церения/ }))

    expect(screen.getByRole('heading', { level: 2, name: 'Маропитант' })).toBeTruthy()
    expect(screen.getAllByText('снизить дозу').length).toBeGreaterThan(0)
  })

  it('finds a preparation from the preparation reference and marks it as instruction-based', async () => {
    const user = userEvent.setup()

    renderMdr1Routes()

    await user.type(screen.getByLabelText('Действующее вещество или препарат'), 'конафлион')
    await user.click(screen.getByRole('button', { name: /Конафлион/ }))

    expect(screen.getByRole('heading', { level: 2, name: 'Конафлион' })).toBeTruthy()
    expect(screen.getAllByText('только по инструкции').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/MDR1-специфического ограничения/).length).toBeGreaterThan(0)
  })
})
