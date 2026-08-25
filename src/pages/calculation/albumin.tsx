import { useMemo, useState, type ChangeEvent } from "react";
import {
    CalculatorForm,
    CalculatorNumberField,
    CalculatorPanel,
    CalculatorResult,
} from "../../ui/CalculatorForm";

interface LipidFormData extends Record<string, unknown> {
    current: number,
    target: number,
    weight: number,
}

const names = {
    title: 'Рассчет Альбумина',
    labels: {
        current: 'Альбумин крови (г/л)',
        target: 'Желаемый Альбумин (г/л)',
        weight: 'Масса (кг)'
    },
    nb: 'Рассчет проводится на 12 часов ИПС',
}

const keys = ['current', 'target', 'weight'];

const hasPositiveNumber = (value: unknown): value is number => (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value > 0
);

export default function AlbuminPage() {
    const [form, setForm] = useState<Partial<LipidFormData>>({});

    const handleNumberChange = (e: ChangeEvent<HTMLInputElement>, field: keyof LipidFormData) => {
        const nextValue = e.target.value === '' ? undefined : Number(e.target.value)

        setForm((prev) => ({
            ...prev,
            [field]: Number.isFinite(nextValue) ? nextValue : undefined,
        }))
    }

    const isFormValid = keys.every(key => hasPositiveNumber(form[key]));

    const result = useMemo((): string | undefined => {
        if (isFormValid) {
            const volumes = {
                '20': 5 * (form.target! - form.current!) * 0.3 * form.weight!,
                '10': 10 * (form.target! - form.current!) * 0.3 * form.weight!,
            }
            const result = {
                ...volumes,
                'speed10': volumes['10'] / 12,
                'speed20': volumes['20'] / 12,
            }
            return `Объем 20%: ${result[20]} мл.
Скорость для 20%: ${result['speed20']} мл/ч.

NB: Альбумин 20% вводить в ПВК в чистом виде не допускается, требуется добавить ${result[20]} мл NaCl 0.9%, соответственно скорость инфузии раствора будет составлять ${result['speed20'] * 2} мл/ч
Альбумин 20% допустимо вводить в ЦВК в чистом виде

Объем 10%: ${result[10]} мл.
Скорость для 10%: ${result['speed10']} мл/ч.
`
        }
        return undefined
    }, [form, isFormValid]);

    return (
        <CalculatorForm title={names.title}>
            <CalculatorNumberField
                label={names.labels.current}
                min="0"
                step="0.01"
                value={form.current ?? ''}
                onChange={(e) => handleNumberChange(e, 'current')}
            />
            <CalculatorNumberField
                label={names.labels.target}
                min="0"
                step="0.01"
                value={form.target ?? ''}
                onChange={(e) => handleNumberChange(e, 'target')}
            />
            <CalculatorNumberField
                label={names.labels.weight}
                min="0"
                step="0.001"
                value={form.weight ?? ''}
                onChange={(e) => handleNumberChange(e, 'weight')}
            />
            <CalculatorPanel>
                {names.nb}
            </CalculatorPanel>
            <CalculatorResult
                align="start"
                multiline
            >
                {result}
            </CalculatorResult>
        </CalculatorForm>
    ) 
}
