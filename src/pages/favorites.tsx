import { NavLink } from 'react-router-dom'
import { getFavoriteCalculatorRoutes } from '../data/calculators'
import AppBottomNavigation from '../ui/AppBottomNavigation'
import FavoriteCalculatorButton from '../ui/FavoriteCalculatorButton'
import { useFavoriteCalculatorState } from '../ui/favoriteCalculators'
import './home.css'

export default function FavoritesPage() {
  const {
    favoriteIds,
    favoriteIdSet,
    toggleFavorite,
  } = useFavoriteCalculatorState()
  const favoriteCalculatorRoutes = getFavoriteCalculatorRoutes(favoriteIds)

  return (
    <main className="app-home-page" aria-label="VetTools">
      <div className="app-home-device" aria-label="Избранное VetTools">
        <div className="app-home-device__notch" aria-hidden="true" />

        <section className="app-home-screen">
          <header className="app-home-screen__header">
            <div className="app-home-screen__title-group">
              <p className="app-home-screen__app-name">VetTools</p>
              <h1 className="app-home-screen__title">Избранное</h1>
            </div>

            <img
              className="app-home-screen__app-icon"
              src="/app-icons/home.png"
              alt=""
              aria-hidden="true"
            />
          </header>

          <section className="app-home-link-list" aria-label="Список избранного">
            {favoriteCalculatorRoutes.length > 0 ? (
              <nav className="app-home-favorites-list" aria-label="Избранные калькуляторы">
                {favoriteCalculatorRoutes.map((route) => (
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
            ) : (
              <span className="app-home-empty-state">
                Избранные калькуляторы появятся здесь.
              </span>
            )}
          </section>

          <AppBottomNavigation />
        </section>

        <div className="app-home-device__indicator" aria-hidden="true" />
      </div>
    </main>
  )
}
