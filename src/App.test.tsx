import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

afterEach(() => {
  cleanup()
})

describe('App routes', () => {
  it('renders echo calculator page by /calculation/echo route', () => {
    render(
      <MemoryRouter initialEntries={['/calculation/echo']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Нормы ЭхоКГ' })).toBeTruthy()
  })

  it('renders infusion drip calculator page by /calculation/iv-drip route', () => {
    render(
      <MemoryRouter initialEntries={['/calculation/iv-drip']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Расчет капельного введения' })).toBeTruthy()
  })

  it('renders blood transfusion calculator page by /calculation/blood-transfusion route', () => {
    render(
      <MemoryRouter initialEntries={['/calculation/blood-transfusion']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Расчет крови и компонентов крови' })).toBeTruthy()
  })

  it('renders kalium replacement calculator page by /calculation/kalium route', () => {
    render(
      <MemoryRouter initialEntries={['/calculation/kalium']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Расчет восполнения калия' })).toBeTruthy()
  })

  it('renders enteral nutrition calculator page by /calculation/enteral-nutrition route', () => {
    render(
      <MemoryRouter initialEntries={['/calculation/enteral-nutrition']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Энтеральное питание/НЭП' })).toBeTruthy()
  })

  it('renders ECG calculator page by /calculation/ecg route', () => {
    render(
      <MemoryRouter initialEntries={['/calculation/ecg']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'ЭКГ' })).toBeTruthy()
  })

  it('renders FLK calculator page by /calculation/flk route', () => {
    render(
      <MemoryRouter initialEntries={['/calculation/flk']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Расчет FLK' })).toBeTruthy()
  })

  it('renders mixed infusions calculator page by /calculation/mixed-infusions route', () => {
    render(
      <MemoryRouter initialEntries={['/calculation/mixed-infusions']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Расчеты смешанных инфузий' })).toBeTruthy()
  })

  it('renders PEP calculator page by /calculation/pep route', () => {
    render(
      <MemoryRouter initialEntries={['/calculation/pep']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Расчет ПЭП' })).toBeTruthy()
  })

  it('renders electrolytes calculator page by /calculation/electrolytes route', () => {
    render(
      <MemoryRouter initialEntries={['/calculation/electrolytes']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Корректировка электролитов' })).toBeTruthy()
  })

  it('renders sodium correction calculator page by /calculation/sodium-correction route', () => {
    render(
      <MemoryRouter initialEntries={['/calculation/sodium-correction']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Коррекция натрия' })).toBeTruthy()
  })

  it('renders glucose-insulin calculator page by /calculation/glucose-insulin route', () => {
    render(
      <MemoryRouter initialEntries={['/calculation/glucose-insulin']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Расчет глюкозо-инсулиновой смеси' })).toBeTruthy()
  })

  it('renders unit converter page by /calculation/convert route', () => {
    render(
      <MemoryRouter initialEntries={['/calculation/convert']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Конвертер едениц измерения' })).toBeTruthy()
  })

  it('renders PDR calculator page by /calculation/pdr route', () => {
    render(
      <MemoryRouter initialEntries={['/calculation/pdr']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Калькулятор ПДР' })).toBeTruthy()
  })

  it('renders infusion therapy calculator page by /calculation/ipscalc route', () => {
    render(
      <MemoryRouter initialEntries={['/calculation/ipscalc']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Калькулятор расчета инфузионной терапии' })).toBeTruthy()
  })

  it('renders CPR drugs calculator page by /calculation/clr route', () => {
    render(
      <MemoryRouter initialEntries={['/calculation/clr']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Расчет препаратов для СЛР' })).toBeTruthy()
  })

  it('renders toxicology reference page by /reference/toxic route', () => {
    render(
      <MemoryRouter initialEntries={['/reference/toxic']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Токсикология' })).toBeTruthy()
  })

  it('renders active substances reference page by /reference/substances route', () => {
    render(
      <MemoryRouter initialEntries={['/reference/substances']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Действующие вещества' })).toBeTruthy()
    expect(screen.getByText('Витамин K1 / фитоменадион / Vitamin K1')).toBeTruthy()
  })

  it('renders veterinary preparations reference page by /reference/preparations route', () => {
    render(
      <MemoryRouter initialEntries={['/reference/preparations']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Ветеринарные препараты' })).toBeTruthy()
    expect(screen.getByText('Конафлион')).toBeTruthy()
  })

  it('renders redesigned home page by /home route without replacing the root draft', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/home']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Главная' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Справочник/ })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Токсикология' })).toBeNull()

    await user.click(screen.getByRole('button', { name: /Инфузионная терапия/ }))

    expect(screen.getByRole('link', { name: /Расчет инфузионной терапии/ })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Расчет ИПС/ })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /Интенсивная терапия/ }))

    expect(screen.queryByRole('link', { name: /Калькулятор расчета инфузионной терапии/ })).toBeNull()
    expect(screen.getByRole('link', { name: /Корректировка электролитов/ })).toBeTruthy()
  })

  it('renders reference index with toxicology entry by /reference route', () => {
    render(
      <MemoryRouter initialEntries={['/reference']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Справочник' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Токсикология/ })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Справочник действующих веществ/ })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Справочник ветеринарных препаратов/ })).toBeTruthy()
  })

  it('renders settings page with grouped action buttons', () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Настройки' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Аккаунт' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Приложение' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Помощь и связь' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Войти в аккаунт/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Инструкция по пользованию/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /^Настройки/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Контакты/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Безопасность/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Информация/ })).toBeTruthy()
  })

  it('opens settings from the home bottom navigation', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/home']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('link', { name: /Настройки/ }))

    expect(screen.getByRole('heading', { name: 'Настройки' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Войти в аккаунт/ })).toBeTruthy()
  })

  it('shows unified electrolytes calculator on the main page instead of old electrolyte calculators', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Корректировка электролитов' })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Коррекция натрия' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Расчет глюкозо-инсулиновой смеси' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Расчет восполнения калия' })).toBeNull()
  })

  it('hides standalone albumin calculator from the main page', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Расчет крови и компонентов крови' })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Рассчет Альбумина' })).toBeNull()
  })
})
