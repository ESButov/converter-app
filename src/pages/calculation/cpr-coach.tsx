import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type MouseEvent } from 'react'
import {
  calculateClrDrugs,
  clrDrugDefinitions,
  clrSpeciesLabels,
  type ClrDrugCalculation,
  type ClrSpecies,
} from '../../domain/clr'
import AppScreen from '../../ui/AppScreen'
import './cpr-coach.css'

type CoachSpecies = Extract<ClrSpecies, 'cat' | 'dog'>
type EventType = 'drug' | 'rhythm' | 'shock' | 'gas' | 'system'

type RecordedEvent = {
  cycleNumber: number
  detail: string
  id: number
  recordedAt: number
  timeSeconds: number
  title: string
  type: EventType
}

type RhythmOption = {
  id: string
  label: string
  note: string
  shockable: boolean
}

type QualityPanel = 'breathing' | 'compressions'
type QualityTone = 'high' | 'low' | 'ok' | 'waiting'

type CprDisplaySettings = {
  isDefibrillatorVisible: boolean
  visibleDrugIds: string[]
}

type AudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext
}

type SoundMode = 'metronome' | 'melody-1' | 'melody-2' | 'melody-3' | 'custom'
type VoicePromptId = 'start-compressions' | 'pulse-check' | 'new-cycle'
type VoiceMode = 'female' | 'male'

type ToneStep = {
  durationSeconds: number
  frequency: number
  gainValue?: number
}

type CprProtocolPayload = {
  body: string
  subject: string
}

type CprProtocolData = {
  carbonDioxideInput: string
  compressionRatePerMinute: number
  cycleNumber: number
  elapsedSeconds: number
  events: readonly RecordedEvent[]
  isBreathEnabled: boolean
  isMetronomeEnabled: boolean
  isVoiceEnabled: boolean
  lastRhythmLabel?: string
  phaseLabel: string
  soundModeLabel: string
  speciesLabel: string
  weightKg?: number
}

const sequenceSeconds = 130
const compressionSeconds = 120
const pulseCheckSeconds = 10
const defaultCompressionRatePerMinute = 110
const ventilationRatePerMinute = 10
const breathPromptSrc = '/audio/cpr-coach/breath-short.wav'
const rhythmAudioVolume = 0.36
const customTrackRatePattern = /^\d{0,3}$/
const cprDisplaySettingsStorageKey = 'vettools-cpr-coach-display-settings-v1'
const cprVoiceModeStorageKey = 'vettools-cpr-coach-voice-mode-v1'
const cprDrugIds = clrDrugDefinitions.map((drug) => drug.id)

const voicePromptSources: Record<VoiceMode, Record<VoicePromptId, { src: string; fallbackText: string }>> = {
  female: {
    'new-cycle': {
      fallbackText: 'Начать компрессии. Новый цикл.',
      src: '/audio/cpr-coach/voice/female/new-cycle.mp3',
    },
    'pulse-check': {
      fallbackText: 'Проверка пульса. Десять секунд.',
      src: '/audio/cpr-coach/voice/female/pulse-check.mp3',
    },
    'start-compressions': {
      fallbackText: 'Начать компрессии.',
      src: '/audio/cpr-coach/voice/female/start-compressions.mp3',
    },
  },
  male: {
    'new-cycle': {
      fallbackText: 'Начать компрессии. Новый цикл.',
      src: '/audio/cpr-coach/voice/male/new-cycle.mp3',
    },
    'pulse-check': {
      fallbackText: 'Проверка пульса. Десять секунд.',
      src: '/audio/cpr-coach/voice/male/pulse-check.mp3',
    },
    'start-compressions': {
      fallbackText: 'Начать компрессии.',
      src: '/audio/cpr-coach/voice/male/start-compressions.mp3',
    },
  },
}

const voiceModeOptions: readonly {
  id: VoiceMode
  label: string
}[] = [
  {
    id: 'female',
    label: 'Женский',
  },
  {
    id: 'male',
    label: 'Мужской',
  },
]

const speciesOptions: readonly {
  label: string
  value: CoachSpecies
}[] = [
  {
    label: clrSpeciesLabels.dog,
    value: 'dog',
  },
  {
    label: clrSpeciesLabels.cat,
    value: 'cat',
  },
]

// У каждого аудиотрека должен быть свой темп, чтобы частота компрессий совпадала со звуком.
const soundModeOptions: readonly {
  audioSrc?: string
  id: SoundMode
  label: string
  note: string
  ratePerMinute: number
}[] = [
  {
    id: 'metronome',
    label: 'Метроном',
    note: 'Ритм: 110 компрессий/мин.',
    ratePerMinute: defaultCompressionRatePerMinute,
  },
  {
    audioSrc: '/audio/cpr-coach/bee-gees-stayin-alive.mp3',
    id: 'melody-1',
    label: 'Bee Gees - Stayin\' Alive',
    note: 'Ритм: 104 компрессии/мин.',
    ratePerMinute: 104,
  },
  {
    audioSrc: '/audio/cpr-coach/opyt-yunga-zhivi.mp3',
    id: 'melody-2',
    label: 'Опыт Юнга - Живи',
    note: 'Ритм: 100 компрессий/мин.',
    ratePerMinute: 100,
  },
  {
    audioSrc: '/audio/cpr-coach/muse-supermassive-black-hole.mp3',
    id: 'melody-3',
    label: 'Muse - Supermassive Black Hole',
    note: 'Ритм: 120 компрессий/мин.',
    ratePerMinute: 120,
  },
  {
    id: 'custom',
    label: 'Свой трек',
    note: 'Ритм: задается вручную.',
    ratePerMinute: defaultCompressionRatePerMinute,
  },
]

const metronomeTonePattern: readonly ToneStep[] = [
  {
    durationSeconds: 0.04,
    frequency: 880,
    gainValue: 0.06,
  },
]

const rhythmOptions: readonly RhythmOption[] = [
  {
    id: 'asystole',
    label: 'Асистолия',
    note: 'Нешоковый ритм',
    shockable: false,
  },
  {
    id: 'pea',
    label: 'Электрическая активность без пульса',
    note: 'Нешоковый ритм',
    shockable: false,
  },
  {
    id: 'vf',
    label: 'Фибрилляция желудочков',
    note: 'Шоковый ритм',
    shockable: true,
  },
  {
    id: 'pulseless-vt',
    label: 'Желудочковая тахикардия без пульса',
    note: 'Шоковый ритм',
    shockable: true,
  },
  {
    id: 'supraventricular-tachycardia',
    label: 'Наджелудочковая тахикардия',
    note: 'Оценить наличие пульса',
    shockable: false,
  },
  {
    id: 'pulse',
    label: 'Пульс найден',
    note: 'Отметка восстановления\nкровообращения',
    shockable: false,
  },
  {
    id: 'spontaneous-breathing',
    label: 'Спонтанное дыхание',
    note: 'Отметка восстановления\nсамостоятельного дыхания',
    shockable: false,
  },
]

const numberPattern = /^\d*(?:\.\d{0,2})?$/
const carbonDioxidePattern = /^\d*(?:\.\d{0,1})?$/

const readNumber = (value: string) => {
  if (value === '') return undefined

  const parsedValue = Number(value.replace(',', '.'))

  return Number.isFinite(parsedValue) ? parsedValue : undefined
}

