import { CalculatorNumberField } from './CalculatorForm'
import type { InputHTMLAttributes } from 'react'

type InputProps = {
    label: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export default function UIInput({ label, ...inputProps }: InputProps) {
    return <CalculatorNumberField label={label} {...inputProps} />
}
