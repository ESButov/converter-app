import { useDeferredValue, useMemo, useState, type ReactNode } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { toxicologyReferenceItems, type ToxicologyReferenceItem } from '../../data/toxicologyReference'
import AppBottomNavigation from '../../ui/AppBottomNavigation'
import '../home.css'
import './toxic.css'

type SearchModeId = 'clinicalSigns' | 'labChanges' | 'toxin'

type SearchMode = {
  getSearchText: (item: ToxicologyReferenceItem) => string
  id: SearchModeId
  label: string
  placeholder: string
  resultLabel: string
}

const searchModes: readonly SearchMode[] = [
  {
    id: 'toxin',
    label: 'По токсину',
    placeholder: 'Например: парацетамол, антифриз, ФОС',
    resultLabel: 'токсин',
    getSearchText: (item) => [
      item.title,
      ...item.aliases,
      ...item.tags,
    ].join(' '),
  },
  {
    id: 'clinicalSigns',
    label: 'По клинической симптоматике',
    placeholder: 'Например: судороги, рвота, брадикардия',
    resultLabel: 'симптоматика',
    getSearchText: (item) => [
      ...item.clinicalSigns,
      ...item.tags,
    ].join(' '),
  },
  {
    id: 'labChanges',
    label: 'По лабораторным изменениям',
    placeholder: 'Например: гипогликемия, ацидоз, метгемоглобин',
    resultLabel: 'лаборатория',
    getSearchText: (item) => [
      ...item.labChanges,
      ...item.tags,
    ].join(' '),
  },
]

const normalizeSearch = (value: string) => value.trim().toLowerCase()

const getActiveSearchMode = (modeId: SearchModeId) => (
  searchModes.find((mode) => mode.id === modeId) ?? searchModes[0]
)

const getToxicologyItemPath = (item: ToxicologyReferenceItem) => `/reference/toxic/${item.id}`

const getToxicologyGroup = (item: ToxicologyReferenceItem) => (
  item.pharmacologicalGroup
)

const getVisibleAliases = (item: ToxicologyReferenceItem) => (
  item.aliases.filter((alias) => /[а-яА-ЯёЁ]/.test(alias)).slice(0, 5)
)

const isDetailedToxicologyItem = (item: ToxicologyReferenceItem) => (
  toxicologyReferenceItems.some((referenceItem) => referenceItem.id === item.id)
)

function ToxicologyShell({
  backLabel,
  backTo,
  children,
  title,
}: {
  backLabel: string
  backTo: string
  children: ReactNode
  title: string
}) {
  return (
    <main className="app-home-page" aria-label="VetTools">
      <div className="app-home-device" aria-label="Токсикология VetTools">
        <div className="app-home-device__notch" aria-hidden="true" />

        <section className="app-home-screen app-toxic-screen">
          <header className="app-home-screen__header">
            <div className="app-home-screen__title-group">
              <p className="app-home-screen__app-name">VetTools</p>
              <NavLink className="app-toxic-back-link" to={backTo}>
                {backLabel}
              </NavLink>
              <h1 className="app-home-screen__title">{title}</h1>
            </div>

            <img
              className="app-home-screen__app-icon"
              src="/app-icons/reference.png"
              alt=""
              aria-hidden="true"
            />
          </header>

          {children}

          <AppBottomNavigation />
        </section>

        <div className="app-home-device__indicator" aria-hidden="true" />
      </div>
    </main>
  )
}

function ToxicologyListItem({ item }: { item: ToxicologyReferenceItem }) {
  const content = (
    <>
      <span className="app-home-link-card__marker" aria-hidden="true" />
      <span className="app-toxic-card__body">
        <span className="app-toxic-card__title">{item.title}</span>
        <span className="app-toxic-card__group">{getToxicologyGroup(item)}</span>
      </span>
      <span className="app-home-link-card__arrow" aria-hidden="true">
        ›
      </span>
    </>
  )

  return (
    <li>
      {isDetailedToxicologyItem(item) ? (
        <NavLink
          aria-label={`${item.title}. Открыть карточку яда`}
          className="app-home-link-card app-toxic-card"
          to={getToxicologyItemPath(item)}
        >
          {content}
        </NavLink>
      ) : (
        <button
          aria-label={`${item.title}. Карточка яда пока не оформлена`}
          className="app-home-link-card app-home-link-card--disabled app-toxic-card"
          disabled
          type="button"
        >
          {content}
        </button>
      )}
    </li>
  )
}