const formatTimer = (seconds: number) => {
  const normalizedSeconds = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(normalizedSeconds / 60)
  const restSeconds = normalizedSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(restSeconds).padStart(2, '0')}`
}

const formatEventTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const restSeconds = seconds % 60

  return `${minutes}:${String(restSeconds).padStart(2, '0')}`
}

const formatRealEventTime = (timestamp: number) => (
  new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(timestamp))
)

const getRecordedAtFromInteraction = (event: Pick<MouseEvent<HTMLElement>, 'timeStamp'>) => {
  if (!Number.isFinite(event.timeStamp)) {
    return 0
  }

  if (event.timeStamp > 1_000_000_000_000) {
    return Math.round(event.timeStamp)
  }

  return Math.round(performance.timeOrigin + event.timeStamp)
}

const formatDoseNumber = (value: number) => {
  if (value < 1) return value.toFixed(2).replace(/\.?0+$/, '')

  return Math.round(value).toString()
}

const getShockLabel = (weightKg: number | undefined) => {
  if (weightKg === undefined || weightKg <= 0) {
    return 'Укажите массу для расчета энергии разряда.'
  }

  return `${formatDoseNumber(weightKg * 4)}-${formatDoseNumber(weightKg * 6)} Дж`
}

const getPulseCheckProgress = (phaseElapsedSeconds: number) => (
  Math.min(1, Math.max(0, (phaseElapsedSeconds - compressionSeconds) / pulseCheckSeconds))
)

const calculateTapRate = (timestamps: readonly number[]) => {
  if (timestamps.length < 2) {
    return undefined
  }

  const firstTimestamp = timestamps[0]
  const lastTimestamp = timestamps[timestamps.length - 1]
  const elapsedMs = lastTimestamp - firstTimestamp

  if (elapsedMs <= 0) {
    return undefined
  }

  return Math.round((timestamps.length - 1) * 60_000 / elapsedMs)
}

const getQualityStatus = (
  panel: QualityPanel,
  ratePerMinute: number | undefined,
): { label: string; tone: QualityTone } => {
  if (ratePerMinute === undefined) {
    return {
      label: 'Нужно минимум 2 отметки',
      tone: 'waiting',
    }
  }

  if (panel === 'compressions') {
    if (ratePerMinute < 100) return { label: 'Медленно', tone: 'low' }
    if (ratePerMinute > 120) return { label: 'Быстро', tone: 'high' }

    return { label: 'Норма', tone: 'ok' }
  }

  if (ratePerMinute < 8) return { label: 'Редко', tone: 'low' }
  if (ratePerMinute > 12) return { label: 'Часто', tone: 'high' }

  return { label: 'Норма', tone: 'ok' }
}

const buildQualityTimestamps = (
  currentTimestamps: readonly number[],
  windowMs: number,
) => {
  const currentTimestamp = Date.now()
  const recentTimestamps = currentTimestamps.filter((timestamp) => (
    currentTimestamp - timestamp <= windowMs
  ))

  return [...recentTimestamps, currentTimestamp].slice(-5)
}

const playTone = (
  audioContext: AudioContext | null,
  frequency: number,
  durationSeconds: number,
  gainValue = 0.06,
  delaySeconds = 0,
) => {
  if (audioContext === null) {
    return
  }

  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  const startTime = audioContext.currentTime + delaySeconds

  oscillator.frequency.value = frequency
  oscillator.type = 'sine'
  gain.gain.setValueAtTime(gainValue, startTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSeconds)
  oscillator.connect(gain)
  gain.connect(audioContext.destination)
  oscillator.start(startTime)
  oscillator.stop(startTime + durationSeconds)
}

const playTonePattern = (
  audioContext: AudioContext | null,
  pattern: readonly ToneStep[],
) => {
  let offsetSeconds = 0

  pattern.forEach((step) => {
    playTone(
      audioContext,
      step.frequency,
      step.durationSeconds,
      step.gainValue,
      offsetSeconds,
    )
    offsetSeconds += step.durationSeconds + 0.035
  })
}

const stopMediaElement = (audio: HTMLAudioElement | null) => {
  if (audio === null) {
    return
  }

  audio.pause()
  audio.currentTime = 0
}

const getDrugDilutionLabel = (drug: ClrDrugCalculation) => (
  drug.dilutionLabel ?? drug.specialDilutionLabel
)

const getDrugPrimaryVolumeLabel = (drug: ClrDrugCalculation) => (
  drug.dilutionVolumeLabel ?? drug.volumeLabel
)

const buildDrugEventDetail = (drug: ClrDrugCalculation) => {
  return `Дозировка: ${drug.definition.doseLabel}. Введенная доза: ${drug.amountLabel}.`
}

const buildRhythmEventDetail = (rhythm: RhythmOption, shockEnergyLabel: string) => {
  if (rhythm.shockable) {
    return `Шоковый ритм. Расчет разряда: ${shockEnergyLabel}.`
  }

  return rhythm.note.replace(/\s+/g, ' ')
}

const createDefaultDisplaySettings = (): CprDisplaySettings => ({
  isDefibrillatorVisible: true,
  visibleDrugIds: [...cprDrugIds],
})

const sanitizeDisplaySettings = (value: unknown): CprDisplaySettings => {
  const defaultSettings = createDefaultDisplaySettings()

  if (typeof value !== 'object' || value === null) {
    return defaultSettings
  }

  const partialSettings = value as Partial<CprDisplaySettings>
  const validDrugIds = Array.isArray(partialSettings.visibleDrugIds)
    ? partialSettings.visibleDrugIds.filter((drugId): drugId is string => (
      typeof drugId === 'string' &&
      cprDrugIds.includes(drugId)
    ))
    : defaultSettings.visibleDrugIds

  return {
    isDefibrillatorVisible: typeof partialSettings.isDefibrillatorVisible === 'boolean'
      ? partialSettings.isDefibrillatorVisible
      : defaultSettings.isDefibrillatorVisible,
    visibleDrugIds: cprDrugIds.filter((drugId) => validDrugIds.includes(drugId)),
  }
}

const readDisplaySettings = () => {
  if (typeof window === 'undefined') {
    return createDefaultDisplaySettings()
  }

  try {
    return sanitizeDisplaySettings(
      JSON.parse(window.localStorage.getItem(cprDisplaySettingsStorageKey) ?? 'null'),
    )
  } catch {
    return createDefaultDisplaySettings()
  }
}

const isVoiceMode = (value: string | null): value is VoiceMode => (
  value === 'female' || value === 'male'
)

const readVoiceMode = () => {
  if (typeof window === 'undefined') {
    return 'female'
  }

  const storedVoiceMode = window.localStorage.getItem(cprVoiceModeStorageKey)

  return isVoiceMode(storedVoiceMode) ? storedVoiceMode : 'female'
}

const buildCprProtocolEmail = (data: CprProtocolData): CprProtocolPayload => {
  const chronologicalEvents = [...data.events].sort((firstEvent, secondEvent) => (
    firstEvent.timeSeconds - secondEvent.timeSeconds
  ))
  const eventLines = chronologicalEvents.length > 0
    ? chronologicalEvents.map((event) => (
      `${formatEventTime(event.timeSeconds)}, цикл ${event.cycleNumber} (${formatRealEventTime(event.recordedAt)}) - ${event.title}: ${event.detail}`
    ))
    : ['События не записаны.']

  return {
    body: [
      'Протокол ассистента СЛР',
      '',
      `Вид животного: ${data.speciesLabel}`,
      `Масса: ${data.weightKg === undefined ? 'не указана' : `${data.weightKg} кг`}`,
      `Время от начала: ${formatTimer(data.elapsedSeconds)}`,
      `Текущий цикл: ${data.cycleNumber}`,
      `Текущий этап: ${data.phaseLabel}`,
      `Частота компрессий: ${data.compressionRatePerMinute} в минуту`,
      `Звук ритма: ${data.isMetronomeEnabled ? data.soundModeLabel : 'выключен'}`,
      `Дыхательные подсказки: ${data.isBreathEnabled ? 'включены' : 'выключены'}`,
      `Голосовые подсказки: ${data.isVoiceEnabled ? 'включены' : 'выключены'}`,
      `Последний ритм: ${data.lastRhythmLabel ?? 'не указан'}`,
      `Углекислый газ: ${data.carbonDioxideInput === '' ? 'не указан' : `${data.carbonDioxideInput} мм рт. ст.`}`,
      '',
      'Журнал событий:',
      ...eventLines,
    ].join('\n'),
    subject: 'Протокол СЛР',
  }
}

const sendCprProtocolByEmail = async (payload: CprProtocolPayload) => {
  void payload
  // Здесь в чистовой версии будет подключена отправка протокола на почту.
  return {
    status: 'pending-email-integration',
  } as const
}

const speakFallbackPrompt = (text: string) => {
  if (!('speechSynthesis' in window)) {
    return
  }

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ru-RU'
  utterance.rate = 1

  window.speechSynthesis.speak(utterance)
}

function PlayIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M9 7.3v9.4c0 .7.8 1.1 1.4.7l7.1-4.7c.5-.3.5-1.1 0-1.4l-7.1-4.7c-.6-.4-1.4 0-1.4.7Z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M8.2 6.5h2.3c.4 0 .8.4.8.8v9.4c0 .4-.4.8-.8.8H8.2a.8.8 0 0 1-.8-.8V7.3c0-.4.4-.8.8-.8Zm5.3 0h2.3c.4 0 .8.4.8.8v9.4c0 .4-.4.8-.8.8h-2.3a.8.8 0 0 1-.8-.8V7.3c0-.4.4-.8.8-.8Z" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M7.8 7.8h8.4v8.4H7.8V7.8Z" />
    </svg>
  )
}

function MetronomeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 3.4c.4 0 .8.3.9.7l4.1 14.5c.2.7-.3 1.3-1 1.3H8c-.7 0-1.2-.7-1-1.3l4.1-14.5c.1-.4.5-.7.9-.7Zm0 4.2-2.8 10h5.6L12 7.6Z" />
      <path d="M13.3 5.2 18 2.9l.9 1.8-4.7 2.4-.9-1.9Z" />
    </svg>
  )
}

function BreathIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M11 5.1c.6 0 1 .4 1 1v4.2c0 .5-.3.9-.7 1.1-1.5.6-2.5 2.1-2.5 3.7v2.8c0 .5-.4.9-.9.9H5.5c-1.2 0-2.2-.9-2.2-2.1 0-4.5 2.8-8.7 6.9-10.3.1-.7.4-1.3.8-1.3Zm2 1c0-.6.4-1 1-1 .4 0 .7.6.8 1.3 4.1 1.6 6.9 5.8 6.9 10.3 0 1.2-1 2.1-2.2 2.1h-2.4c-.5 0-.9-.4-.9-.9v-2.8c0-1.6-1-3.1-2.5-3.7-.4-.2-.7-.6-.7-1.1V6.1Z" />
    </svg>
  )
}

function CompressionQualityIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 3.2a5.1 5.1 0 0 1 4.6 7.3l2 2c.7.7.7 1.8 0 2.5l-1.4 1.4c-.7.7-1.8.7-2.5 0l-2.1-2.1c-.2 0-.4.1-.6.1a5.6 5.6 0 0 1-.7 0L9.2 16.5c-.7.7-1.8.7-2.5 0L5.3 15c-.7-.7-.7-1.8 0-2.5l2-2A5.1 5.1 0 0 1 12 3.2Zm0 2a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Zm-4.9 8.5 1 1 1.2-1.2a5.4 5.4 0 0 1-1-.8l-1.2 1Zm7.6-.2 1.2 1.2 1-1-1.2-1.1c-.3.3-.6.6-1 .9Z" />
    </svg>
  )
}

function VentilationQualityIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M6.3 10.2c1.2-2.9 3.4-4.8 5.7-4.8s4.5 1.9 5.7 4.8c1.2.3 2.1 1.4 2.1 2.7v2.7c0 1.7-1.4 3.1-3.1 3.1h-2.1c-.6 0-1-.4-1-1v-4.3c0-.9-.7-1.6-1.6-1.6s-1.6.7-1.6 1.6v4.3c0 .6-.4 1-1 1H7.3a3.1 3.1 0 0 1-3.1-3.1v-2.7c0-1.3.9-2.4 2.1-2.7Zm5.7-2.8c-1.3 0-2.8 1.1-3.7 2.8h1.1c1.4 0 2.6.8 3.2 2 .6-1.2 1.8-2 3.2-2h1.1c-1-1.7-2.5-2.8-3.9-2.8Z" />
    </svg>
  )
}

function VoiceIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4.2 9.2h3.2l4.1-3.3c.6-.5 1.5-.1 1.5.7v10.8c0 .8-.9 1.2-1.5.7l-4.1-3.3H4.2c-.6 0-1-.4-1-1V10.2c0-.6.4-1 1-1Z" />
      <path d="M16.2 8.2c1.1.9 1.8 2.2 1.8 3.8s-.7 2.9-1.8 3.8l-1.1-1.4c.7-.5 1.1-1.4 1.1-2.4s-.4-1.9-1.1-2.4l1.1-1.4Z" />
      <path d="M18.7 5.6c1.9 1.5 3.1 3.8 3.1 6.4s-1.2 4.9-3.1 6.4l-1.1-1.5c1.5-1.1 2.4-2.9 2.4-4.9s-.9-3.8-2.4-4.9l1.1-1.5Z" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 8.1a3.9 3.9 0 1 1 0 7.8 3.9 3.9 0 0 1 0-7.8Zm0 1.9a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
      <path d="M13.3 2.8c.5 0 .9.3 1 .8l.3 1.5c.4.1.8.3 1.1.5l1.3-.8c.4-.3.9-.2 1.3.2l.8.8c.4.4.4.9.2 1.3l-.8 1.3c.2.4.4.7.5 1.1l1.5.3c.5.1.8.5.8 1v1.2c0 .5-.3.9-.8 1l-1.5.3c-.1.4-.3.8-.5 1.1l.8 1.3c.3.4.2.9-.2 1.3l-.8.8c-.4.4-.9.4-1.3.2l-1.3-.8c-.4.2-.7.4-1.1.5l-.3 1.5c-.1.5-.5.8-1 .8h-1.2c-.5 0-.9-.3-1-.8l-.3-1.5c-.4-.1-.8-.3-1.1-.5l-1.3.8c-.4.3-.9.2-1.3-.2l-.8-.8c-.4-.4-.4-.9-.2-1.3l.8-1.3c-.2-.4-.4-.7-.5-1.1L3 13c-.5-.1-.8-.5-.8-1v-1.2c0-.5.3-.9.8-1l1.5-.3c.1-.4.3-.8.5-1.1l-.8-1.3c-.3-.4-.2-.9.2-1.3l.8-.8c.4-.4.9-.4 1.3-.2l1.3.8c.4-.2.7-.4 1.1-.5l.3-1.5c.1-.5.5-.8 1-.8h1.2Zm-.8 2h-1l-.3 1.7c-.1.4-.4.7-.8.8-.6.2-1.1.4-1.6.7-.3.2-.8.2-1.1 0l-1.4-.9-.7.7.9 1.4c.2.3.2.8 0 1.1-.3.5-.6 1-.7 1.6-.1.4-.4.7-.8.8l-1.7.3v1l1.7.3c.4.1.7.4.8.8.2.6.4 1.1.7 1.6.2.3.2.8 0 1.1l-.9 1.4.7.7 1.4-.9c.3-.2.8-.2 1.1 0 .5.3 1 .6 1.6.7.4.1.7.4.8.8l.3 1.7h1l.3-1.7c.1-.4.4-.7.8-.8.6-.2 1.1-.4 1.6-.7.3-.2.8-.2 1.1 0l1.4.9.7-.7-.9-1.4c-.2-.3-.2-.8 0-1.1.3-.5.6-1 .7-1.6.1-.4.4-.7.8-.8l1.7-.3v-1l-1.7-.3c-.4-.1-.7-.4-.8-.8-.2-.6-.4-1.1-.7-1.6-.2-.3-.2-.8 0-1.1l.9-1.4-.7-.7-1.4.9c-.3.2-.8.2-1.1 0-.5-.3-1-.6-1.6-.7-.4-.1-.7-.4-.8-.8l-.3-1.7Z" />
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5.5 3.5h11.2c.3 0 .6.1.8.4l2.6 2.6c.3.2.4.5.4.8v11.2c0 1.1-.9 2-2 2h-13a2 2 0 0 1-2-2v-13c0-1.1.9-2 2-2Zm0 1.9v13.1c0 .1.1.2.2.2h12.8c.1 0 .2-.1.2-.2V7.7l-2.3-2.3h-.8v4.2c0 .6-.4 1-1 1H8.1c-.6 0-1-.4-1-1V5.4H5.5Zm3.4 0v3.3h4.9V5.4H8.9Zm-.2 8.3h6.6c.6 0 1 .4 1 1v4H7.7v-4c0-.6.4-1 1-1Z" />
    </svg>
  )
}

export default function CprCoachPage() {
  const [species, setSpecies] = useState<CoachSpecies>('dog')
  const [weightInput, setWeightInput] = useState('')
  const [carbonDioxideInput, setCarbonDioxideInput] = useState('')
  const [customDrugInput, setCustomDrugInput] = useState('')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isMetronomeEnabled, setIsMetronomeEnabled] = useState(true)
  const [isBreathEnabled, setIsBreathEnabled] = useState(true)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [isSoundSettingsOpen, setIsSoundSettingsOpen] = useState(false)
  const [soundMode, setSoundMode] = useState<SoundMode>('metronome')
  const [voiceMode, setVoiceMode] = useState<VoiceMode>(readVoiceMode)
  const [customTrackName, setCustomTrackName] = useState('')
  const [customTrackRateInput, setCustomTrackRateInput] = useState('110')
  const [customTrackUrl, setCustomTrackUrl] = useState<string>()
  const [cycleBaseNumber, setCycleBaseNumber] = useState(1)
  const [cycleStartElapsedSeconds, setCycleStartElapsedSeconds] = useState(0)
  const [protocolStatus, setProtocolStatus] = useState('')
  const [lastRhythmId, setLastRhythmId] = useState<string>()
  const [activeQualityPanel, setActiveQualityPanel] = useState<QualityPanel>()
  const [compressionTapTimestamps, setCompressionTapTimestamps] = useState<number[]>([])
  const [breathingTapTimestamps, setBreathingTapTimestamps] = useState<number[]>([])
  const [displaySettings, setDisplaySettings] = useState<CprDisplaySettings>(readDisplaySettings)
  const [events, setEvents] = useState<RecordedEvent[]>([])
  const eventIdRef = useRef(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const rhythmAudioRef = useRef<HTMLAudioElement | null>(null)
  const breathAudioRef = useRef<HTMLAudioElement | null>(null)
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null)
  const previousPhaseRef = useRef<'compressions' | 'pulse-check'>('compressions')
  const soundSettingsRef = useRef<HTMLDivElement | null>(null)

  const weightKg = useMemo(() => readNumber(weightInput), [weightInput])
  const drugCalculations = useMemo(
    () => calculateClrDrugs(species, weightKg),
    [species, weightKg],
  )
  const visibleDrugIdSet = useMemo(
    () => new Set(displaySettings.visibleDrugIds),
    [displaySettings.visibleDrugIds],
  )
  const visibleDrugCalculations = useMemo(
    () => drugCalculations.filter((drug) => visibleDrugIdSet.has(drug.definition.id)),
    [drugCalculations, visibleDrugIdSet],
  )
  const customTrackRate = useMemo(
    () => readNumber(customTrackRateInput),
    [customTrackRateInput],
  )
  const selectedSoundMode = soundModeOptions.find((option) => option.id === soundMode)
  const activeCompressionRatePerMinute = soundMode === 'custom' && customTrackRate !== undefined
    ? Math.max(1, Math.round(customTrackRate))
    : selectedSoundMode?.ratePerMinute ?? defaultCompressionRatePerMinute
  const rhythmAudioSrc = soundMode === 'custom' ? customTrackUrl : selectedSoundMode?.audioSrc

  const cycleElapsedSeconds = Math.max(0, elapsedSeconds - cycleStartElapsedSeconds)
  const sequencePositionSeconds = cycleElapsedSeconds % sequenceSeconds
  const phase = sequencePositionSeconds < compressionSeconds ? 'compressions' : 'pulse-check'
  const phaseElapsedSeconds = sequencePositionSeconds
  const phaseRemainingSeconds = phase === 'compressions'
    ? compressionSeconds - phaseElapsedSeconds
    : sequenceSeconds - phaseElapsedSeconds
  const circleProgress = phase === 'compressions'
    ? phaseElapsedSeconds / compressionSeconds
    : getPulseCheckProgress(phaseElapsedSeconds)
  const cycleNumber = cycleBaseNumber + Math.floor(cycleElapsedSeconds / sequenceSeconds)
  const shockEnergyLabel = getShockLabel(weightKg)
  const lastRhythm = rhythmOptions.find((rhythm) => rhythm.id === lastRhythmId)
  const activeEventCount = events.length
  const phaseLabel = phase === 'compressions' ? 'компрессии' : 'проверка пульса'
  const compressionTapRate = calculateTapRate(compressionTapTimestamps)
  const breathingTapRate = calculateTapRate(breathingTapTimestamps)
  const activeQualityRate = activeQualityPanel === 'breathing'
    ? breathingTapRate
    : compressionTapRate
  const activeQualityStatus = getQualityStatus(activeQualityPanel ?? 'compressions', activeQualityRate)

  const resetQualityMeasurements = useCallback((panel: QualityPanel) => {
    if (panel === 'compressions') {
      setCompressionTapTimestamps([])
      return
    }

    setBreathingTapTimestamps([])
  }, [])

  const closeQualityPanel = useCallback(() => {
    if (activeQualityPanel !== undefined) {
      resetQualityMeasurements(activeQualityPanel)
    }

    setActiveQualityPanel(undefined)
  }, [activeQualityPanel, resetQualityMeasurements])

  const playVoicePrompt = useCallback((promptId: VoicePromptId) => {
    if (!isVoiceEnabled) {
      return
    }

    const prompt = voicePromptSources[voiceMode][promptId]
    voiceAudioRef.current?.pause()
    window.speechSynthesis?.cancel()

    const audio = new Audio(prompt.src)
    voiceAudioRef.current = audio

    void audio.play().catch(() => {
      speakFallbackPrompt(prompt.fallbackText)
    })
  }, [isVoiceEnabled, voiceMode])

  const stopTransientAudio = useCallback(() => {
    stopMediaElement(rhythmAudioRef.current)
    stopMediaElement(breathAudioRef.current)
    stopMediaElement(voiceAudioRef.current)
    window.speechSynthesis?.cancel()
  }, [])

  const stopAllAudioPlayback = useCallback(() => {
    stopTransientAudio()

    const audioContext = audioContextRef.current

    if (audioContext !== null && audioContext.state !== 'closed') {
      void audioContext.close().catch(() => undefined)
      audioContextRef.current = null
    }
  }, [stopTransientAudio])

  useEffect(() => {
    const handlePageHide = () => {
      stopAllAudioPlayback()
    }

    window.addEventListener('pagehide', handlePageHide)

    return () => {
      window.removeEventListener('pagehide', handlePageHide)
      stopAllAudioPlayback()
    }
  }, [stopAllAudioPlayback])

  useEffect(() => {
    if (!isRunning) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((currentSeconds) => currentSeconds + 1)
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [isRunning])

  useEffect(() => {
    if (!isSoundSettingsOpen) {
      return undefined
    }

    const handlePointerDown = (event: PointerEvent) => {
      const settingsElement = soundSettingsRef.current

      if (!(event.target instanceof Node) || settingsElement?.contains(event.target)) {
        return
      }

      setIsSoundSettingsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isSoundSettingsOpen])

  useEffect(() => {
    if (activeQualityPanel === undefined) {
      return undefined
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) {
        return
      }

      if (event.target.closest('.app-cpr-coach-quality-panel, .app-cpr-coach-quality-toggle')) {
        return
      }

      closeQualityPanel()
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [activeQualityPanel, closeQualityPanel])

  useEffect(() => {
    try {
      window.localStorage.setItem(
        cprDisplaySettingsStorageKey,
        JSON.stringify(displaySettings),
      )
    } catch {
      // Настройки не критичны: при недоступном хранилище ассистент продолжит работать.
    }
  }, [displaySettings])

  useEffect(() => {
    try {
      window.localStorage.setItem(cprVoiceModeStorageKey, voiceMode)
    } catch {
      // Настройки не критичны: при недоступном хранилище ассистент продолжит работать.
    }
  }, [voiceMode])

  useEffect(() => {
    stopMediaElement(voiceAudioRef.current)
  }, [voiceMode])

  useEffect(() => () => {
    if (customTrackUrl !== undefined) {
      URL.revokeObjectURL(customTrackUrl)
    }
  }, [customTrackUrl])

  useEffect(() => {
    const audio = rhythmAudioRef.current

    if (audio === null || rhythmAudioSrc === undefined) {
      return undefined
    }

    if (!isRunning || !isMetronomeEnabled || phase !== 'compressions') {
      audio.pause()
      audio.currentTime = 0
      return undefined
    }

    audio.loop = true
    audio.volume = rhythmAudioVolume
    void audio.play().catch(() => undefined)

    return () => {
      audio.pause()
      audio.currentTime = 0
    }
  }, [isMetronomeEnabled, isRunning, phase, rhythmAudioSrc])

  useEffect(() => {
    if (!isRunning || !isMetronomeEnabled || phase !== 'compressions' || soundMode !== 'metronome') {
      return undefined
    }

    const intervalMs = Math.round(60_000 / activeCompressionRatePerMinute)

    playTonePattern(audioContextRef.current, metronomeTonePattern)

    const intervalId = window.setInterval(() => {
      playTonePattern(audioContextRef.current, metronomeTonePattern)
    }, intervalMs)

    return () => window.clearInterval(intervalId)
  }, [activeCompressionRatePerMinute, isMetronomeEnabled, isRunning, phase, soundMode])

  useEffect(() => {
    if (!isRunning || !isBreathEnabled || phase !== 'compressions') {
      return undefined
    }

    const intervalMs = Math.round(60_000 / ventilationRatePerMinute)
    const breathAudio = breathAudioRef.current

    const playBreathPrompt = () => {
      if (breathAudio === null) {
        return
      }

      breathAudio.currentTime = 0
      breathAudio.volume = 1
      void breathAudio.play().catch(() => undefined)
    }

    const intervalId = window.setInterval(playBreathPrompt, intervalMs)

    return () => {
      window.clearInterval(intervalId)

      if (breathAudio !== null) {
        breathAudio.pause()
        breathAudio.currentTime = 0
      }
    }
  }, [isBreathEnabled, isRunning, phase])

  useEffect(() => {
    const previousPhase = previousPhaseRef.current

    if (previousPhase === phase) {
      return
    }

    previousPhaseRef.current = phase

    playVoicePrompt(phase === 'pulse-check' ? 'pulse-check' : 'new-cycle')
  }, [phase, playVoicePrompt])

  const ensureAudioContext = () => {
    const audioWindow = window as AudioWindow
    const Context = audioWindow.AudioContext ?? audioWindow.webkitAudioContext

    if (Context === undefined) {
      return
    }

    if (audioContextRef.current === null) {
      audioContextRef.current = new Context()
    }

    if (audioContextRef.current.state === 'suspended') {
      void audioContextRef.current.resume()
    }
  }

  const playRhythmAudio = (restart = false) => {
    const audio = rhythmAudioRef.current

    if (audio === null || rhythmAudioSrc === undefined) {
      return
    }

    if (restart) {
      audio.currentTime = 0
    }

    audio.loop = true
    audio.volume = rhythmAudioVolume
    void audio.play().catch(() => undefined)
  }

  const addEvent = (title: string, detail: string, type: EventType, recordedAt: number) => {
    const nextEvent: RecordedEvent = {
      cycleNumber,
      detail,
      id: eventIdRef.current + 1,
      recordedAt,
      timeSeconds: elapsedSeconds,
      title,
      type,
    }

    eventIdRef.current = nextEvent.id
    setEvents((currentEvents) => [nextEvent, ...currentEvents])
  }

  const handleStartPause = (event: MouseEvent<HTMLButtonElement>) => {
    ensureAudioContext()

    const nextIsRunning = !isRunning
    const recordedAt = getRecordedAtFromInteraction(event)

    setIsRunning(nextIsRunning)
    addEvent(
      nextIsRunning ? 'СЛР запущена' : 'СЛР приостановлена',
      nextIsRunning ? 'Начат двухминутный цикл.' : 'Таймер поставлен на паузу.',
      'system',
      recordedAt,
    )

    if (nextIsRunning) {
      playVoicePrompt('start-compressions')

      if (isMetronomeEnabled && soundMode !== 'metronome' && phase === 'compressions') {
        playRhythmAudio(true)
      }
    } else {
      stopTransientAudio()
    }
  }

  const handleReset = (event: MouseEvent<HTMLButtonElement>) => {
    setElapsedSeconds(0)
    setCycleBaseNumber(1)
    setCycleStartElapsedSeconds(0)
    setIsRunning(false)
    stopTransientAudio()
    previousPhaseRef.current = 'compressions'
    addEvent(
      'СЛР сброшена',
      'Таймер возвращен к началу цикла.',
      'system',
      getRecordedAtFromInteraction(event),
    )
  }

  const handleWeightChange = (event: ChangeEvent<HTMLInputElement>) => {
    const normalizedValue = event.target.value.replace(',', '.')

    if (numberPattern.test(normalizedValue)) {
      setWeightInput(normalizedValue)
    }
  }

  const handleCarbonDioxideChange = (event: ChangeEvent<HTMLInputElement>) => {
    const normalizedValue = event.target.value.replace(',', '.')

    if (carbonDioxidePattern.test(normalizedValue)) {
      setCarbonDioxideInput(normalizedValue)
    }
  }

  const handleCustomDrugChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCustomDrugInput(event.target.value)
  }

  const handleCustomTrackChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file === undefined) {
      return
    }

    setCustomTrackUrl(URL.createObjectURL(file))
    setCustomTrackName(file.name)
    setSoundMode('custom')
  }

  const handleCustomTrackRateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value

    if (customTrackRatePattern.test(value)) {
      setCustomTrackRateInput(value)
    }
  }

  const handleDrugVisibilityToggle = (drugId: string) => {
    setDisplaySettings((currentSettings) => {
      const visibleDrugIds = new Set(currentSettings.visibleDrugIds)

      if (visibleDrugIds.has(drugId)) {
        visibleDrugIds.delete(drugId)
      } else {
        visibleDrugIds.add(drugId)
      }

      return {
        ...currentSettings,
        visibleDrugIds: cprDrugIds.filter((currentDrugId) => visibleDrugIds.has(currentDrugId)),
      }
    })
  }

  const handleDefibrillatorVisibilityToggle = () => {
    setDisplaySettings((currentSettings) => ({
      ...currentSettings,
      isDefibrillatorVisible: !currentSettings.isDefibrillatorVisible,
    }))
  }

  const handleQualityTap = (panel: QualityPanel) => {
    if (panel === 'compressions') {
      setCompressionTapTimestamps((currentTimestamps) => (
        buildQualityTimestamps(currentTimestamps, 6_000)
      ))
      return
    }

    setBreathingTapTimestamps((currentTimestamps) => (
      buildQualityTimestamps(currentTimestamps, 36_000)
    ))
  }

  const handleRhythmRecord = (rhythm: RhythmOption, event: MouseEvent<HTMLButtonElement>) => {
    setLastRhythmId(rhythm.id)
    addEvent(
      rhythm.label,
      buildRhythmEventDetail(rhythm, shockEnergyLabel),
      'rhythm',
      getRecordedAtFromInteraction(event),
    )
  }

  const handleShockRecord = (event: MouseEvent<HTMLButtonElement>) => {
    ensureAudioContext()

    const recordedAt = getRecordedAtFromInteraction(event)
    const nextCycleNumber = cycleNumber + 1
    const shockEventDoseLabel = shockEnergyLabel.replace(/\.$/, '')

    addEvent(
      'Дефибрилляция',
      `Разряд: ${shockEventDoseLabel}. После разряда сразу начать новый двухминутный цикл компрессий без повторной оценки ритма.`,
      'shock',
      recordedAt,
    )
    setCycleStartElapsedSeconds(elapsedSeconds)
    setCycleBaseNumber(nextCycleNumber)
    setCompressionTapTimestamps([])
    setBreathingTapTimestamps([])
    setActiveQualityPanel(undefined)
    setIsRunning(true)
    previousPhaseRef.current = 'compressions'
    stopTransientAudio()
    playVoicePrompt('new-cycle')

    if (isMetronomeEnabled && soundMode !== 'metronome') {
      playRhythmAudio(true)
    }
  }

  const handleCarbonDioxideRecord = (event: MouseEvent<HTMLButtonElement>) => {
    const value = readNumber(carbonDioxideInput)

    if (value === undefined) {
      return
    }

    addEvent(
      'Углекислый газ',
      `${value} мм рт. ст.`,
      'gas',
      getRecordedAtFromInteraction(event),
    )
    setCarbonDioxideInput('')
  }

  const handleDrugRecord = (drugId: string, event: MouseEvent<HTMLButtonElement>) => {
    const drug = drugCalculations.find((calculation) => calculation.definition.id === drugId)

    if (drug === undefined) {
      return
    }

    addEvent(
      drug.definition.label,
      buildDrugEventDetail(drug),
      'drug',
      getRecordedAtFromInteraction(event),
    )
  }

  const handleCustomDrugRecord = (event: MouseEvent<HTMLButtonElement>) => {
    const drugName = customDrugInput.trim()

    if (drugName === '') {
      return
    }

    addEvent(
      drugName,
      'Пользовательская запись препарата.',
      'drug',
      getRecordedAtFromInteraction(event),
    )
    setCustomDrugInput('')
  }

  const handleProtocolSend = (event: MouseEvent<HTMLButtonElement>) => {
    const recordedAt = getRecordedAtFromInteraction(event)
    const protocolPayload = buildCprProtocolEmail({
      carbonDioxideInput,
      compressionRatePerMinute: activeCompressionRatePerMinute,
      cycleNumber,
      elapsedSeconds,
      events,
      isBreathEnabled,
      isMetronomeEnabled,
      isVoiceEnabled,
      lastRhythmLabel: lastRhythm?.label,
      phaseLabel,
      soundModeLabel: selectedSoundMode?.label ?? 'Метроном',
      speciesLabel: clrSpeciesLabels[species],
      weightKg,
    })

    void sendCprProtocolByEmail(protocolPayload).then(() => {
      setProtocolStatus('Протокол подготовлен. Отправка на почту будет подключена в чистовой версии.')
      addEvent('Протокол СЛР', 'Подготовлен для отправки на почту.', 'system', recordedAt)
    })
  }

  const circleStyle = {
    '--cpr-progress': `${Math.round(circleProgress * 360)}deg`,
  } as React.CSSProperties

  return (
    <AppScreen
      ariaLabel="Ассистент СЛР VetTools"
      screenClassName="app-cpr-coach-screen"
      title="Ассистент СЛР"
    >
      <form
        className="app-cpr-coach-scroll"
        onSubmit={(event) => event.preventDefault()}
      >
        <section className="app-cpr-coach-timer-card" aria-label="Таймер СЛР">
          <audio
            aria-hidden="true"
            className="app-cpr-coach-rhythm-audio"
            preload="auto"
            ref={rhythmAudioRef}
            src={rhythmAudioSrc}
          />
          <audio
            aria-hidden="true"
            className="app-cpr-coach-breath-audio"
            preload="auto"
            ref={breathAudioRef}
            src={breathPromptSrc}
          />
          <div className="app-cpr-coach-sound-rail" aria-label="Звуковые подсказки">
            <button
              aria-label={`Ритм: ${selectedSoundMode?.label ?? 'Метроном'}`}
              aria-pressed={isMetronomeEnabled}
              className="app-cpr-coach-toggle"
              title={`Ритм: ${selectedSoundMode?.label ?? 'Метроном'}`}
              type="button"
              onClick={() => {
                ensureAudioContext()
                setIsMetronomeEnabled((isEnabled) => !isEnabled)
              }}
            >
              <MetronomeIcon />
            </button>
            <button
              aria-label="Дыхательные подсказки"
              aria-pressed={isBreathEnabled}
              className="app-cpr-coach-toggle"
              title="Дыхание"
              type="button"
              onClick={() => {
                ensureAudioContext()
                setIsBreathEnabled((isEnabled) => !isEnabled)
              }}
            >
              <BreathIcon />
            </button>
            <button
              aria-label="Голосовые подсказки"
              aria-pressed={isVoiceEnabled}
              className="app-cpr-coach-toggle"
              title="Голос"
              type="button"
              onClick={() => setIsVoiceEnabled((isEnabled) => !isEnabled)}
            >
              <VoiceIcon />
            </button>
          </div>

          <div className="app-cpr-coach-sound-settings-anchor" ref={soundSettingsRef}>
            <button
              aria-expanded={isSoundSettingsOpen}
              aria-label="Настройки ассистента СЛР"
              className="app-cpr-coach-gear-button"
              title="Настройки"
              type="button"
              onClick={() => setIsSoundSettingsOpen((isOpen) => !isOpen)}
            >
              <GearIcon />
            </button>
            {isSoundSettingsOpen ? (
              <div
                aria-label="Настройки ассистента СЛР"
                className="app-cpr-coach-sound-settings"
                role="dialog"
              >
                <strong>Звук ритма</strong>
                <div className="app-cpr-coach-sound-settings__options">
                  {soundModeOptions.map((option) => (
                    <button
                      aria-pressed={soundMode === option.id}
                      className="app-cpr-coach-sound-option"
                      key={option.id}
                      type="button"
                      onClick={() => {
                        ensureAudioContext()
                        setSoundMode(option.id)
                      }}
                    >
                      <span>{option.label}</span>
                      <small>{option.note}</small>
                    </button>
                  ))}
                </div>
                {soundMode === 'custom' ? (
                  <div className="app-cpr-coach-custom-track">
                    <label className="app-cpr-coach-custom-track__file">
                      <span>{customTrackName === '' ? 'Добавить трек' : customTrackName}</span>
                      <input
                        accept="audio/*"
                        type="file"
                        onChange={handleCustomTrackChange}
                      />
                    </label>
                    <label className="app-cpr-coach-field app-cpr-coach-custom-track__rate">
                      <span>Темп, компрессий/мин</span>
                      <input
                        inputMode="numeric"
                        max="180"
                        min="1"
                        step="1"
                        type="number"
                        value={customTrackRateInput}
                        onChange={handleCustomTrackRateChange}
                      />
                    </label>
                    <p>
                      Для своего файла укажите темп трека: он будет показан как частота
                      компрессий.
                    </p>
                  </div>
                ) : null}
                <div className="app-cpr-coach-voice-settings">
                  <strong>Голос подсказок</strong>
                  <div className="app-cpr-coach-voice-settings__options">
                    {voiceModeOptions.map((option) => (
                      <button
                        aria-pressed={voiceMode === option.id}
                        className="app-cpr-coach-voice-option"
                        key={option.id}
                        type="button"
                        onClick={() => setVoiceMode(option.id)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="app-cpr-coach-display-settings">
                  <strong>Отображать</strong>
                  <label className="app-cpr-coach-check-option">
                    <input
                      checked={displaySettings.isDefibrillatorVisible}
                      type="checkbox"
                      onChange={handleDefibrillatorVisibilityToggle}
                    />
                    <span>Дефибриллятор</span>
                  </label>
                  <div className="app-cpr-coach-display-settings__drug-list">
                    {clrDrugDefinitions.map((drug) => (
                      <label className="app-cpr-coach-check-option" key={drug.id}>
                        <input
                          checked={displaySettings.visibleDrugIds.includes(drug.id)}
                          type="checkbox"
                          onChange={() => handleDrugVisibilityToggle(drug.id)}
                        />
                        <span>{drug.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <button
            aria-label="Подготовить протокол для отправки на почту"
            className="app-cpr-coach-protocol-button"
            title="Подготовить протокол"
            type="button"
            onClick={handleProtocolSend}
          >
            <SaveIcon />
          </button>

          <div className="app-cpr-coach-timer-zone">
            <button
              aria-label="Проверка компрессий"
              aria-expanded={activeQualityPanel === 'compressions'}
              className="app-cpr-coach-quality-toggle app-cpr-coach-quality-toggle--compressions"
              title="Проверка компрессий"
              type="button"
              onClick={() => {
                if (activeQualityPanel === 'compressions') {
                  closeQualityPanel()
                  return
                }

                if (activeQualityPanel !== undefined) {
                  resetQualityMeasurements(activeQualityPanel)
                }

                resetQualityMeasurements('compressions')
                setActiveQualityPanel('compressions')
              }}
            >
              <CompressionQualityIcon />
            </button>

            <div
              className={[
                'app-cpr-coach-timer',
                phase === 'pulse-check' ? 'app-cpr-coach-timer--pulse' : '',
              ].filter(Boolean).join(' ')}
              style={circleStyle}
            >
              <span className="app-cpr-coach-timer__phase">
                {phase === 'compressions' ? 'Компрессии' : 'Проверка пульса'}
              </span>
              <strong className="app-cpr-coach-timer__time">
                {formatTimer(phaseRemainingSeconds)}
              </strong>
              <span className="app-cpr-coach-timer__cycle">Цикл {cycleNumber}</span>
              <span className="app-cpr-coach-timer__controls" aria-label="Управление СЛР">
                <button
                  aria-label={isRunning ? 'Пауза таймера СЛР' : 'Старт таймера СЛР'}
                  className="app-cpr-coach-timer-button app-cpr-coach-timer-button--primary"
                  type="button"
                  onClick={handleStartPause}
                >
                  {isRunning ? <PauseIcon /> : <PlayIcon />}
                </button>
                <button
                  aria-label="Стоп и сброс таймера СЛР"
                  className="app-cpr-coach-timer-button"
                  type="button"
                  onClick={handleReset}
                >
                  <StopIcon />
                </button>
              </span>
            </div>

            <button
              aria-label="Проверка дыхания"
              aria-expanded={activeQualityPanel === 'breathing'}
              className="app-cpr-coach-quality-toggle app-cpr-coach-quality-toggle--breathing"
              title="Проверка дыхания"
              type="button"
              onClick={() => {
                if (activeQualityPanel === 'breathing') {
                  closeQualityPanel()
                  return
                }

                if (activeQualityPanel !== undefined) {
                  resetQualityMeasurements(activeQualityPanel)
                }

                resetQualityMeasurements('breathing')
                setActiveQualityPanel('breathing')
              }}
            >
              <VentilationQualityIcon />
            </button>

            {activeQualityPanel !== undefined ? (
              <button
                aria-label={activeQualityPanel === 'compressions'
                  ? 'Отметить компрессию'
                  : 'Отметить вдох'}
                className={[
                  'app-cpr-coach-quality-panel',
                  `app-cpr-coach-quality-panel--${activeQualityPanel}`,
                ].join(' ')}
                type="button"
                onClick={() => handleQualityTap(activeQualityPanel)}
              >
                <span className="app-cpr-coach-quality-panel__content">
                  <span className="app-cpr-coach-quality-panel__header">
                    <strong>
                      {activeQualityPanel === 'compressions'
                        ? 'Проверка компрессий'
                        : 'Проверка дыхания'}
                    </strong>
                    <span
                      className={`app-cpr-coach-quality-panel__status app-cpr-coach-quality-panel__status--${activeQualityStatus.tone}`}
                    >
                      {activeQualityStatus.label}
                    </span>
                  </span>
                  <span className="app-cpr-coach-quality-panel__value">
                    {activeQualityRate === undefined ? '-' : `${activeQualityRate}/мин`}
                  </span>
                  <span className="app-cpr-coach-quality-panel__target">
                    {activeQualityPanel === 'compressions'
                      ? 'Цель: 100-120 компрессий/мин'
                      : 'Цель: около 10 вдохов/мин'}
                  </span>
                  <span className="app-cpr-coach-quality-panel__tap-label">
                    {activeQualityPanel === 'compressions'
                      ? 'Нажимайте в круг при каждой компрессии'
                      : 'Нажимайте в круг при каждом вдохе'}
                  </span>
                </span>
              </button>
            ) : null}
          </div>

          <div className="app-cpr-coach-status-grid" aria-label="Параметры цикла">
            <span>
              <strong>{activeCompressionRatePerMinute}</strong>
              компрессий/мин
            </span>
            <span>
              <strong>{ventilationRatePerMinute}</strong>
              вдохов/мин
            </span>
            <span>
              <strong>{activeEventCount}</strong>
              событий
            </span>
          </div>
          {protocolStatus !== '' ? (
            <p className="app-cpr-coach-protocol-feedback" role="status">
              {protocolStatus}
            </p>
          ) : null}
        </section>

        <section className="app-cpr-coach-settings-card" aria-label="Данные пациента">
          <label className="app-cpr-coach-field">
            <span>Вид животного</span>
            <select
              value={species}
              onChange={(event) => setSpecies(event.target.value as CoachSpecies)}
            >
              {speciesOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="app-cpr-coach-field">
            <span>Масса, кг</span>
            <input
              inputMode="decimal"
              min="0"
              onChange={handleWeightChange}
              type="number"
              value={weightInput}
            />
          </label>
        </section>

        <section className="app-cpr-coach-panel" aria-label="Запись препаратов">
          <h2>Препараты</h2>
          <div className="app-cpr-coach-drug-grid">
            {visibleDrugCalculations.map((drug) => {
              const dilutionLabel = getDrugDilutionLabel(drug)
              const primaryVolumeLabel = getDrugPrimaryVolumeLabel(drug)

              return (
                <button
                  className="app-cpr-coach-event-button app-cpr-coach-drug-button"
                  disabled={!drug.isAvailableForSpecies}
                  key={drug.definition.id}
                  type="button"
                  onClick={(event) => handleDrugRecord(drug.definition.id, event)}
                >
                  <span className="app-cpr-coach-drug-button__header">
                    <span>{drug.definition.label}</span>
                    <small>{drug.definition.doseLabel} - {drug.definition.concentrationLabel}</small>
                  </span>
                  {dilutionLabel ? (
                    <small className="app-cpr-coach-drug-button__line">
                      {dilutionLabel}
                    </small>
                  ) : null}
                  <strong>Ввести: {primaryVolumeLabel}</strong>
                </button>
              )
            })}
            <div className="app-cpr-coach-custom-drug">
              <input
                aria-label="Свой препарат"
                onChange={handleCustomDrugChange}
                placeholder="Свой препарат"
                type="text"
                value={customDrugInput}
              />
              <button
                disabled={customDrugInput.trim() === ''}
                type="button"
                onClick={handleCustomDrugRecord}
              >
                Записать
              </button>
            </div>
          </div>
          {drugCalculations.length === 0 ? (
            <p className="app-cpr-coach-muted">Укажите массу для быстрого расчета доз.</p>
          ) : visibleDrugCalculations.length === 0 ? (
            <p className="app-cpr-coach-muted">Все препараты скрыты в настройках.</p>
          ) : null}
        </section>

        <section className="app-cpr-coach-panel" aria-label="Запись ритма">
          <h2>Ритм</h2>
          <div className="app-cpr-coach-rhythm-list">
            {rhythmOptions.map((rhythm) => (
              <button
                className={[
                  'app-cpr-coach-rhythm-button',
                  rhythm.shockable ? 'app-cpr-coach-rhythm-button--shockable' : '',
                ].filter(Boolean).join(' ')}
                key={rhythm.id}
                type="button"
                onClick={(event) => handleRhythmRecord(rhythm, event)}
              >
                <span>{rhythm.label}</span>
                <strong>{rhythm.note}</strong>
              </button>
            ))}
          </div>
          {lastRhythm?.shockable ? (
            <p className="app-cpr-coach-alert">
              Рекомендованный разряд: {shockEnergyLabel}
            </p>
          ) : null}
        </section>

        <section className="app-cpr-coach-panel" aria-label="Дефибрилляция и углекислый газ">
          <h2>{displaySettings.isDefibrillatorVisible ? 'Дефибрилляция и газ' : 'Газ'}</h2>
          {displaySettings.isDefibrillatorVisible ? (
            <button
              className="app-cpr-coach-shock-button"
              type="button"
              onClick={handleShockRecord}
            >
              Записать разряд {shockEnergyLabel}
            </button>
          ) : null}

          <div className="app-cpr-coach-carbon-dioxide">
            <label className="app-cpr-coach-field">
              <span>Углекислый газ, мм рт. ст.</span>
              <input
                inputMode="decimal"
                min="0"
                onChange={handleCarbonDioxideChange}
                type="number"
                value={carbonDioxideInput}
              />
            </label>
            <button
              className="app-cpr-coach-secondary-button"
              type="button"
              onClick={handleCarbonDioxideRecord}
            >
              Записать
            </button>
          </div>
        </section>

        <section className="app-cpr-coach-panel" aria-label="Журнал событий">
          <h2>Журнал событий</h2>
          {events.length > 0 ? (
            <ol className="app-cpr-coach-event-log">
              {events.slice(0, 12).map((event) => (
                <li className={`app-cpr-coach-event-log__item app-cpr-coach-event-log__item--${event.type}`} key={event.id}>
                  <time>
                    <span>{formatEventTime(event.timeSeconds)}</span>
                    <span>цикл {event.cycleNumber}</span>
                    <span>({formatRealEventTime(event.recordedAt)})</span>
                  </time>
                  <span>
                    <strong>{event.title}</strong>
                    {event.detail}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="app-cpr-coach-muted">События появятся здесь после записи препаратов, ритма, разряда или газа.</p>
          )}
        </section>
      </form>
    </AppScreen>
  )
}
