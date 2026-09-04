import {
  NavLink,
  useInRouterContext,
  type To,
} from 'react-router-dom'
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react'
import '../pages/home.css'
import './AppScreen.css'
import './CalculatorForm.css'

type CalculatorFormProps = {
  title: string
  children: ReactNode
}

type CalculatorFieldProps = {
  label: string
}

type CalculatorNumberFieldProps = CalculatorFieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

type CalculatorDateFieldProps = CalculatorFieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

type CalculatorSelectOption = {
  id?: string
  label: string
  value: string
}

type CalculatorSelectFieldProps = CalculatorFieldProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
    options: readonly CalculatorSelectOption[]
    placeholder?: string
  }

type CalculatorTextProps = {
  children: ReactNode
}

type CalculatorResultProps = CalculatorTextProps & {
  align?: 'center' | 'start'
  multiline?: boolean
}

type CalculatorNavigationLinkProps = {
  children: ReactNode
  className: string
  to: To
}

const hasRenderableContent = (children: ReactNode) => (
  children !== null &&
  children !== undefined &&
  children !== false &&
  children !== ''
)

const hashHrefFromTo = (to: To) => {
  if (typeof to !== 'string') {
    const pathname = to.pathname ?? '/'
    const search = to.search ?? ''
    const hash = to.hash ?? ''

    return `#${pathname}${search}${hash}`
  }

  return `#${to}`
}

function CalculatorNavigationLink({
  children,
  className,
  to,
}: CalculatorNavigationLinkProps) {
  const isInRouter = useInRouterContext()

  if (isInRouter) {
    return (
      <NavLink className={className} to={to}>
        {children}
      </NavLink>
    )
  }

  return (
    <a className={className} href={hashHrefFromTo(to)}>
      {children}
    </a>
  )
}

function CalculatorBottomNavigation() {
  return (
    <nav className="app-home-bottom-nav" aria-label="Основная навигация">
      <CalculatorNavigationLink className="app-home-bottom-nav__item" to="/reference">
        <img src="/app-icons/reference-object.png" alt="" aria-hidden="true" />
        <span>Справочник</span>
      </CalculatorNavigationLink>

      <CalculatorNavigationLink className="app-home-bottom-nav__item" to="/home">
        <img src="/app-icons/home-object.png" alt="" aria-hidden="true" />
        <span>Главная</span>
      </CalculatorNavigationLink>

      <CalculatorNavigationLink className="app-home-bottom-nav__item" to="/settings">
        <img src="/app-icons/settings-object.png" alt="" aria-hidden="true" />
        <span>Настройки</span>
      </CalculatorNavigationLink>
    </nav>
  )
}

function CalculatorForm({ title, children }: CalculatorFormProps) {
  return (
    <main className="app-home-page" aria-label="VetTools">
      <div className="app-home-device" aria-label={`${title} VetTools`}>
        <div className="app-home-device__notch" aria-hidden="true" />

        <section className="app-home-screen app-screen-shell calculator-form-screen">
          <header className="app-home-screen__header">
            <div className="app-home-screen__title-group">
              <p className="app-home-screen__app-name">VetTools</p>
              <CalculatorNavigationLink className="app-screen-back-link" to="/home">
                Назад на главную
              </CalculatorNavigationLink>
              <h1 className="app-home-screen__title app-screen-title">{title}</h1>
            </div>

            <img
              className="app-home-screen__app-icon"
              src="/app-icons/home.png"
              alt=""
              aria-hidden="true"
            />
          </header>

          <form
            className="calculator-form"
            onSubmit={(event) => event.preventDefault()}
          >
            {children}
          </form>

          <CalculatorBottomNavigation />
        </section>

        <div className="app-home-device__indicator" aria-hidden="true" />
      </div>
    </main>
  )
}

function CalculatorNumberField({ label, ...inputProps }: CalculatorNumberFieldProps) {
  return (
    <label className="calculator-field">
      <span>{label}</span>
      <input
        {...inputProps}
        type="number"
      />
    </label>
  )
}

function CalculatorDateField({ label, ...inputProps }: CalculatorDateFieldProps) {
  return (
    <label className="calculator-field">
      <span>{label}</span>
      <input
        {...inputProps}
        type="date"
      />
    </label>
  )
}

function CalculatorSelectField({
  label,
  options,
  placeholder = '-',
  ...selectProps
}: CalculatorSelectFieldProps) {
  return (
    <label className="calculator-field">
      <span>{label}</span>
      <select {...selectProps}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option
            id={option.id}
            key={option.id ?? option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function CalculatorDescription({ children }: CalculatorTextProps) {
  if (!hasRenderableContent(children)) {
    return null
  }

  return <span className="calculator-description">{children}</span>
}

function CalculatorError({ children }: CalculatorTextProps) {
  if (!hasRenderableContent(children)) {
    return null
  }

  return (
    <section
      className="calculator-error"
      role="alert"
    >
      {children}
    </section>
  )
}

function CalculatorPanel({ children }: CalculatorTextProps) {
  if (!hasRenderableContent(children)) {
    return null
  }

  return <section className="calculator-panel">{children}</section>
}

function CalculatorResult({
  align = 'center',
  children,
  multiline = false,
}: CalculatorResultProps) {
  if (!hasRenderableContent(children)) {
    return null
  }

  return (
    <section
      className="calculator-result"
      style={{
        textAlign: align === 'start' ? 'left' : 'center',
        whiteSpace: multiline ? 'pre-line' : undefined,
      }}
    >
      {children}
    </section>
  )
}

export {
  CalculatorDateField,
  CalculatorDescription,
  CalculatorError,
  CalculatorForm,
  CalculatorNumberField,
  CalculatorPanel,
  CalculatorResult,
  CalculatorSelectField,
}
export type { CalculatorSelectOption }
