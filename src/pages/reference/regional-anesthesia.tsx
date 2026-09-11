import { useMemo, useState, type ReactNode } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import {
  getRegionalBlockById,
  getRegionalBlocks,
  regionalAreaOptions,
  regionalNavigationOptions,
  regionalSpeciesOptions,
  type RegionalAnesthesiaBlock,
  type RegionalAreaId,
  type RegionalNavigationId,
  type RegionalSpeciesId,
} from '../../data/regionalAnesthesiaReference'
import AppScreen from '../../ui/AppScreen'
import './regional-anesthesia.css'

type OptionalRegionalAreaId = RegionalAreaId | 'all'
type OptionalRegionalNavigationId = RegionalNavigationId | 'all'

const areaFilterOptions: { id: OptionalRegionalAreaId; label: string }[] = [
  { id: 'all', label: 'Все области' },
  ...regionalAreaOptions,
]

const navigationFilterOptions: { id: OptionalRegionalNavigationId; label: string }[] = [
  { id: 'all', label: 'Все методы' },
  ...regionalNavigationOptions,
]

const getRegionalBlockPath = (block: RegionalAnesthesiaBlock) => (
  `/reference/regional-anesthesia/${block.id}`
)

function RegionalSelect<T extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: T) => void
  options: readonly { id: T; label: string }[]
  value: T
}) {
  return (
    <label className="app-regional-select">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function RegionalSection({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  return (
    <section className="app-regional-detail-section">
      <h3>{title}</h3>
      {children}
    </section>
  )
}

function RegionalTextList({ items }: { items: readonly string[] }) {
  return (
    <ul className="app-regional-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function RegionalBlockCard({ block }: { block: RegionalAnesthesiaBlock }) {
  return (
    <article className="app-regional-card app-regional-card--detail">
      <RegionalSection title="Уровень сложности">
        <p>{block.complexity}</p>
      </RegionalSection>

      <RegionalSection title="Показания">
        <RegionalTextList items={block.indications} />
      </RegionalSection>

      <RegionalSection title="Что блокирует">
        <p>{block.blocks}</p>
      </RegionalSection>

      <RegionalSection title="Препараты и дозы">
        <RegionalTextList items={block.drugsAndDoses} />
      </RegionalSection>

      <RegionalSection title="Безопасный объем">
        <p>{block.safeVolume}</p>
      </RegionalSection>

      <RegionalSection title="Риски">
        <RegionalTextList items={block.risks} />
      </RegionalSection>

      <RegionalSection title="Техника">
        <p>{block.technique}</p>
      </RegionalSection>
    </article>
  )
}

function RegionalBlockSummaryCard({ block }: { block: RegionalAnesthesiaBlock }) {
  return (
    <NavLink
      aria-label={`${block.title}. Открыть полную карточку блокады`}
      className="app-regional-card app-regional-card--summary"
      to={getRegionalBlockPath(block)}
    >
      <header className="app-regional-summary-header">
        <h2>{block.title}</h2>
        <span className="app-regional-card__arrow" aria-hidden="true">
          ›
        </span>
      </header>

      <RegionalSection title="Показания">
        <RegionalTextList items={block.indications} />
      </RegionalSection>

      <RegionalSection title="Что блокирует">
        <p>{block.blocks}</p>
      </RegionalSection>
    </NavLink>
  )
}

function RegionalAnesthesiaListPage() {
  const [species, setSpecies] = useState<RegionalSpeciesId>('dog')
  const [area, setArea] = useState<OptionalRegionalAreaId>('all')
  const [navigation, setNavigation] = useState<OptionalRegionalNavigationId>('all')

  const filteredBlocks = useMemo(
    () => getRegionalBlocks(species, area, navigation),
    [area, navigation, species],
  )

  return (
    <AppScreen
      ariaLabel="Справочник регионарной анестезии VetTools"
      backLabel="Назад к справочнику"
      backTo="/reference"
      iconSrc="/app-icons/reference.png"
      screenClassName="app-regional-screen"
      title="Регионарная анестезия"
    >
      <div className="app-regional-scroll">
        <section className="app-regional-filters" aria-label="Фильтр регионарной анестезии">
          <RegionalSelect
            label="Вид животного"
            onChange={setSpecies}
            options={regionalSpeciesOptions}
            value={species}
          />
          <RegionalSelect
            label="Область"
            onChange={setArea}
            options={areaFilterOptions}
            value={area}
          />
          <RegionalSelect
            label="Метод навигации"
            onChange={setNavigation}
            options={navigationFilterOptions}
            value={navigation}
          />
          <span className="app-regional-result-count">
            Найдено: {filteredBlocks.length}
          </span>
        </section>

        {filteredBlocks.length > 0 ? (
          <div className="app-regional-card-list" aria-label="Список блокад">
            {filteredBlocks.map((block) => (
              <RegionalBlockSummaryCard block={block} key={block.id} />
            ))}
          </div>
        ) : (
          <section className="app-regional-empty">
            Для выбранной комбинации пока нет оформленных блокад.
          </section>
        )}

        <p className="app-regional-note">
          Справочник не заменяет клинический протокол: суммарную дозу местного анестетика считают по массе,
          концентрации и всем выполненным блокадам за процедуру.
        </p>
      </div>
    </AppScreen>
  )
}

function RegionalAnesthesiaDetailPage({ block }: { block: RegionalAnesthesiaBlock }) {
  return (
    <AppScreen
      ariaLabel="Карточка регионарной анестезии VetTools"
      backLabel="Назад к блокадам"
      backTo="/reference/regional-anesthesia"
      iconSrc="/app-icons/reference.png"
      screenClassName="app-regional-screen"
      title={block.title}
    >
      <div className="app-regional-scroll">
        <RegionalBlockCard block={block} />
      </div>
    </AppScreen>
  )
}

function RegionalAnesthesiaUnavailablePage() {
  return (
    <AppScreen
      ariaLabel="Карточка регионарной анестезии VetTools"
      backLabel="Назад к блокадам"
      backTo="/reference/regional-anesthesia"
      iconSrc="/app-icons/reference.png"
      screenClassName="app-regional-screen"
      title="Регионарная анестезия"
    >
      <div className="app-regional-scroll">
        <section className="app-regional-empty">Карточка блокады не найдена.</section>
      </div>
    </AppScreen>
  )
}

export default function RegionalAnesthesiaReferencePage() {
  const { blockId } = useParams()

  if (blockId === undefined) {
    return <RegionalAnesthesiaListPage />
  }

  const block = getRegionalBlockById(blockId)

  if (block === undefined) {
    return <RegionalAnesthesiaUnavailablePage />
  }

  return <RegionalAnesthesiaDetailPage block={block} />
}
