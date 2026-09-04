import { NavLink } from 'react-router-dom'
import AppBottomNavigation from '../../ui/AppBottomNavigation'
import '../home.css'

type ReferenceSection = {
  name: string
  to?: string
}

const referenceSections: ReferenceSection[] = [
  {
    name: 'Токсикология',
    to: '/reference/toxic',
  },
  {
    name: 'Справочник действующих веществ',
    to: '/reference/substances',
  },
  {
    name: 'Справочник ветеринарных препаратов',
    to: '/reference/preparations',
  },
]

export default function ReferencePage() {
  return (
    <main className="app-home-page" aria-label="VetTools">
      <div className="app-home-device" aria-label="Справочник VetTools">
        <div className="app-home-device__notch" aria-hidden="true" />

        <section className="app-home-screen">
          <header className="app-home-screen__header">
            <div className="app-home-screen__title-group">
              <p className="app-home-screen__app-name">VetTools</p>
              <h1 className="app-home-screen__title">Справочник</h1>
            </div>

            <img
              className="app-home-screen__app-icon"
              src="/app-icons/reference.png"
              alt=""
              aria-hidden="true"
            />
          </header>

          <nav className="app-home-link-list" aria-label="Разделы справочника">
            {referenceSections.map((section) => (
              section.to ? (
                <NavLink
                  key={section.name}
                  className="app-home-link-card"
                  to={section.to}
                >
                  <span className="app-home-link-card__marker" aria-hidden="true" />
                  <span className="app-home-link-card__label">{section.name}</span>
                  <span className="app-home-link-card__arrow" aria-hidden="true">
                    ›
                  </span>
                </NavLink>
              ) : (
                <button
                  key={section.name}
                  className="app-home-link-card app-home-link-card--disabled"
                  type="button"
                  disabled
                >
                  <span className="app-home-link-card__marker" aria-hidden="true" />
                  <span className="app-home-link-card__label">{section.name}</span>
                  <span className="app-home-link-card__arrow" aria-hidden="true">
                    ›
                  </span>
                </button>
              )
            ))}
          </nav>

          <AppBottomNavigation />
        </section>

        <div className="app-home-device__indicator" aria-hidden="true" />
      </div>
    </main>
  )
}
