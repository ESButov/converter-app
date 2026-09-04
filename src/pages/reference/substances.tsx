import { Fragment, useDeferredValue, useMemo, useState, type ReactNode } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import {
  activeSubstanceReferenceItems,
  type ActiveSubstanceReferenceItem,
} from '../../data/activeSubstancesReference'
import '../home.css'
import './toxic.css'

const normalizeSearch = (value: string) => value.trim().toLowerCase()

const getSubstanceItemPath = (item: ActiveSubstanceReferenceItem) => `/reference/substances/${item.id}`

const getSubstanceTitle = (item: ActiveSubstanceReferenceItem) => (
  `${item.russianName} / ${item.englishName}`
)

const getSubstanceSearchText = (item: ActiveSubstanceReferenceItem) => [
  item.id,
  item.russianName,
  item.englishName,
  item.mainPharmacologicalGroup,
  ...item.pharmacologicalGroups,
  ...item.tradeNames.map((tradeName) => tradeName.name),
  ...item.tags,
].join(' ').toLowerCase()

function ReferenceBottomNavigation() {
  return (
    <nav className="app-home-bottom-nav" aria-label="Основная навигация">
      <NavLink className="app-home-bottom-nav__item" to="/reference">
        <img src="/app-icons/reference-object.png" alt="" aria-hidden="true" />
        <span>Справочник</span>
      </NavLink>

      <NavLink className="app-home-bottom-nav__item" to="/home">
        <img src="/app-icons/home-object.png" alt="" aria-hidden="true" />
        <span>Главная</span>
      </NavLink>

      <NavLink className="app-home-bottom-nav__item" to="/settings">
        <img src="/app-icons/settings-object.png" alt="" aria-hidden="true" />
        <span>Настройки</span>
      </NavLink>
    </nav>
  )
}

function SubstancesShell({
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
      <div className="app-home-device" aria-label="Справочник действующих веществ VetTools">
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

          <ReferenceBottomNavigation />
        </section>

        <div className="app-home-device__indicator" aria-hidden="true" />
      </div>
    </main>
  )
}

function SubstancesFilterMenu({
  activeGroup,
  groups,
  isOpen,
  onActiveGroupChange,
  onOpenChange,
}: {
  activeGroup: string
  groups: readonly string[]
  isOpen: boolean
  onActiveGroupChange: (group: string) => void
  onOpenChange: (isOpen: boolean) => void
}) {
  return (
    <>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Фильтр по фармакологической группе"
        className="app-toxic-filter-button"
        data-active={isOpen || activeGroup !== 'all'}
        onClick={() => onOpenChange(!isOpen)}
        type="button"
      >
        ≡
      </button>

      {isOpen ? (
        <div
          aria-label="Фильтр по фармакологической группе"
          className="app-toxic-filter-menu"
          role="menu"
        >
          <span className="app-toxic-filter-menu__title">Группа</span>
          <button
            aria-checked={activeGroup === 'all'}
            className="app-toxic-filter-menu__option"
            data-active={activeGroup === 'all'}
            onClick={() => {
              onActiveGroupChange('all')
              onOpenChange(false)
            }}
            role="menuitemradio"
            type="button"
          >
            Все группы
          </button>
          {groups.map((group) => (
            <button
              aria-checked={activeGroup === group}
              className="app-toxic-filter-menu__option"
              data-active={activeGroup === group}
              key={group}
              onClick={() => {
                onActiveGroupChange(group)
                onOpenChange(false)
              }}
              role="menuitemradio"
              type="button"
            >
              {group}
            </button>
          ))}
        </div>
      ) : null}
    </>
  )
}

function SubstancesSearchToolbar({
  activeGroup,
  filteredItemsCount,
  groups,
  isFilterOpen,
  onActiveGroupChange,
  onFilterOpenChange,
  onSearchChange,
  search,
}: {
  activeGroup: string
  filteredItemsCount: number
  groups: readonly string[]
  isFilterOpen: boolean
  onActiveGroupChange: (group: string) => void
  onFilterOpenChange: (isOpen: boolean) => void
  onSearchChange: (value: string) => void
  search: string
}) {
  const activeGroupLabel = activeGroup === 'all' ? 'все' : activeGroup

  return (
    <section className="app-toxic-search-panel" aria-label="Поиск по действующим веществам">
      <div className="app-toxic-toolbar">
        <label className="app-toxic-search-label">
          Поиск
          <input
            aria-label="Поиск по действующему веществу"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Например: фитоменадион, Конафлион"
            type="search"
            value={search}
          />
        </label>

        <SubstancesFilterMenu
          activeGroup={activeGroup}
          groups={groups}
          isOpen={isFilterOpen}
          onActiveGroupChange={onActiveGroupChange}
          onOpenChange={onFilterOpenChange}
        />
      </div>

      <span className="app-toxic-result-count">
        Найдено: {filteredItemsCount} · группа: {activeGroupLabel}
      </span>
    </section>
  )
}

function SubstancesListItem({ item }: { item: ActiveSubstanceReferenceItem }) {
  return (
    <li>
      <NavLink
        aria-label={`${item.russianName}. Открыть карточку действующего вещества`}
        className="app-home-link-card app-toxic-card"
        to={getSubstanceItemPath(item)}
      >
        <span className="app-home-link-card__marker" aria-hidden="true" />
        <span className="app-toxic-card__body">
          <span className="app-toxic-card__title">{getSubstanceTitle(item)}</span>
          <span className="app-toxic-card__group">{item.mainPharmacologicalGroup}</span>
        </span>
        <span className="app-home-link-card__arrow" aria-hidden="true">
          ›
        </span>
      </NavLink>
    </li>
  )
}

