import { useMemo, useState, type ChangeEvent } from "react";

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
}

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
        <form style={style.form}>
            <h1 style={style.title}>{names.title}</h1>
            <label style={style.label}>
                {names.weight}
                <input
                    style={style.input}
                    type="number"
                    min="0"
                    step="0.001"
                    value={form.weight ?? ''}
                    onChange={(e) => handleNumberChange(e, 'weight')}
                />
            </label>

            {result && <span style={style.additionalDescription}>{result}</span>}
            
        </form>
    )
}



const colors = {
  dark: {
    pageBg: '#061824',
    formBg: '#082332',
    text: '#f6fbfc',
    mutedText: '#b8d6da',
    border: '#d8f3f2',
    inputBg: '#0a2a3a',
    inputText: '#f6fbfc',
    accent: '#3fc7bd',
    accentSoft: '#9ee3dd',
    resultText: '#d8f3f2',

    gridThin: 'rgba(216, 243, 242, 0.07)',
    gridBold: 'rgba(216, 243, 242, 0.18)',
  },

  light: {
    pageBg: '#edfafa',
    formBg: '#f8ffff',
    text: '#092435',
    mutedText: '#426b75',
    border: '#0d4b5f',
    inputBg: '#ffffff',
    inputText: '#092435',
    accent: '#179c9a',
    accentSoft: '#ccefed',
    resultText: '#0d4b5f',

    gridThin: 'rgba(13, 75, 95, 0.07)',
    gridBold: 'rgba(13, 75, 95, 0.16)',
  },
} as const
const theme = colors.dark

const style = {
  form: {
    width: 'min(340px, 100%)',
    margin: '0 auto',
    padding: '16px 40px 32px',
    border: `1.5px solid ${theme.border}`,
    backgroundColor: theme.formBg,
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
    color: theme.text
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

  additionalDescription: {
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
    whiteSpace: 'pre-line',
  },
} as const