function ToxicologySearchToolbar({
  activeSearchMode,
  filteredItemsCount,
  isFilterOpen,
  onFilterOpenChange,
  onSearchChange,
  onSearchModeChange,
  search,
  searchModeId,
}: {
  activeSearchMode: SearchMode
  filteredItemsCount: number
  isFilterOpen: boolean
  onFilterOpenChange: (isOpen: boolean) => void
  onSearchChange: (value: string) => void
  onSearchModeChange: (modeId: SearchModeId) => void
  search: string
  searchModeId: SearchModeId
}) {
  return (
    <section className="app-toxic-search-panel" aria-label="Поиск по токсикологии">
      <div className="app-toxic-toolbar">
        <label className="app-toxic-search-label">
          Поиск
          <input
            aria-label="Поиск по справочнику токсикологии"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={activeSearchMode.placeholder}
            type="search"
            value={search}
          />
        </label>
        <button
          aria-expanded={isFilterOpen}
          aria-haspopup="menu"
          aria-label="Фильтр"
          className="app-toxic-filter-button"
          data-active={isFilterOpen}
          onClick={() => onFilterOpenChange(!isFilterOpen)}
          type="button"
        >
          ≡
        </button>
      </div>

      {isFilterOpen ? (
        <div
          aria-label="Фильтр поиска"
          className="app-toxic-filter-menu"
          role="menu"
        >
          <span className="app-toxic-filter-menu__title">Искать</span>
          {searchModes.map((mode) => {
            const isActive = mode.id === searchModeId

            return (
              <button
                aria-checked={isActive}
                className="app-toxic-filter-menu__option"
                data-active={isActive}
                key={mode.id}
                onClick={() => {
                  onSearchModeChange(mode.id)
                  onFilterOpenChange(false)
                }}
                role="menuitemradio"
                type="button"
              >
                {mode.label}
              </button>
            )
          })}
        </div>
      ) : null}

      <span className="app-toxic-result-count">
        Найдено: {filteredItemsCount} · фильтр: {activeSearchMode.resultLabel}
      </span>
    </section>
  )
}

function ToxicologyListPage() {
  const [search, setSearch] = useState('')
  const [searchModeId, setSearchModeId] = useState<SearchModeId>('toxin')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const deferredSearch = useDeferredValue(search)

  const activeSearchMode = useMemo(() => getActiveSearchMode(searchModeId), [searchModeId])

  const filteredItems = useMemo(() => {
    const query = normalizeSearch(deferredSearch)

    if (!query) {
      return toxicologyReferenceItems
    }

    return toxicologyReferenceItems.filter((item) => (
      activeSearchMode.getSearchText(item).toLowerCase().includes(query)
    ))
  }, [activeSearchMode, deferredSearch])

  return (
    <ToxicologyShell
      backLabel="Назад к справочнику"
      backTo="/reference"
      title="Токсикология"
    >
      <div className="app-toxic-scroll">
        <ToxicologySearchToolbar
          activeSearchMode={activeSearchMode}
          filteredItemsCount={filteredItems.length}
          isFilterOpen={isFilterOpen}
          onFilterOpenChange={setIsFilterOpen}
          onSearchChange={setSearch}
          onSearchModeChange={setSearchModeId}
          search={search}
          searchModeId={searchModeId}
        />

        {filteredItems.length > 0 ? (
          <ul
            aria-label="Список ядов и токсинов"
            className="app-toxic-list"
          >
            {filteredItems.map((item) => (
              <ToxicologyListItem
                item={item}
                key={item.id}
              />
            ))}
          </ul>
        ) : (
          <span className="app-toxic-empty">Ничего не найдено</span>
        )}

        <p className="app-toxic-safety-note">
          Тестовая версия: перед клиническим использованием дозы нужно дополнительно сверить с актуальным
          протоколом клиники, токсикологической службой и инструкцией к конкретному препарату.
        </p>
      </div>
    </ToxicologyShell>
  )
}

