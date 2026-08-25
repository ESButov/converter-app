import { useEffect, useState, type ChangeEvent } from 'react'
import { loadDrugCatalog } from '../data/drugCatalog'
import { renderDescription } from '../domain/descriptionTemplates'
import { checkValid } from '../types/types'
import {
    CalculatorDescription,
    CalculatorError,
    CalculatorForm,
    CalculatorNumberField,
    CalculatorPanel,
    CalculatorResult,
    CalculatorSelectField,
} from '../ui/CalculatorForm'
import type { DrugCatalog } from '../data/drugCatalog'
import type { CalcFormData } from '../types/types'

const names = {
    title: 'Калькулятор ИПС',
    labels: {
        animal: 'Вид животного',
        drug: 'Препарат',
        weight: 'Масса (кг)',
        dose: 'Доза',
        injector: 'Объем шприца (мл)',
        speed: 'Скорость инфузии (мл/ч)',
    },
} as const

const animals = [
    {
        label: 'Кошка',
        value: 'cat',
        id: 'cat-option',
    },
    {
        label: 'Собака',
        value: 'dog',
        id: 'dog-option',
    },
] as const

type NumericField = 'weight' | 'dose' | 'injector' | 'speed'

const emptyForm: CalcFormData = {
    animal: '',
    drug: undefined,
    weight: undefined,
    dose: undefined,
    injector: undefined,
    speed: undefined,
}

export default function CalcForm() {
    const [catalog, setCatalog] = useState<DrugCatalog | null>(null)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [form, setForm] = useState<CalcFormData>(emptyForm)

    useEffect(() => {
        let shouldIgnore = false

        loadDrugCatalog()
            .then((nextCatalog) => {
                if (!shouldIgnore) {
                    setCatalog(nextCatalog)
                }
            })
            .catch(() => {
                if (!shouldIgnore) {
                    setLoadError('Не удалось загрузить список препаратов.')
                }
            })

        return () => {
            shouldIgnore = true
        }
    }, [])

    const handleAnimalSelection = (e: ChangeEvent<HTMLSelectElement>) => {
        const animal = e.target.value

        setForm((prev) => {
            const drug = prev.drug?.checkAllowed(animal) ? prev.drug : undefined

            return {
                ...prev,
                animal,
                drug,
                injector: drug ? drug.injectorLock ?? prev.injector : undefined,
                speed: drug ? drug.speedLock ?? prev.speed : undefined,
            }
        })
    }

    const handleNumberChange = (e: ChangeEvent<HTMLInputElement>, field: NumericField) => {
        const nextValue = e.target.value === '' ? undefined : Number(e.target.value)

        setForm((prev) => ({
            ...prev,
            [field]: Number.isFinite(nextValue) ? nextValue : undefined,
        }))
    }

    const handleDrugSelection = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedKey = e.target.value

        setForm((prev) => {
            const drug = selectedKey ? catalog?.withKey(selectedKey) : undefined
            const previousInjectorWasLocked = prev.drug?.injectorLock !== undefined
            const prevSpeedWasLocked = prev.drug?.speedLock !== undefined

            return {
                ...prev,
                drug,
                injector: drug?.injectorLock ?? (previousInjectorWasLocked ? undefined : prev.injector),
                speed: drug?.speedLock ?? (prevSpeedWasLocked ? undefined: prev.speed),
            }
        })
    }

    const availableDrugs = catalog?.options.filter(drug => drug.checkAllowed(form.animal)) ?? []
    const description = renderDescription(form.drug?.description, form)
    const isFormValid = checkValid(form)
    const result = isFormValid ? form.drug.calculate(form) : undefined
    const additionalDescription = renderDescription(form.drug?.additionalDescription, {...form, result: result})
    const injectorLocked = form.drug?.injectorLock !== undefined
    const speedLocked = form.drug?.speedLock !== undefined

    return (
        <CalculatorForm title={names.title}>
            <CalculatorSelectField
                label={names.labels.animal}
                options={animals}
                value={form.animal}
                onChange={handleAnimalSelection}
            />
            <CalculatorSelectField
                disabled={!form.animal || !catalog || Boolean(loadError)}
                label={names.labels.drug}
                options={availableDrugs.map((drug) => ({
                    id: `drug-option-${drug.id}`,
                    label: drug.name,
                    value: drug.key,
                }))}
                value={form.drug?.key ?? ''}
                onChange={handleDrugSelection}
            />
            {!catalog && !loadError &&
                <CalculatorDescription>
                    Загрузка препаратов...
                </CalculatorDescription>}
            {loadError &&
                <CalculatorError>
                    {loadError}
                </CalculatorError>}

            <CalculatorNumberField
                label={names.labels.weight}
                min="0"
                step="0.001"
                value={form.weight ?? ''}
                onChange={(e) => handleNumberChange(e, 'weight')}
            />
            <CalculatorNumberField
                label={names.labels.dose}
                min={0}
                step="0.01"
                value={form.dose ?? ''}
                onChange={(e) => handleNumberChange(e, 'dose')}
            />
            <CalculatorDescription>
                {description}
            </CalculatorDescription>

            <CalculatorNumberField
                disabled={injectorLocked}
                label={names.labels.injector}
                min={0}
                step={1}
                value={form.injector ?? ''}
                onChange={(e) => handleNumberChange(e, 'injector')}
            />
            <CalculatorNumberField
                disabled={speedLocked}
                label={names.labels.speed}
                min={0}
                step="0.01"
                value={form.speed ?? ''}
                onChange={(e) => handleNumberChange(e, 'speed')}
            />
            {result !== undefined &&
                <>
                    <CalculatorResult>
                        Объем препарата: {result.toFixed(2)} мл.
                    </CalculatorResult>
                    <CalculatorPanel>
                        {additionalDescription}
                    </CalculatorPanel>
                </>}
        </CalculatorForm>
    )
}
