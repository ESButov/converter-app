import { useDeferredValue, useMemo, useState, type CSSProperties } from 'react'
import { toxicologyReferenceItems, type ToxicologyReferenceItem } from '../../data/toxicologyReference'
import { CalculatorForm } from '../../ui/CalculatorForm'

const styles = {
  searchBar: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'grid',
    gap: '6px',
    margin: '0 -40px 0',
    padding: '10px 40px',
    borderBottom: '1px solid #9ee3dd',
    backgroundColor: '#082332',
  },
  searchLabel: {
    display: 'grid',
    gap: '6px',
    color: '#f6fbfc',
    fontSize: '13px',
    fontWeight: 700,
  },
  searchInput: {
    width: '100%',
    height: '30px',
    padding: '2px 10px',
    border: '1.5px solid #d8f3f2',
    borderRadius: 0,
    backgroundColor: '#0a2a3a',
    boxSizing: 'border-box',
    color: '#f6fbfc',
    fontSize: '13px',
    fontWeight: 700,
    outline: 'none',
  },
  resultCount: {
    color: '#b8d6da',
    fontSize: '12px',
    fontWeight: 700,
    lineHeight: 1.3,
  },
  list: {
    display: 'grid',
    gap: '8px',
  },
  card: {
    border: '1px solid #9ee3dd',
    backgroundColor: '#0a2a3a',
  },
  summary: {
    display: 'grid',
    gap: '7px',
    padding: '10px',
    cursor: 'pointer',
    listStyle: 'none',
  },
  cardTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  cardTitle: {
    color: '#f6fbfc',
    fontSize: '15px',
    fontWeight: 800,
    lineHeight: 1.2,
  },
  chevron: {
    color: '#9ee3dd',
    fontSize: '18px',
    fontWeight: 800,
  },
  badgeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  badge: {
    padding: '2px 6px',
    border: '1px solid #426b75',
    color: '#d8f3f2',
    fontSize: '10px',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  content: {
    display: 'grid',
    gap: '10px',
    padding: '0 10px 10px',
  },
  section: {
    display: 'grid',
    gap: '6px',
  },
  sectionTitle: {
    color: '#9ee3dd',
    fontSize: '12px',
    fontWeight: 800,
    lineHeight: 1.2,
  },
  ul: {
    display: 'grid',
    gap: '4px',
    margin: 0,
    paddingLeft: '18px',
    color: '#f6fbfc',
    fontSize: '11px',
    fontWeight: 700,
    lineHeight: 1.35,
  },
  doseGrid: {
    display: 'grid',
    gap: '6px',
  },
  doseItem: {
    padding: '7px',
    border: '1px solid #426b75',
    color: '#f6fbfc',
    fontSize: '11px',
    fontWeight: 700,
    lineHeight: 1.35,
  },
  doseSpecies: {
    display: 'block',
    color: '#9ee3dd',
    fontSize: '11px',
    fontWeight: 800,
  },
  note: {
    display: 'block',
    marginTop: '4px',
    color: '#b8d6da',
    fontSize: '11px',
  },
  sources: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  sourceLink: {
    color: '#d8f3f2',
    fontSize: '11px',
    fontWeight: 700,
  },
  empty: {
    border: '1px solid #9ee3dd',
    padding: '12px',
    color: '#d8f3f2',
    fontSize: '12px',
    fontWeight: 700,
    textAlign: 'center',
  },
  safety: {
    margin: 0,
    color: '#b8d6da',
    fontSize: '11px',
    fontWeight: 700,
    lineHeight: 1.35,
  },
} satisfies Record<string, CSSProperties>

const normalizeSearch = (value: string) => value.trim().toLowerCase()

const getSearchText = (item: ToxicologyReferenceItem) => [
  item.title,
  ...item.aliases,
  ...item.antidotes,
  ...item.tags,
  ...item.clinicalSigns,
  ...item.labChanges,
].join(' ').toLowerCase()

