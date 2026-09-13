import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  calculateRespiratoryRatePerMinute,
  formatRespiratoryRateTimer,
  respiratoryRateTimerDurations,
  type RespiratoryRateTimerDuration,
} from '../../domain/respiratoryRate'
import AppScreen from '../../ui/AppScreen'
import './respiratory-rate.css'

const names = {
  title: 'Подсчет ЧДД',
  labels: {
    count: 'Движений',
    duration: 'Время таймера',
    finished: 'Готово',
    result: 'ЧДД',
    start: 'Старт',
    tap: 'Нажать',
  },
  buttons: {
    reset: 'Сбросить',
  },
} as const

const getTimerButtonLabel = (durationSeconds: RespiratoryRateTimerDuration) => (
  `${durationSeconds} секунд`
)

type AudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext
}

const playFinishSignal = (audioContext: AudioContext | null) => {
  if (audioContext === null) {
    return
  }

  const startTime = audioContext.currentTime
  const beepOffsets = [0, 0.18]

  beepOffsets.forEach((offset) => {
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    const beepStartTime = startTime + offset

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, beepStartTime)
    gain.gain.setValueAtTime(0.0001, beepStartTime)
    gain.gain.exponentialRampToValueAtTime(0.16, beepStartTime + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, beepStartTime + 0.13)

    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start(beepStartTime)
    oscillator.stop(beepStartTime + 0.14)
  })
}

