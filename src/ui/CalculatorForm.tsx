import type {
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react'

const colors = {
  dark: {
    formBg: '#082332',
    text: '#f6fbfc',
    mutedText: '#b8d6da',
    border: '#d8f3f2',
    inputBg: '#0a2a3a',
    accentSoft: '#9ee3dd',
    resultText: '#d8f3f2',
  },

  light: {
    formBg: '#f8ffff',
    text: '#092435',
    mutedText: '#426b75',
    border: '#0d4b5f',
    inputBg: '#ffffff',
    accentSoft: '#ccefed',
    resultText: '#0d4b5f',
  },
} as const

const theme = colors.dark

const styles: Record<string, CSSProperties> = {
  form: {
    width: 'min(423px, 100%)',
    margin: '0 auto',
    padding: '16px 40px 32px',
    border: `1.5px solid ${theme.border}`,
    backgroundColor: theme.formBg,
    boxSizing: 'border-box',
    color: theme.text,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  title: {
    margin: '0 0 20px',
    fontSize: '32px',
    lineHeight: '1.2',
    fontWeight: 700,
    textAlign: 'center',
    color: theme.text,
  },

  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '9px',
    fontSize: '16px',
    lineHeight: '1.2',
    fontWeight: 700,
  },

  input: {
    width: '100%',
    height: '30px',
    padding: '2px 10px',
    border: `1.5px solid ${theme.border}`,
    borderRadius: 0,
    backgroundColor: theme.inputBg,
    color: theme.text,
    fontSize: '16px',
    fontWeight: 700,
    textAlign: 'center',
    outline: 'none',
    boxSizing: 'border-box',
  },

  description: {
    fontSize: '12px',
    lineHeight: '1.35',
    fontWeight: 700,
    color: theme.mutedText,
  },

  panel: {
    padding: '10px 12px',
    border: `1px solid ${theme.accentSoft}`,
    fontSize: '12px',
    lineHeight: '1.35',
    fontWeight: 700,
    color: theme.resultText,
    backgroundColor: theme.inputBg,
    whiteSpace: 'pre-line',
  },

  error: {
    fontSize: '12px',
    lineHeight: '1.35',
    fontWeight: 700,
    color: '#ffb4a8',
  },

  result: {
    marginTop: '28px',
    fontSize: '16px',
    lineHeight: '1.25',
    fontWeight: 700,
  },
}

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

const hasRenderableContent = (children: ReactNode) => (
  children !== null &&
  children !== undefined &&
  children !== false &&
  children !== ''
)

function CalculatorForm({ title, children }: CalculatorFormProps) {
  return (
    <form style={styles.form}>
      <h1 style={styles.title}>{title}</h1>
      {children}
    </form>
  )
}

function CalculatorNumberField({ label, ...inputProps }: CalculatorNumberFieldProps) {
  return (
    <label style={styles.label}>
      <span style={{display: 'inline-flex', flex: 1, alignItems: 'end'}}>{label}</span>
      <input
        {...inputProps}
        style={styles.input}
        type="number"
      />
    </label>
  )
}

function CalculatorDateField({ label, ...inputProps }: CalculatorDateFieldProps) {
  return (
    <label style={styles.label}>
      <span style={{display: 'inline-flex', flex: 1, alignItems: 'end'}}>{label}</span>
      <input
        {...inputProps}
        style={styles.input}
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
    <label style={styles.label}>
      <span style={{display: 'inline-flex', flex: 1, alignItems: 'end'}}>{label}</span>
      <select
        {...selectProps}
        style={styles.input}
      >
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

  return <span style={styles.description}>{children}</span>
}

function CalculatorError({ children }: CalculatorTextProps) {
  if (!hasRenderableContent(children)) {
    return null
  }

  return (
    <span
      role="alert"
      style={styles.error}
    >
      {children}
    </span>
  )
}

function CalculatorPanel({ children }: CalculatorTextProps) {
  if (!hasRenderableContent(children)) {
    return null
  }

  return <span style={styles.panel}>{children}</span>
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
    <span
      style={{
        ...styles.result,
        textAlign: align === 'start' ? 'left' : 'center',
        whiteSpace: multiline ? 'pre-line' : undefined,
      }}
    >
      {children}
    </span>
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
