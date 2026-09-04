import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import '../pages/home.css'
import './AppScreen.css'

type AppScreenProps = {
  ariaLabel: string
  backLabel: string
  backTo: string
  children: ReactNode
  iconSrc?: string
  screenClassName?: string
  title: string
}

export default function AppScreen({
  ariaLabel,
  backLabel,
  backTo,
  children,
  iconSrc = '/app-icons/home.png',
  screenClassName = '',
  title,
}: AppScreenProps) {
  const screenClass = ['app-home-screen', 'app-screen-shell', screenClassName]
    .filter(Boolean)
    .join(' ')

  return (
    <main className="app-home-page" aria-label="VetTools">
      <div className="app-home-device" aria-label={ariaLabel}>
        <div className="app-home-device__notch" aria-hidden="true" />

        <section className={screenClass}>
          <header className="app-home-screen__header">
            <div className="app-home-screen__title-group">
              <p className="app-home-screen__app-name">VetTools</p>
              <NavLink className="app-screen-back-link" to={backTo}>
                {backLabel}
              </NavLink>
              <h1 className="app-home-screen__title app-screen-title">{title}</h1>
            </div>

            <img
              className="app-home-screen__app-icon"
              src={iconSrc}
              alt=""
              aria-hidden="true"
            />
          </header>

          {children}

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
        </section>

        <div className="app-home-device__indicator" aria-hidden="true" />
      </div>
    </main>
  )
}
