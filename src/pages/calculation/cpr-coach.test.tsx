import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CprCoachPage from './cpr-coach'

const mediaPlayMock = vi.fn()
const mediaPauseMock = vi.fn()
const speechCancelMock = vi.fn()

const renderCprCoachPage = () => render(
  <MemoryRouter>
    <CprCoachPage />
  </MemoryRouter>,
)

beforeEach(() => {
  mediaPlayMock.mockResolvedValue(undefined)
  mediaPauseMock.mockImplementation(() => undefined)
  speechCancelMock.mockImplementation(() => undefined)

  Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: mediaPlayMock,
  })
  Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    value: mediaPauseMock,
  })
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: {
      cancel: speechCancelMock,
      speak: vi.fn(),
    },
  })
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('CprCoachPage', () => {
  it('starts a new two-minute compression cycle after defibrillation', async () => {
    vi.useFakeTimers()

    renderCprCoachPage()

    fireEvent.click(screen.getByRole('button', { name: 'Старт таймера СЛР' }))

    act(() => {
      vi.advanceTimersByTime(30_000)
    })

    expect(screen.getByText('01:30')).toBeTruthy()
    expect(screen.getByText('Цикл 1')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Записать разряд/ }))

    expect(screen.getByText('02:00')).toBeTruthy()
    expect(screen.getByText('Цикл 2')).toBeTruthy()

    const eventLog = within(screen.getByRole('region', { name: 'Журнал событий' }))

    expect(eventLog.getByText('Дефибрилляция')).toBeTruthy()
    expect(eventLog.getByText(/сразу начать новый двухминутный цикл компрессий/)).toBeTruthy()
    expect(eventLog.getAllByText('цикл 1').length).toBeGreaterThan(0)
  })

  it('stops assistant audio when the page is closed', async () => {
    const user = userEvent.setup()
    const renderedPage = renderCprCoachPage()

    await user.click(screen.getByRole('button', { name: 'Настройки ассистента СЛР' }))
    await user.click(screen.getByRole('button', { name: /Bee Gees - Stayin' Alive/ }))
    await user.click(screen.getByRole('button', { name: 'Старт таймера СЛР' }))

    renderedPage.unmount()

    expect(mediaPauseMock).toHaveBeenCalled()
    expect(speechCancelMock).toHaveBeenCalled()
  })

  it('records a compact drug event with calculated substance dose', async () => {
    const user = userEvent.setup()

    renderCprCoachPage()

    await user.type(screen.getByLabelText('Масса, кг'), '5')
    await user.click(screen.getByRole('button', { name: /Атропин/ }))

    const eventLog = screen.getByRole('region', { name: 'Журнал событий' })

    expect(within(eventLog).getByText('Атропин')).toBeTruthy()
    expect(eventLog.textContent).toContain('Дозировка: 0.04-0.054 мг/кг.')
    expect(eventLog.textContent).toContain('Введенная доза: 0.2 мг-0.27 мг.')
    expect(eventLog.textContent).not.toContain('Разведение')
    expect(eventLog.textContent).not.toContain('В/в или внутрикостно')
  })

  it('uses the selected male voice prompt audio', async () => {
    const user = userEvent.setup()
    const audioSources: string[] = []

    vi.stubGlobal('Audio', class {
      currentTime = 0
      src: string

      constructor(src: string) {
        this.src = src
        audioSources.push(src)
      }

      pause = vi.fn()
      play = vi.fn(() => Promise.resolve())
    })

    renderCprCoachPage()

    await user.click(screen.getByRole('button', { name: 'Голосовые подсказки' }))
    await user.click(screen.getByRole('button', { name: 'Настройки ассистента СЛР' }))
    await user.click(screen.getByRole('button', { name: /Мужской/ }))
    await user.click(screen.getByRole('button', { name: 'Старт таймера СЛР' }))

    expect(audioSources).toContain('/audio/cpr-coach/voice/male/start-compressions.mp3')
  })
})
