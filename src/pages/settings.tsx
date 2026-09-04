import { useContext } from 'react'
import AppBottomNavigation from '../ui/AppBottomNavigation'
import './home.css'
import { ThemeContext } from '../ui/theme'

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
  const { isDark, toggleTheme } = useContext(ThemeContext)
  const themeLabel = isDark ? 'Темная тема' : 'Светлая тема'

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

            <section
              aria-label="Переключение темы"
              className="app-settings-theme-section"
            >
              <button
                aria-checked={isDark}
                className="app-settings-theme-toggle"
                onClick={toggleTheme}
                role="switch"
                type="button"
              >
                <span className="app-settings-theme-toggle__text">
                  <span className="app-settings-theme-toggle__label">
                    Тема оформления
                  </span>
                  <span className="app-settings-theme-toggle__status">
                    {themeLabel}
                  </span>
                </span>
                <span className="app-settings-theme-toggle__track" aria-hidden="true">
                  <span className="app-settings-theme-toggle__thumb" />
                </span>
              </button>
            </section>
          </div>

          <AppBottomNavigation />
        </section>

        <div className="app-home-device__indicator" aria-hidden="true" />
      </div>
    </main>
  )
}