function SubstancesListPage() {
  const [search, setSearch] = useState('')
  const [activeGroup, setActiveGroup] = useState('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const deferredSearch = useDeferredValue(search)

  const groups = useMemo(() => (
    Array.from(new Set(activeSubstanceReferenceItems.map((item) => item.mainPharmacologicalGroup)))
  ), [])

  const filteredItems = useMemo(() => {
    const query = normalizeSearch(deferredSearch)

    return activeSubstanceReferenceItems.filter((item) => {
      const matchesGroup = activeGroup === 'all' || item.mainPharmacologicalGroup === activeGroup
      const matchesSearch = !query || getSubstanceSearchText(item).includes(query)

      return matchesGroup && matchesSearch
    })
  }, [activeGroup, deferredSearch])

  return (
    <SubstancesShell
      backLabel="Назад к справочнику"
      backTo="/reference"
      title="Действующие вещества"
    >
      <div className="app-toxic-scroll">
        <SubstancesSearchToolbar
          activeGroup={activeGroup}
          filteredItemsCount={filteredItems.length}
          groups={groups}
          isFilterOpen={isFilterOpen}
          onActiveGroupChange={setActiveGroup}
          onFilterOpenChange={setIsFilterOpen}
          onSearchChange={setSearch}
          search={search}
        />

        {filteredItems.length > 0 ? (
          <ul
            aria-label="Список действующих веществ"
            className="app-toxic-list"
          >
            {filteredItems.map((item) => (
              <SubstancesListItem
                item={item}
                key={item.id}
              />
            ))}
          </ul>
        ) : (
          <span className="app-toxic-empty">Ничего не найдено</span>
        )}
      </div>
    </SubstancesShell>
  )
}

function TextSection({
  items,
  title,
}: {
  items: readonly string[]
  title: string
}) {
  return (
    <section className="app-toxic-detail-section">
      <h2>{title}</h2>
      {items.length > 0 ? (
        <ul className="app-toxic-detail-list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="app-toxic-detail-empty">Данные не указаны.</p>
      )}
    </section>
  )
}

function DosageSection({ item }: { item: ActiveSubstanceReferenceItem }) {
  return (
    <section className="app-toxic-detail-section">
      <h2>Дозировки и пути введения по видам животных</h2>
      <div className="app-toxic-dose-list">
        {item.dosages.map((dosage) => (
          <article className="app-toxic-dose-row" key={`${dosage.species}-${dosage.dosage}`}>
            <h3>{dosage.species}</h3>
            <p>{dosage.dosage}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function TradeNamesSection({ item }: { item: ActiveSubstanceReferenceItem }) {
  if (item.tradeNames.length === 0) {
    return null
  }

  return (
    <section className="app-toxic-detail-section" aria-label="Торговые названия">
      <p className="app-toxic-inline-links">
        {item.tradeNames.map((tradeName, index) => (
          <Fragment key={tradeName.preparationId}>
            {index > 0 ? ', ' : null}
            <NavLink to={`/reference/preparations/${tradeName.preparationId}`}>
              {tradeName.name}
            </NavLink>
          </Fragment>
        ))}
      </p>
    </section>
  )
}

function SubstanceDetailPage({ item }: { item: ActiveSubstanceReferenceItem }) {
  return (
    <SubstancesShell
      backLabel="Назад к действующим веществам"
      backTo="/reference/substances"
      title={item.russianName}
    >
      <div className="app-toxic-scroll">
        <article className="app-toxic-detail-card">
          <span className="app-toxic-detail-card__group">{item.mainPharmacologicalGroup}</span>
          <h2>{getSubstanceTitle(item)}</h2>
          <p>{item.pharmacologicalGroups.join(', ')}</p>
        </article>

        <TradeNamesSection item={item} />
        <TextSection items={item.action} title="Фармакологическое действие" />
        <TextSection items={item.use} title="Использование" />
        <DosageSection item={item} />
        <TextSection items={item.contraindications} title="Противопоказания/осторожность" />
        <TextSection items={item.interactions} title="Важные взаимодействия" />
        <TextSection items={item.adverseEffects} title="Побочные эффекты" />
        {item.additionalInfo.length > 0 ? (
          <TextSection items={item.additionalInfo} title="Дополнительная информация" />
        ) : null}
      </div>
    </SubstancesShell>
  )
}

function SubstanceUnavailablePage() {
  return (
    <SubstancesShell
      backLabel="Назад к действующим веществам"
      backTo="/reference/substances"
      title="Действующие вещества"
    >
      <div className="app-toxic-scroll">
        <span className="app-toxic-empty">Карточка действующего вещества не найдена.</span>
      </div>
    </SubstancesShell>
  )
}

export default function ActiveSubstancesReferencePage() {
  const { substanceId } = useParams()

  if (substanceId === undefined) {
    return <SubstancesListPage />
  }

  const item = activeSubstanceReferenceItems.find((referenceItem) => referenceItem.id === substanceId)

  if (item === undefined) {
    return <SubstanceUnavailablePage />
  }

  return <SubstanceDetailPage item={item} />
}
