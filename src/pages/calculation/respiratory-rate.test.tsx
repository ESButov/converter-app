import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import RespiratoryRatePage from './respiratory-rate'

const renderRespiratoryRatePage = () => render(
  <MemoryRouter>
    <RespiratoryRatePage />
  </MemoryRouter>,
)

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('RespiratoryRatePage', () => {
  it('counts breaths for 15 seconds and calculates respiratory rate per minute', () => {
    vi.useFakeTimers()

    renderRespiratoryRatePage()

    fireEvent.click(screen.getByRole('button', { name: '15 секунд' }))
    fireEvent.click(screen.getByRole('button', { name: 'Запустить подсчет ЧДД' }))

    const tapButton = screen.getByRole('button', { name: 'Отметить дыхательное движение' })

    fireEvent.click(tapButton)
    fireEvent.click(tapButton)
    fireEvent.click(tapButton)
    fireEvent.click(tapButton)

    act(() => {
      vi.advanceTimersByTime(15_100)
    })

    expect(screen.getByText(/ЧДД: 16 дых\/мин/)).toBeTruthy()
    expect(screen.getByText(/Подсчитано: 4 за 15 сек/)).toBeTruthy()
  })

  it('resets the current count and result', () => {
    vi.useFakeTimers()

    renderRespiratoryRatePage()

    fireEvent.click(screen.getByRole('button', { name: 'Запустить подсчет ЧДД' }))
    fireEvent.click(screen.getByRole('button', { name: 'Отметить дыхательное движение' }))

    act(() => {
      vi.advanceTimersByTime(30_100)
    })

    expect(screen.getByText(/ЧДД:/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Сбросить' }))

    expect(screen.queryByText(/ЧДД:/)).toBeNull()
    expect(screen.getByText('00:30')).toBeTruthy()
    expect(screen.getByText('Движений: 0')).toBeTruthy()
  })

  it('does not restart or reset when the finished circle is clicked', () => {
    vi.useFakeTimers()

    renderRespiratoryRatePage()

    fireEvent.click(screen.getByRole('button', { name: '15 секунд' }))
    fireEvent.click(screen.getByRole('button', { name: 'Запустить подсчет ЧДД' }))
    fireEvent.click(screen.getByRole('button', { name: 'Отметить дыхательное движение' }))

    act(() => {
      vi.advanceTimersByTime(15_100)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Подсчет ЧДД завершен' }))

    expect(screen.getByText(/ЧДД: 4 дых\/мин/)).toBeTruthy()
    expect(screen.getByText(/Подсчитано: 1 за 15 сек/)).toBeTruthy()
    expect(screen.getByText('00:00')).toBeTruthy()
  })

  it('plays a finish signal when the timer ends', () => {
    vi.useFakeTimers()

    const oscillatorStartMock = vi.fn()
    const oscillatorStopMock = vi.fn()
    const oscillatorConnectMock = vi.fn()
    const gainConnectMock = vi.fn()
    const gainSetValueMock = vi.fn()
    const gainRampMock = vi.fn()
    const frequencySetValueMock = vi.fn()

    class TestAudioContext {
      currentTime = 0
      destination = {}
      state = 'running' as AudioContextState

      close = vi.fn(() => Promise.resolve())
      createGain = vi.fn(() => ({
        connect: gainConnectMock,
        gain: {
          exponentialRampToValueAtTime: gainRampMock,
          setValueAtTime: gainSetValueMock,
        },
      }))
      createOscillator = vi.fn(() => ({
        connect: oscillatorConnectMock,
        frequency: {
          setValueAtTime: frequencySetValueMock,
        },
        start: oscillatorStartMock,
        stop: oscillatorStopMock,
        type: 'sine',
      }))
      resume = vi.fn(() => Promise.resolve())
    }

    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: TestAudioContext,
    })

    renderRespiratoryRatePage()

    fireEvent.click(screen.getByRole('button', { name: 'Запустить подсчет ЧДД' }))

    act(() => {
      vi.advanceTimersByTime(30_100)
    })

    expect(oscillatorStartMock).toHaveBeenCalledTimes(2)
    expect(oscillatorStopMock).toHaveBeenCalledTimes(2)
  })
})
