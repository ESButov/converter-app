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
})
