import { NavLink } from 'react-router-dom'
import './home.css'

type SettingsGroup = {
  id: string
  items: readonly string[]
  name: string
}

const settingsGroups = [
  {
    id: 'account',
    name: 'Аккаунт',
    items: ['Войти в аккаунт'],
  },
  {
    id: 'app',
    name: 'Приложение',
    items: ['Настройки', 'Безопасность'],
  },
  {
    id: 'support',
    name: 'Помощь и связь',
    items: ['Инструкция по пользованию', 'Контакты', 'Информация'],
  },
] as const satisfies readonly SettingsGroup[]

export default function SettingsPage() {
  return (
    <main className="app-home-page" aria-label="VetTools">
      <div className="app-home-device" aria-label="Настройки VetTools">
        <div className="app-home-device__notch" aria-hidden="true" />

        <section className="app-home-screen">
          <header className="app-home-screen__header">
            <div className="app-home-screen__title-group">
              <p className="app-home-screen__app-name">VetTools</p>
              <h1 className="app-home-screen__title">Настройки</h1>
            </div>

            <img
              className="app-home-screen__app-icon"
              src="/app-icons/settings.png"
              alt=""
              aria-hidden="true"
            />
          </header>

          <div className="app-home-group-list" aria-label="Разделы настроек">
            {settingsGroups.map((group) => (
              <section
                key={group.id}
                className="app-settings-group"
              >
                <h2 className="app-settings-group__title">{group.name}</h2>

                <div className="app-settings-group__items">
                  {group.items.map((item) => (
                    <button
                      key={item}
                      className="app-home-link-card app-settings-button"
                      type="button"
                    >
                      <span className="app-home-link-card__marker" aria-hidden="true" />
                      <span className="app-home-link-card__label">{item}</span>
                      <span className="app-home-link-card__arrow" aria-hidden="true">
                        ›
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>

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