function ToxicologyTextList({ items }: { items: readonly string[] }) {
  return (
    <ul className="app-toxic-detail-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function ToxicologyDoseList({
  emptyText,
  items,
}: {
  emptyText: string
  items: ToxicologyReferenceItem['toxicDoses']
}) {
  if (items.length === 0) {
    return <p className="app-toxic-detail-empty">{emptyText}</p>
  }

  return (
    <div className="app-toxic-dose-list">
      {items.map((item) => (
        <article
          className="app-toxic-dose-row"
          key={`${item.species}-${item.value}`}
        >
          <h3>{item.species}</h3>
          <p>{item.value}</p>
          {item.note ? <span>{item.note}</span> : null}
        </article>
      ))}
    </div>
  )
}

function ToxicologyDetailSection({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  return (
    <section className="app-toxic-detail-section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function ToxicologyDetailPage({ item }: { item: ToxicologyReferenceItem }) {
  return (
    <ToxicologyShell
      backLabel="Назад ко всем ядам"
      backTo="/reference/toxic"
      title={item.title}
    >
      <div className="app-toxic-scroll">
        <article className="app-toxic-detail-card">
          <span className="app-toxic-detail-card__group">{getToxicologyGroup(item)}</span>
          <h2>{item.title}</h2>
          <p>{getVisibleAliases(item).join(', ')}</p>
        </article>

        <ToxicologyDetailSection title="Клиническая симптоматика">
          <ToxicologyTextList items={item.clinicalSigns} />
        </ToxicologyDetailSection>

        <ToxicologyDetailSection title="Специфические лабораторные изменения">
          <ToxicologyTextList items={item.labChanges} />
        </ToxicologyDetailSection>

        <ToxicologyDetailSection title="Токсические дозы для разных видов животных">
          <ToxicologyDoseList
            emptyText="Данные по токсической дозе не указаны."
            items={item.toxicDoses}
          />
        </ToxicologyDetailSection>

        <ToxicologyDetailSection title="Дозы антидотов для разных видов животных">
          <ToxicologyDoseList
            emptyText="Антидот отсутствует."
            items={item.antidoteDoses}
          />
          {item.calculatorLinks?.length ? (
            <div className="app-toxic-detail-card__links">
              {item.calculatorLinks.map((link) => (
                <NavLink
                  className="app-toxic-calculator-link"
                  key={link.to}
                  to={link.to}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          ) : null}
        </ToxicologyDetailSection>

        <ToxicologyDetailSection title="Принципы терапии">
          <ToxicologyTextList items={item.therapyPrinciples} />
        </ToxicologyDetailSection>

        <ToxicologyDetailSection title="Источники">
          <ul className="app-toxic-source-list">
            {item.sources.map((source) => (
              <li key={source.label}>
                {source.url ? (
                  <a href={source.url} rel="noreferrer" target="_blank">
                    {source.label}
                  </a>
                ) : (
                  source.label
                )}
              </li>
            ))}
          </ul>
        </ToxicologyDetailSection>
      </div>
    </ToxicologyShell>
  )
}

function ToxicologyUnavailablePage({ item }: { item: ToxicologyReferenceItem | undefined }) {
  return (
    <ToxicologyShell
      backLabel="Назад ко всем ядам"
      backTo="/reference/toxic"
      title="Токсикология"
    >
      <div className="app-toxic-scroll">
        <span className="app-toxic-empty">
          {item === undefined
            ? 'Карточка не найдена.'
            : `Карточка для раздела «${item.title}» пока не оформлена.`}
        </span>
      </div>
    </ToxicologyShell>
  )
}

export default function ToxicologyReferencePage() {
  const { itemId } = useParams()

  if (itemId === undefined) {
    return <ToxicologyListPage />
  }

  const item = toxicologyReferenceItems.find((referenceItem) => referenceItem.id === itemId)

  if (item === undefined || !isDetailedToxicologyItem(item)) {
    return <ToxicologyUnavailablePage item={item} />
  }

  return <ToxicologyDetailPage item={item} />
}
