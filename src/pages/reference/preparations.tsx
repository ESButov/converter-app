import { Fragment, useDeferredValue, useMemo, useState, type ReactNode } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import {
  veterinaryPreparationReferenceItems,
  type VeterinaryPreparationReferenceItem,
} from '../../data/veterinaryPreparationsReference'
import AppBottomNavigation from '../../ui/AppBottomNavigation'
import '../home.css'
import './toxic.css'

const normalizeSearch = (value: string) => value.trim().toLowerCase()

const getPreparationItemPath = (item: VeterinaryPreparationReferenceItem) => (
  `/reference/preparations/${item.id}`
)

const getPreparationSearchText = (item: VeterinaryPreparationReferenceItem) => [
  item.name,
  item.englishName,
  item.form,
  item.dosage,
  item.manufacturer,
  ...item.pharmacologicalGroups,
  ...item.activeSubstances.flatMap((substance) => [substance.id ?? '', substance.name]),
  ...item.instructionSections.flatMap((section) => [section.title, ...section.items]),
].join(' ').toLowerCase()

const getPreparationActiveSubstanceIds = (item: VeterinaryPreparationReferenceItem) => (
  new Set(item.activeSubstances.flatMap((substance) => (
    substance.id === undefined ? [] : [substance.id]
  )))
)

const getAnalogPreparations = (item: VeterinaryPreparationReferenceItem) => {
  const activeSubstanceIds = getPreparationActiveSubstanceIds(item)

  if (activeSubstanceIds.size === 0) {
    return []
  }

  return veterinaryPreparationReferenceItems.filter((referenceItem) => (
    referenceItem.id !== item.id
    && referenceItem.activeSubstances.some((substance) => (
      substance.id !== undefined && activeSubstanceIds.has(substance.id)
    ))
  ))
}

function PreparationsShell({
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
      <div className="app-home-device" aria-label="Справочник ветеринарных препаратов VetTools">
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

function PreparationListItem({ item }: { item: VeterinaryPreparationReferenceItem }) {
  return (
    <li>
      <NavLink
        aria-label={`${item.name}. Открыть карточку ветеринарного препарата`}
        className="app-home-link-card app-toxic-card"
        to={getPreparationItemPath(item)}
      >
        <span className="app-home-link-card__marker" aria-hidden="true" />
        <span className="app-toxic-card__body">
          <span className="app-toxic-card__title">{item.name}</span>
          <span className="app-toxic-card__group">
            {item.pharmacologicalGroups.join(', ')}
          </span>
        </span>
        <span className="app-home-link-card__arrow" aria-hidden="true">
          ›
        </span>
      </NavLink>
    </li>
  )
}

function PreparationsListPage() {
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)

  const filteredItems = useMemo(() => {
    const query = normalizeSearch(deferredSearch)

    if (!query) {
      return veterinaryPreparationReferenceItems
    }

    return veterinaryPreparationReferenceItems.filter((item) => (
      getPreparationSearchText(item).includes(query)
    ))
  }, [deferredSearch])

  return (
    <PreparationsShell
      backLabel="Назад к справочнику"
      backTo="/reference"
      title="Ветеринарные препараты"
    >
      <div className="app-toxic-scroll">
        <section className="app-toxic-search-panel" aria-label="Панель поиска по ветеринарным препаратам">
          <div className="app-toxic-toolbar">
            <label className="app-toxic-search-label">
              Поиск
              <input
                aria-label="Поиск по ветеринарным препаратам"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Например: Конафлион, фитоменадион"
                type="search"
                value={search}
              />
            </label>
          </div>
          <span className="app-toxic-result-count">Найдено: {filteredItems.length}</span>
        </section>

        {filteredItems.length > 0 ? (
          <ul
            aria-label="Список ветеринарных препаратов"
            className="app-toxic-list"
          >
            {filteredItems.map((item) => (
              <PreparationListItem item={item} key={item.id} />
            ))}
          </ul>
        ) : (
          <span className="app-toxic-empty">Ничего не найдено</span>
        )}
      </div>
    </PreparationsShell>
  )
}

function DetailField({
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

function AnalogPreparationsSection({ item }: { item: VeterinaryPreparationReferenceItem }) {
  const analogs = getAnalogPreparations(item)

  if (analogs.length === 0) {
    return null
  }

  return (
    <DetailField title="Аналоги">
      <p className="app-toxic-inline-links">
        {analogs.map((analog, index) => (
          <Fragment key={analog.id}>
            {index > 0 ? ', ' : null}
            <NavLink to={getPreparationItemPath(analog)}>{analog.name}</NavLink>
          </Fragment>
        ))}
      </p>
    </DetailField>
  )
}

function PreparationDetailPage({ item }: { item: VeterinaryPreparationReferenceItem }) {
  return (
    <PreparationsShell
      backLabel="Назад к ветеринарным препаратам"
      backTo="/reference/preparations"
      title={item.name}
    >
      <div className="app-toxic-scroll">
        <article className="app-toxic-detail-card">
          <span className="app-toxic-detail-card__group">
            {item.pharmacologicalGroups.join(', ')}
          </span>
          <h2>{item.name}</h2>
          <p>{item.englishName}</p>
        </article>

        <DetailField title="Действующее вещество">
          <ul className="app-toxic-source-list">
            {item.activeSubstances.map((substance) => (
              <li key={`${substance.id ?? substance.name}-${substance.name}`}>
                {substance.id === undefined ? (
                  <span>{substance.name}</span>
                ) : (
                  <NavLink to={`/reference/substances/${substance.id}`}>
                    {substance.name}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </DetailField>

        <DetailField title="Форма выпуска">
          <p className="app-toxic-detail-empty">{item.form}</p>
        </DetailField>

        <DetailField title="Дозировка">
          <p className="app-toxic-detail-empty">{item.dosage}</p>
        </DetailField>

        <DetailField title="Производитель">
          <p className="app-toxic-detail-empty">{item.manufacturer}</p>
        </DetailField>

        <AnalogPreparationsSection item={item} />

        {item.instructionSections.map((section) => (
          <DetailField key={section.title} title={section.title}>
            {section.items.length === 1 ? (
              <p className="app-toxic-detail-empty">{section.items[0]}</p>
            ) : (
              <ul className="app-toxic-detail-list">
                {section.items.map((sectionItem) => (
                  <li key={sectionItem}>{sectionItem}</li>
                ))}
              </ul>
            )}
          </DetailField>
        ))}
      </div>
    </PreparationsShell>
  )
}

function PreparationUnavailablePage() {
  return (
    <PreparationsShell
      backLabel="Назад к ветеринарным препаратам"
      backTo="/reference/preparations"
      title="Ветеринарные препараты"
    >
      <div className="app-toxic-scroll">
        <span className="app-toxic-empty">Карточка ветеринарного препарата не найдена.</span>
      </div>
    </PreparationsShell>
  )
}

export default function VeterinaryPreparationsReferencePage() {
  const { preparationId } = useParams()

  if (preparationId === undefined) {
    return <PreparationsListPage />
  }

  const item = veterinaryPreparationReferenceItems.find((referenceItem) => (
    referenceItem.id === preparationId
  ))

  if (item === undefined) {
    return <PreparationUnavailablePage />
  }

  return <PreparationDetailPage item={item} />
}
