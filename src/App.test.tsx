import { cleanup, render, screen } from '@testing-library/react'
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
