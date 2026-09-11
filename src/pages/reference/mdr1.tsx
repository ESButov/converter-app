import { useDeferredValue, useMemo, useState, type ReactNode } from 'react'
import {
  mdr1BreedFrequencyItems,
  getMdr1ReferenceResultById,
  getMdr1Suggestions,
  mdr1StatusLabels,
  type Mdr1BreedFrequencyItem,
  type Mdr1ReferenceItem,
  type Mdr1SearchSuggestion,
} from '../../data/mdr1Reference'
import AppScreen from '../../ui/AppScreen'
import './mdr1.css'

function Mdr1TextList({ items }: { items: readonly string[] }) {
  return (
    <ul className="app-mdr1-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function Mdr1ResultSection({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  return (
    <section className="app-mdr1-result-section">
      <h3>{title}</h3>
      {children}
    </section>
  )
}

function Mdr1SuggestionButton({
  onSelect,
  suggestion,
}: {
  onSelect: (suggestion: Mdr1SearchSuggestion) => void
  suggestion: Mdr1SearchSuggestion
}) {
  return (
    <button
      className="app-mdr1-suggestion"
      onClick={() => onSelect(suggestion)}
      type="button"
    >
      <span>{suggestion.label}</span>
      <small>{suggestion.matchType} · {suggestion.subtitle}</small>
    </button>
  )
}

function Mdr1BreedFrequencyPanel({
  items,
}: {
  items: readonly Mdr1BreedFrequencyItem[]
}) {
  return (
    <section className="app-mdr1-breed-panel" aria-label="Породы риска и частота встречаемости">
      <header className="app-mdr1-breed-panel__header">
        <h2>Породы риска</h2>
        <span>частота</span>
      </header>

      <div className="app-mdr1-breed-list">
        {items.map((item) => (
          <article className="app-mdr1-breed-row" key={item.breed}>
            <div>
              <h3>{item.breed}</h3>
              {item.note ? <p>{item.note}</p> : null}
            </div>
            <strong>{item.frequency}</strong>
          </article>
        ))}
      </div>
    </section>
  )
}

function Mdr1TradeNamesSection({ item }: { item: Mdr1ReferenceItem }) {
  if (item.tradeNames.length === 0) {
    return null
  }

  return (
    <Mdr1ResultSection title="Торговые названия">
      <p>{item.tradeNames.map((tradeName) => tradeName.name).join(', ')}</p>
    </Mdr1ResultSection>
  )
}

function Mdr1ResultCard({
  item,
  selectedSuggestion,
}: {
  item: Mdr1ReferenceItem
  selectedSuggestion: Mdr1SearchSuggestion | undefined
}) {
  return (
    <article className="app-mdr1-result" data-status={item.status}>
      <header className="app-mdr1-result__header">
        <span>{mdr1StatusLabels[item.status]}</span>
        <h2>{item.russianName}</h2>
        <p>{item.englishName}</p>
        {selectedSuggestion ? (
          <small>
            Выбрано: {selectedSuggestion.matchType.toLowerCase()} · {selectedSuggestion.label}
          </small>
        ) : null}
      </header>

      <Mdr1ResultSection title="Фармакологическая группа">
        <p>{item.pharmacologicalGroup}</p>
      </Mdr1ResultSection>

      <Mdr1TradeNamesSection item={item} />

      <Mdr1ResultSection title="Статус при MDR1">
        <p>{mdr1StatusLabels[item.status]}</p>
      </Mdr1ResultSection>

      <Mdr1ResultSection title="Риск для mutant/normal">
        <p>{item.mutantNormalRisk}</p>
      </Mdr1ResultSection>

      <Mdr1ResultSection title="Риск для mutant/mutant">
        <p>{item.mutantMutantRisk}</p>
      </Mdr1ResultSection>

      <Mdr1ResultSection title="Клинические признаки токсичности">
        <Mdr1TextList items={item.toxicitySigns} />
      </Mdr1ResultSection>

      <Mdr1ResultSection title="Безопасный комментарий">
        <p>{item.safetyComment}</p>
      </Mdr1ResultSection>

      <Mdr1ResultSection title="Альтернативы">
        <Mdr1TextList items={item.alternatives} />
      </Mdr1ResultSection>
    </article>
  )
}

export default function Mdr1ReferencePage() {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [selectedSuggestion, setSelectedSuggestion] = useState<Mdr1SearchSuggestion>()
  const deferredSearch = useDeferredValue(search)

  const selectedItem = useMemo(
    () => (selectedId ? getMdr1ReferenceResultById(selectedId) : undefined),
    [selectedId],
  )

  const suggestions = useMemo(
    () => getMdr1Suggestions(deferredSearch),
    [deferredSearch],
  )

  const shouldShowSuggestions = selectedItem === undefined && search.trim().length > 0 && suggestions.length > 0
  const shouldShowEmptySearch = selectedItem === undefined && search.trim().length > 0 && suggestions.length === 0

  return (
    <AppScreen
      ariaLabel="Справочник проверки MDR1 VetTools"
      backLabel="Назад к справочнику"
      backTo="/reference"
      iconSrc="/app-icons/reference.png"
      screenClassName="app-mdr1-screen"
      title="Проверка MDR1"
    >
      <div className="app-mdr1-scroll">
        <section className="app-mdr1-panel" aria-label="Поиск действующего вещества или препарата">
          <label className="app-mdr1-field">
            <span>Действующее вещество или препарат</span>
            <input
              autoComplete="off"
              onChange={(event) => {
                setSearch(event.target.value)
                setSelectedId('')
                setSelectedSuggestion(undefined)
              }}
              placeholder="Например: лоперамид, Имодиум, Церения"
              type="search"
              value={search}
            />
          </label>

          {shouldShowSuggestions ? (
            <div className="app-mdr1-suggestions" role="listbox">
              {suggestions.map((suggestion) => (
                <Mdr1SuggestionButton
                  key={`${suggestion.id}-${suggestion.label}-${suggestion.matchType}`}
                  onSelect={(nextSuggestion) => {
                    setSelectedId(nextSuggestion.id)
                    setSearch(nextSuggestion.label)
                    setSelectedSuggestion(nextSuggestion)
                  }}
                  suggestion={suggestion}
                />
              ))}
            </div>
          ) : null}

          {shouldShowEmptySearch ? (
            <span className="app-mdr1-search-empty">
              В тестовом справочнике MDR1 такого вещества или препарата пока нет.
            </span>
          ) : null}
        </section>

        {selectedItem ? (
          <Mdr1ResultCard item={selectedItem} selectedSuggestion={selectedSuggestion} />
        ) : (
          <section className="app-mdr1-empty">
            Начните вводить действующее вещество или торговое название препарата, затем выберите пункт из подсказок.
          </section>
        )}

        <Mdr1BreedFrequencyPanel items={mdr1BreedFrequencyItems} />

        <p className="app-mdr1-note">
          Статусы относятся к пациентам с известной или предполагаемой мутацией MDR1/ABCB1. При неизвестном генотипе
          у пород риска безопаснее выбирать консервативный вариант и уточнять генетический статус.
        </p>
      </div>
    </AppScreen>
  )
}
