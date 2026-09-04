import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import '../pages/home.css'
import './AppScreen.css'
import AppBottomNavigation from './AppBottomNavigation'

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

          <AppBottomNavigation />
        </section>

        <div className="app-home-device__indicator" aria-hidden="true" />
      </div>
    </main>
  )
}
