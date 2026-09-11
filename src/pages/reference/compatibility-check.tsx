import { useMemo, useState, type ReactNode } from 'react'
import {
  analyzeCompatibility,
  getCompatibilityEntityById,
  getCompatibilitySuggestions,
  type CompatibilityEntity,
  type CompatibilityMode,
  type CompatibilityResult,
} from '../../domain/drugCompatibility'
import AppScreen from '../../ui/AppScreen'
import './compatibility-check.css'

const modeLabels: Record<CompatibilityMode, string> = {
  substance: 'Действующее вещество',
  preparation: 'Препарат',
}

function TextList({ items }: { items: readonly string[] }) {
  return (
    <ul className="app-compat-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function ResultSection({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  return (
    <section className="app-compat-result-section">
      <h3>{title}</h3>
      {children}
    </section>
  )
}

function CompatibilitySearchField({
  label,
  mode,
  onInputChange,
  onSelect,
  selectedEntity,
  value,
}: {
  label: string
  mode: CompatibilityMode
  onInputChange: (value: string) => void
  onSelect: (entity: CompatibilityEntity) => void
  selectedEntity: CompatibilityEntity | undefined
  value: string
}) {
  const suggestions = useMemo(
    () => getCompatibilitySuggestions(mode, value),
    [mode, value],
  )
  const shouldShowSuggestions = selectedEntity === undefined && value.trim().length > 0 && suggestions.length > 0

  return (
    <div className="app-compat-field">
      <label>
        <span>{label}</span>
        <input
          autoComplete="off"
          onChange={(event) => onInputChange(event.target.value)}
          placeholder={
            mode === 'substance'
              ? 'Начните вводить действующее вещество'
              : 'Начните вводить препарат'
          }
          type="search"
          value={value}
        />
      </label>

      {shouldShowSuggestions ? (
        <div className="app-compat-suggestions" role="listbox">
          {suggestions.map((suggestion) => (
            <button
              aria-label={`Выбрать ${suggestion.label}`}
              className="app-compat-suggestion"
              key={suggestion.id}
              onClick={() => onSelect(suggestion)}
              type="button"
            >
              <span>{suggestion.label}</span>
              <small>{suggestion.subtitle}</small>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function CompatibilityResultCard({ result }: { result: CompatibilityResult }) {
  return (
    <article className="app-compat-result" data-severity={result.severity}>
      <header className="app-compat-result__header">
        <span>{getSeverityLabel(result.severity)}</span>
        <h2>{result.title}</h2>
        <p>{result.summary}</p>
      </header>

      <ResultSection title="Почему">
        <TextList items={result.reasons} />
      </ResultSection>

      <ResultSection title="Как лучше поступить">
        <TextList items={result.recommendations} />
      </ResultSection>
    </article>
  )
}

export default function CompatibilityCheckPage() {
  const [mode, setMode] = useState<CompatibilityMode>('substance')
  const [firstInput, setFirstInput] = useState('')
  const [secondInput, setSecondInput] = useState('')
  const [firstId, setFirstId] = useState('')
  const [secondId, setSecondId] = useState('')

  const firstEntity = useMemo(
    () => (firstId ? getCompatibilityEntityById(mode, firstId) : undefined),
    [firstId, mode],
  )
  const secondEntity = useMemo(
    () => (secondId ? getCompatibilityEntityById(mode, secondId) : undefined),
    [secondId, mode],
  )
  const result = useMemo(
    () => (
      firstId && secondId
        ? analyzeCompatibility(mode, firstId, secondId)
        : null
    ),
    [firstId, mode, secondId],
  )

  const fieldPrefix = modeLabels[mode]

  const handleModeChange = (nextMode: CompatibilityMode) => {
    setMode(nextMode)
    setFirstInput('')
    setSecondInput('')
    setFirstId('')
    setSecondId('')
  }

  return (
    <AppScreen
      ariaLabel="Проверка совместимости препаратов VetTools"
      backLabel="Назад к справочнику"
      backTo="/reference"
      iconSrc="/app-icons/reference.png"
      screenClassName="app-compat-screen"
      title="Проверка совместимости"
    >
      <div className="app-compat-scroll">
        <section className="app-compat-panel" aria-label="Параметры проверки">
          <label className="app-compat-mode">
            <span>Анализ по</span>
            <select
              value={mode}
              onChange={(event) => handleModeChange(event.target.value as CompatibilityMode)}
            >
              <option value="substance">Действующему веществу</option>
              <option value="preparation">Препарату</option>
            </select>
          </label>

          <CompatibilitySearchField
            label={`${fieldPrefix} 1`}
            mode={mode}
            onInputChange={(value) => {
              setFirstInput(value)
              setFirstId('')
            }}
            onSelect={(entity) => {
              setFirstId(entity.id)
              setFirstInput(entity.label)
            }}
            selectedEntity={firstEntity}
            value={firstInput}
          />

          <CompatibilitySearchField
            label={`${fieldPrefix} 2`}
            mode={mode}
            onInputChange={(value) => {
              setSecondInput(value)
              setSecondId('')
            }}
            onSelect={(entity) => {
              setSecondId(entity.id)
              setSecondInput(entity.label)
            }}
            selectedEntity={secondEntity}
            value={secondInput}
          />
        </section>

        {result ? (
          <CompatibilityResultCard result={result} />
        ) : (
          <section className="app-compat-empty">
            Выберите два пункта из подсказок, чтобы получить комментарий по совместимости.
          </section>
        )}
      </div>
    </AppScreen>
  )
}

function getSeverityLabel(severity: CompatibilityResult['severity']) {
  if (severity === 'avoid') {
    return 'Не совместимо'
  }

  if (severity === 'caution') {
    return 'Ограниченно'
  }

  if (severity === 'compatible') {
    return 'Совместимо'
  }

  return 'Нет правила'
}
