import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './home.css'

type HomeRoute = {
  name: string
  to: string
}

type CalculatorGroup = {
  id: string
  name: string
  routes: HomeRoute[]
}

const calculatorGroups: CalculatorGroup[] = [
  {
    id: 'infusion',
    name: 'Инфузионная терапия',
    routes: [
      {
        name: 'Расчет инфузионной терапии',
        to: '/calculation/ipscalc',
      },
      {
        name: 'Расчет капельного введения',
        to: '/calculation/iv-drip',
      },
      {
        name: 'Приготовление раствора глюкозы',
        to: '/calculation/glucose',
      },
      {
        name: 'Расчет ИПС',
        to: '/calculation/ips',
      },
      {
        name: 'Расчет смешанных инфузий',
        to: '/calculation/mixed-infusions',
      },
    ],
  },
  {
    id: 'critical-care',
    name: 'Интенсивная терапия',
    routes: [
      {
        name: 'Расчет крови и ее компонентов',
        to: '/calculation/blood-transfusion',
      },
      {
        name: 'Корректировка электролитов',
        to: '/calculation/electrolytes',
      },
      {
        name: 'Расчет препаратов для СЛР',
        to: '/calculation/clr',
      },
      {
        name: 'Протокол липидного спасения',
        to: '/calculation/lipid-save',
      },
    ],
  },
  {
    id: 'nutrition',
    name: 'Кормление',
    routes: [
      {
        name: 'Расчет ПЭП',
        to: '/calculation/pep',
      },
      {
        name: 'Расчет энтерального питания',
        to: '/calculation/enteral-nutrition',
      },
    ],
  },
  {
    id: 'diagnostics',
    name: 'УЗИ',
    routes: [
      {
        name: 'Расчет норм ЭХОКГ',
        to: '/calculation/echo',
      },
      {
        name: 'ЭКГ',
        to: '/calculation/ecg',
      },
      {
        name: 'Калькулятор ПДР',
        to: '/calculation/pdr',
      },
    ],
  },
  {
    id: 'other',
    name: 'Прочее',
    routes: [
      {
        name: 'Расчет площади тела',
        to: '/calculation/body-surface-area',
      },
      {
        name: 'Конвертер единиц измерения',
        to: '/calculation/convert',
      },
    ],
  },
]

export default function HomePage() {
  const [openGroupId, setOpenGroupId] = useState<string | null>(null)

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
              <h1 className="app-home-screen__title">Главная</h1>
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
                        <NavLink
                          key={route.to}
                          className="app-home-link-card"
                          to={route.to}
                        >
                          <span className="app-home-link-card__marker" aria-hidden="true" />
                          <span className="app-home-link-card__label">{route.name}</span>
                          <span className="app-home-link-card__arrow" aria-hidden="true">
                            ›
                          </span>
                        </NavLink>
                      ))}
                    </nav>
                  ) : null}
                </section>
              )
            })}
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
