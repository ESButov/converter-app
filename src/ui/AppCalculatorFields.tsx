import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react'
import './AppCalculatorFields.css'

type AppCalculationFieldProps = {
  label: string
}

type AppCalculationNumberFieldProps = AppCalculationFieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

type AppCalculationDateFieldProps = AppCalculationFieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export type AppCalculationSelectOption = {
  id?: string
  label: string
  value: string
}

type AppCalculationSelectFieldProps = AppCalculationFieldProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
    options: readonly AppCalculationSelectOption[]
    placeholder?: string
  }

type AppCalculationTextProps = {
  children: ReactNode
}

const hasRenderableContent = (children: ReactNode) => (
  children !== null &&
  children !== undefined &&
  children !== false &&
  children !== ''
)

function AppCalculationNumberField({ label, ...inputProps }: AppCalculationNumberFieldProps) {
  return (
    <label className="app-calculation-field">
      <span>{label}</span>
      <input
        {...inputProps}
        type="number"
      />
    </label>
  )
}

function AppCalculationDateField({ label, ...inputProps }: AppCalculationDateFieldProps) {
  return (
    <label className="app-calculation-field">
      <span>{label}</span>
      <input
        {...inputProps}
        type="date"
      />
    </label>
  )
}

function AppCalculationSelectField({
  label,
  options,
  placeholder = '-',
  ...selectProps
}: AppCalculationSelectFieldProps) {
  return (
    <label className="app-calculation-field">
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

function AppCalculationNote({ children }: AppCalculationTextProps) {
  if (!hasRenderableContent(children)) {
    return null
  }

  return <span className="app-calculation-note">{children}</span>
}

function AppCalculationError({ children }: AppCalculationTextProps) {
  if (!hasRenderableContent(children)) {
    return null
  }

  return (
    <span
      className="app-calculation-error"
      role="alert"
    >
      {children}
    </span>
  )
}

function AppCalculationPanel({ children }: AppCalculationTextProps) {
  if (!hasRenderableContent(children)) {
    return null
  }

  return <section className="app-calculation-panel">{children}</section>
}

function AppCalculationResult({ children }: AppCalculationTextProps) {
  if (!hasRenderableContent(children)) {
    return null
  }

  return <section className="app-calculation-result">{children}</section>
}

export {
  AppCalculationDateField,
  AppCalculationError,
  AppCalculationNote,
  AppCalculationNumberField,
  AppCalculationPanel,
  AppCalculationResult,
  AppCalculationSelectField,
}
