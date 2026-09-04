import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import EchoPage from './echo'

afterEach(() => {
  cleanup()
})

const renderEchoPage = () => {
  render(
    <MemoryRouter>
      <EchoPage />
    </MemoryRouter>,
  )
}

describe('EchoPage', () => {
  it('renders main fields and hides indicator rows until species is selected', () => {
    renderEchoPage()

    expect(screen.getByRole('heading', { name: 'Нормы ЭхоКГ' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Назад на главную' }).getAttribute('href')).toBe('/home')
    expect(screen.getByLabelText('Вид животного')).toBeTruthy()
    expect(screen.getByLabelText('Масса животного')).toBeTruthy()
    expect(screen.queryByLabelText('МЖПд,см')).toBeNull()
  })

  it('shows species indicators disabled until weight is filled', async () => {
    const user = userEvent.setup()

    renderEchoPage()

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')

    const ivsdInput = screen.getByLabelText('МЖПд,см') as HTMLInputElement

    expect(ivsdInput.disabled).toBe(true)

    await user.type(screen.getByLabelText('Масса животного'), '10')

    expect(ivsdInput.disabled).toBe(false)
    expect(screen.getByText('0.73-0.85')).toBeTruthy()
  })

  it('marks entered values according to calculated echo norm interval', async () => {
    const user = userEvent.setup()

    renderEchoPage()

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса животного'), '10')

    const ivsdInput = screen.getByLabelText('МЖПд,см') as HTMLInputElement

    await user.type(ivsdInput, '0.8')

    expect(ivsdInput.getAttribute('data-status')).toBe('normal')

    await user.clear(ivsdInput)
    await user.type(ivsdInput, '0.1')

    expect(ivsdInput.getAttribute('data-status')).toBe('abnormal')
  })

  it('calculates derived dog normalized dimensions through echoNorms', async () => {
    const user = userEvent.setup()

    renderEchoPage()

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'dog')
    await user.type(screen.getByLabelText('Масса животного'), '10')
    await user.type(screen.getByLabelText('КДР/ЛЖд,см'), '2')

    const lviddnInput = screen.getByLabelText('КДРн') as HTMLInputElement

    expect(lviddnInput.disabled).toBe(true)
    expect(lviddnInput.value).toBe('1.02')
    expect(lviddnInput.getAttribute('data-status')).toBe('abnormal')
  })

  it('limits weight input to three decimal places', async () => {
    const user = userEvent.setup()

    renderEchoPage()

    await user.selectOptions(screen.getByLabelText('Вид животного'), 'cat')
    await user.type(screen.getByLabelText('Масса животного'), '4.1234')

    const weightInput = screen.getByLabelText('Масса животного') as HTMLInputElement

    expect(weightInput.value).toBe('4.123')
  })
})
