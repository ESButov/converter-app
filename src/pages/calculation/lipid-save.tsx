import { useMemo, useState, type ChangeEvent } from 'react'
import {
    CalculatorForm,
    CalculatorNumberField,
    CalculatorResult,
} from '../../ui/CalculatorForm'

const names = {
    title: 'Протокол Липидного спасения',
    weight: 'Масса (кг)',
    content: `Дозировка Липофундина 20%: 0.25-0.5 мл/кг/мин (15-30мл/кг/ч)

Протокол липидного спасения:
1. Болюс {res1} мл, что соответствует 1.5мл/кг вводим за 1 мин
2. Далее начинаем со скорости {res2} мл/ч
3. При отсутствии эффекта через 5 минут повторяем болюс {res1} мл за 1 минуту
4. При отсутствии эффекта максимальный подъем скорости до {res3} мл/ч

При необходимости можно сделать до 3 болюсов
Максимально допустимо ввести {res4} - {res5} мл (10-20 мл/кг) за первые 30 минут
`
} as const

interface LipidForm {
    weight: number,
}

const hasPositiveNumber = (value: unknown): value is number => (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value > 0
);

export default function LipidSavePage() {
    const [form, setForm] = useState<Partial<LipidForm>>({});

    const handleNumberChange = (e: ChangeEvent<HTMLInputElement>, field: 'weight') => {
        const nextValue = e.target.value === '' ? undefined : Number(e.target.value)

        setForm((prev) => ({
            ...prev,
            [field]: Number.isFinite(nextValue) ? nextValue : undefined,
        }))
    }
    
    const result = useMemo((): string | undefined => {
        if (!hasPositiveNumber(form.weight)) {
            return;
        }
        const result: Record<string, number> = {
            'res1': form.weight! * 1.5,
            'res2': form.weight! * 15,
            'res3': form.weight! * 30,
            'res4': form.weight! * 10,
            'res5': form.weight! * 20,
        }
        return Object.keys(result).reduce((prev: string, key: string) => prev.replaceAll(`{${key}}`, result[key].toFixed(2)), names.content)
    }, [form.weight])

    return (
        <CalculatorForm title={names.title}>
            <CalculatorNumberField
                label={names.weight}
                min="0"
                step="0.001"
                value={form.weight ?? ''}
                onChange={(e) => handleNumberChange(e, 'weight')}
            />

            <CalculatorResult
                align="start"
                multiline
            >
                {result}
            </CalculatorResult>
        </CalculatorForm>
    )
}