export default function RespiratoryRatePage() {
  const [durationSeconds, setDurationSeconds] = useState<RespiratoryRateTimerDuration>(30)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(durationSeconds)
  const [breathCount, setBreathCount] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<number>()

  const breathCountRef = useRef(0)
  const durationSecondsRef = useRef(durationSeconds)
  const timerEndsAtRef = useRef<number | undefined>(undefined)
  const audioContextRef = useRef<AudioContext | null>(null)

  const ensureAudioContext = useCallback(() => {
    if (audioContextRef.current !== null) {
      if (audioContextRef.current.state === 'suspended') {
        void audioContextRef.current.resume().catch(() => undefined)
      }

      return audioContextRef.current
    }

    const audioWindow = window as AudioWindow
    const AudioContextConstructor = audioWindow.AudioContext ?? audioWindow.webkitAudioContext

    if (AudioContextConstructor === undefined) {
      return null
    }

    const audioContext = new AudioContextConstructor()
    audioContextRef.current = audioContext

    if (audioContext.state === 'suspended') {
      void audioContext.resume().catch(() => undefined)
    }

    return audioContext
  }, [])

  useEffect(() => {
    breathCountRef.current = breathCount
  }, [breathCount])

  useEffect(() => {
    durationSecondsRef.current = durationSeconds
  }, [durationSeconds])

  const finishTimer = useCallback(() => {
    timerEndsAtRef.current = undefined
    setIsRunning(false)
    setRemainingSeconds(0)
    setResult(
      calculateRespiratoryRatePerMinute(
        breathCountRef.current,
        durationSecondsRef.current,
      ),
    )
    playFinishSignal(audioContextRef.current)
  }, [])

  const updateRemainingTime = useCallback(() => {
    const timerEndsAt = timerEndsAtRef.current

    if (timerEndsAt === undefined) {
      return
    }

    const millisecondsLeft = timerEndsAt - window.performance.now()

    if (millisecondsLeft <= 0) {
      finishTimer()
      return
    }

    setRemainingSeconds(Math.ceil(millisecondsLeft / 1000))
  }, [finishTimer])

  useEffect(() => {
    if (!isRunning) {
      return undefined
    }

    updateRemainingTime()

    const intervalId = window.setInterval(updateRemainingTime, 200)

    return () => window.clearInterval(intervalId)
  }, [isRunning, updateRemainingTime])

  useEffect(() => () => {
    const audioContext = audioContextRef.current

    timerEndsAtRef.current = undefined

    if (audioContext !== null && audioContext.state !== 'closed') {
      void audioContext.close().catch(() => undefined)
    }
  }, [])

  const handleDurationChange = (nextDurationSeconds: RespiratoryRateTimerDuration) => {
    if (isRunning) {
      return
    }

    setDurationSeconds(nextDurationSeconds)
    setRemainingSeconds(nextDurationSeconds)
    setBreathCount(0)
    breathCountRef.current = 0
    setResult(undefined)
  }

  const startTimer = () => {
    ensureAudioContext()
    breathCountRef.current = 0
    durationSecondsRef.current = durationSeconds
    timerEndsAtRef.current = window.performance.now() + durationSeconds * 1000

    setBreathCount(0)
    setResult(undefined)
    setRemainingSeconds(durationSeconds)
    setIsRunning(true)
  }

  const handleCircleClick = () => {
    if (result !== undefined) {
      return
    }

    if (!isRunning) {
      startTimer()
      return
    }

    setBreathCount((currentCount) => {
      const nextCount = currentCount + 1
      breathCountRef.current = nextCount

      return nextCount
    })
  }

  const handleReset = () => {
    timerEndsAtRef.current = undefined
    breathCountRef.current = 0
    durationSecondsRef.current = durationSeconds

    setIsRunning(false)
    setRemainingSeconds(durationSeconds)
    setBreathCount(0)
    setResult(undefined)
  }

  const progress = useMemo(() => {
    if (result !== undefined) {
      return 1
    }

    if (!isRunning) {
      return 0
    }

    return Math.min(1, Math.max(0, (durationSeconds - remainingSeconds) / durationSeconds))
  }, [durationSeconds, isRunning, remainingSeconds, result])

  const circleStyle = {
    '--respiratory-rate-progress': `${Math.round(progress * 360)}deg`,
  } as CSSProperties

  const resultText = result === undefined
    ? undefined
    : `${names.labels.result}: ${result} дых/мин
Подсчитано: ${breathCount} за ${durationSeconds} сек`
  const circleButtonLabel = result !== undefined
    ? 'Подсчет ЧДД завершен'
    : isRunning
      ? 'Отметить дыхательное движение'
      : 'Запустить подсчет ЧДД'
  const circleActionLabel = result !== undefined
    ? names.labels.finished
    : isRunning
      ? names.labels.tap
      : names.labels.start

  return (
    <AppScreen
      ariaLabel="Подсчет ЧДД VetTools"
      backLabel="Назад на главную"
      backTo="/home"
      screenClassName="app-respiratory-rate-screen"
      title={names.title}
    >
      <form
        className="app-respiratory-rate-scroll"
        onSubmit={(event) => event.preventDefault()}
      >
        <section
          aria-label={names.labels.duration}
          className="app-respiratory-rate-duration"
        >
          <span>{names.labels.duration}</span>
          <div className="app-respiratory-rate-duration__buttons">
            {respiratoryRateTimerDurations.map((durationOption) => (
              <button
                aria-pressed={durationSeconds === durationOption}
                className="app-respiratory-rate-duration__button"
                disabled={isRunning}
                key={durationOption}
                type="button"
                onClick={() => handleDurationChange(durationOption)}
              >
                {getTimerButtonLabel(durationOption)}
              </button>
            ))}
          </div>
        </section>

        <section className="app-respiratory-rate-counter" aria-label="Счетчик дыхания">
          <button
            aria-label={circleButtonLabel}
            className="app-respiratory-rate-circle"
            disabled={result !== undefined}
            style={circleStyle}
            type="button"
            onClick={handleCircleClick}
          >
            <span className="app-respiratory-rate-circle__timer">
              {formatRespiratoryRateTimer(remainingSeconds)}
            </span>
            <span className="app-respiratory-rate-circle__action">
              {circleActionLabel}
            </span>
            <span className="app-respiratory-rate-circle__count">
              {names.labels.count}: {breathCount}
            </span>
          </button>
        </section>

        {resultText !== undefined ? (
          <section className="app-respiratory-rate-result" aria-label="Результат подсчета ЧДД">
            {resultText}
          </section>
        ) : null}

        <button
          className="app-respiratory-rate-reset"
          type="button"
          onClick={handleReset}
        >
          {names.buttons.reset}
        </button>
      </form>
    </AppScreen>
  )
}