function ListSection({
  items,
  title,
}: {
  items: readonly string[]
  title: string
}) {
  return (
    <section style={styles.section}>
      <span style={styles.sectionTitle}>{title}</span>
      <ul style={styles.ul}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

function DoseSection({
  items,
  title,
}: {
  items: ToxicologyReferenceItem['toxicDoses']
  title: string
}) {
  return (
    <section style={styles.section}>
      <span style={styles.sectionTitle}>{title}</span>
      <div style={styles.doseGrid}>
        {items.map((item) => (
          <span
            key={`${item.species}-${item.value}`}
            style={styles.doseItem}
          >
            <span style={styles.doseSpecies}>{item.species}</span>
            {item.value}
            {item.note ? <span style={styles.note}>{item.note}</span> : null}
          </span>
        ))}
      </div>
    </section>
  )
}

function ToxicologyCard({
  isOpen,
  item,
  onToggle,
}: {
  isOpen: boolean
  item: ToxicologyReferenceItem
  onToggle: () => void
}) {
  return (
    <details
      open={isOpen}
      style={styles.card}
    >
      <summary
        onClick={(event) => {
          event.preventDefault()
          onToggle()
        }}
        style={styles.summary}
      >
        <span style={styles.cardTitleRow}>
          <span style={styles.cardTitle}>{item.title}</span>
          <span
            aria-hidden="true"
            style={styles.chevron}
          >
            +
          </span>
        </span>
        <span style={styles.badgeRow}>
          {item.antidotes.slice(0, 4).map((antidote) => (
            <span
              key={antidote}
              style={styles.badge}
            >
              {antidote}
            </span>
          ))}
        </span>
      </summary>

      <div style={styles.content}>
        <ListSection
          items={item.clinicalSigns}
          title="Клиническая симптоматика"
        />
        <ListSection
          items={item.labChanges}
          title="Специфические лабораторные изменения"
        />
        <DoseSection
          items={item.toxicDoses}
          title="Токсические дозы для разных видов животных"
        />
        <DoseSection
          items={item.antidoteDoses}
          title="Дозы антидотов для разных видов животных"
        />
        <ListSection
          items={item.therapyPrinciples}
          title="Принципы терапии"
        />
        <section style={styles.section}>
          <span style={styles.sectionTitle}>Источники</span>
          <span style={styles.sources}>
            {item.sources.map((source) => (
              source.url ? (
                <a
                  href={source.url}
                  key={source.label}
                  rel="noreferrer"
                  style={styles.sourceLink}
                  target="_blank"
                >
                  {source.label}
                </a>
              ) : (
                <span
                  key={source.label}
                  style={styles.sourceLink}
                >
                  {source.label}
                </span>
              )
            ))}
          </span>
        </section>
      </div>
    </details>
  )
}

export default function ToxicologyReferencePage() {
  const [search, setSearch] = useState('')
  const [openItemId, setOpenItemId] = useState<string | null>(null)
  const deferredSearch = useDeferredValue(search)

  const filteredItems = useMemo(() => {
    const query = normalizeSearch(deferredSearch)

    if (!query) {
      return toxicologyReferenceItems
    }

    return toxicologyReferenceItems.filter((item) => getSearchText(item).includes(query))
  }, [deferredSearch])

  return (
    <CalculatorForm title="Токсикология">
      <div style={styles.searchBar}>
        <label style={styles.searchLabel}>
          Поиск по яду или антидоту
          <input
            aria-label="Поиск по яду или антидоту"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Например: парацетамол, налоксон, витамин K1"
            style={styles.searchInput}
            type="search"
            value={search}
          />
        </label>
        <span style={styles.resultCount}>Найдено: {filteredItems.length}</span>
      </div>

      <div style={styles.list}>
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <ToxicologyCard
              isOpen={openItemId === item.id}
              item={item}
              key={item.id}
              onToggle={() => setOpenItemId((currentId) => (
                currentId === item.id ? null : item.id
              ))}
            />
          ))
        ) : (
          <span style={styles.empty}>Ничего не найдено</span>
        )}
      </div>

      <p style={styles.safety}>
        Тестовая версия: перед клиническим использованием дозы нужно дополнительно сверить с актуальным
        протоколом клиники, токсикологической службой и инструкцией к конкретному препарату.
      </p>
    </CalculatorForm>
  )
}
