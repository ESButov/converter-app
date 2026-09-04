import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { calculatorGroups } from '../data/calculators'
import AppBottomNavigation from '../ui/AppBottomNavigation'
import FavoriteCalculatorButton from '../ui/FavoriteCalculatorButton'
import { useFavoriteCalculatorState } from '../ui/favoriteCalculators'
import './home.css'

export default function HomePage() {
  const [openGroupId, setOpenGroupId] = useState<string | null>(null)
  const { favoriteIdSet, toggleFavorite } = useFavoriteCalculatorState()

  const handleGroupToggle = (groupId: string) => {
    setOpenGroupId((currentGroupId) => (
      currentGroupId === groupId ? null : groupId
    ))
  }

  return (
    <main className="app-home-page" aria-label="VetTools">
      <div className="app-home-device" aria-label="Новая домашняя страница VetTools">
        <div className="app-home-device__notch" aria-hidden="true" />

        <section className="app-home-screen">
          <header className="app-home-screen__header">
            <div className="app-home-screen__title-group">
              <p className="app-home-screen__app-name">VetTools</p>
              <h1 className="app-home-screen__title">Калькуляторы</h1>
            </div>

            <img
              className="app-home-screen__app-icon"
              src="/app-icons/home.png"
              alt=""
              aria-hidden="true"
            />
          </header>

          <div className="app-home-group-list" aria-label="Группы калькуляторов">
            {calculatorGroups.map((group) => {
              const isOpen = openGroupId === group.id
              const contentId = `app-home-group-${group.id}`

              return (
                <section
                  key={group.id}
                  className="app-home-group"
                >
                  <button
                    className="app-home-group__button"
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    onClick={() => handleGroupToggle(group.id)}
                  >
                    <span className="app-home-group__name">{group.name}</span>
                    <span className="app-home-group__count">{group.routes.length}</span>
                    <span className="app-home-group__chevron" aria-hidden="true">
                      ›
                    </span>
                  </button>

                  {isOpen ? (
                    <nav
                      id={contentId}
                      className="app-home-group__links"
                      aria-label={group.name}
                    >
                      {group.routes.map((route) => (
                        <div className="app-home-calculator-row" key={route.to}>
                          <div className="app-home-link-card app-home-calculator-card">
                            <FavoriteCalculatorButton
                              isFavorite={favoriteIdSet.has(route.to)}
                              onToggle={toggleFavorite}
                              route={route}
                            />

                            <NavLink
                              className="app-home-calculator-card__link"
                              to={route.to}
                            >
                              <span className="app-home-link-card__label">{route.name}</span>
                              <span className="app-home-link-card__arrow" aria-hidden="true">
                                ›
                              </span>
                            </NavLink>
                          </div>
                        </div>
                      ))}
                    </nav>
                  ) : null}
                </section>
              )
            })}
          </div>

          <AppBottomNavigation />
        </section>

        <div className="app-home-device__indicator" aria-hidden="true" />
      </div>
    </main>
  )
}
