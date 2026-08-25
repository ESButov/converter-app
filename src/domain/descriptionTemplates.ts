import { checkValid } from '../types/types';
import type { CalcFormData, DescriptionTemplate } from '../types/types';

type DescriptionContext = {
    form: CalcFormData & { result?: number };
};

type DescriptionResolver = (
    context: DescriptionContext,
    params?: Record<string, unknown>,
) => string;

const animalNames: Record<string, string> = {
    cat: 'Кошка',
    dog: 'Собака',
};

const numberFormatter = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
});

const templateTokenPattern = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

const readDigits = (params?: Record<string, unknown>) => (
    typeof params?.digits === 'number' ? params.digits : 2
);

const formatNumber = (value: number, digits: number) => (
    new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: digits,
    }).format(value)
);

const descriptionResolvers: Record<string, DescriptionResolver> = {
    animalSpecificIntro: ({ form }) => {
        const animalName = form.animal ? animalNames[form.animal] : undefined;

        if (!animalName) {
            return 'Выберите вид животного, чтобы увидеть уточнение по дозировке.';
        }

        return `${animalName}: диапазон дозировки зависит от выбранного вида.`;
    },

    calculatedVolumeSentence: ({ form }, params) => {
        if (!checkValid(form)) {
            return 'Расчетный объем появится после заполнения всех параметров.';
        }

        const value = form.drug.calculate(form);

        if (value === undefined || !Number.isFinite(value)) {
            return 'Для этого препарата пока нет расчетной формулы.';
        }

        return `При текущих параметрах: ${formatNumber(value, readDigits(params))} мл.`;
    },

    lidocaineDoseRange: ({ form }) => {
        if (form.animal === 'cat') {
            return 'Кошка: 10-30 мкг/кг/мин';
        }

        if (form.animal === 'dog') {
            return 'Собака: 20-80 мкг/кг/мин';
        }

        return 'Кошка: 10-30 мкг/кг/мин. Собака: 20-80 мкг/кг/мин';
    },

    lidocaineAnimalSpecificDescription: ({ form }) => {

        const c = (k: number) => (form.weight! * k / (form.result! / form.injector! * (form.drug!.key.endsWith('10') ? 100 : 20))).toFixed(2)

        const ak = form.animal === 'cat' ? [0.5, 1] : [1, 2]

        return `${ak[0]} - ${ak[1]} мг/кг, что соответствует ${
                c(ak[0])
            } - ${c(ak[1])} мл рассчитанного раствора для ИПС`
    },

    lockedInjectorNote: ({ form }) => {
        if (!form.drug?.injectorLock) {
            return '';
        }

        return `Объем шприца фиксирован: ${numberFormatter.format(form.drug.injectorLock)} мл.`;
    },

    weightOnlyDoseNote: ({ form }) => {
        if (!form.drug) {
            return '';
        }

        return 'Для выбранной концентрации расчетная формула использует массу пациента.';
    },

    resultDisplaing: ({ form }) => {
        return form.result?.toFixed(2) ?? '';
    }
};

const normalizeSpaces = (value: string) => value.replace(/[ \t]{2,}/g, ' ').trim();

const renderDescription = (
    description: DescriptionTemplate | undefined,
    form: CalcFormData & { result?: number },
): string => {
    if (!description) {
        return '';
    }

    if (typeof description === 'string') {
        return description;
    }

    const result = description.template.replace(templateTokenPattern, (_, placeholder: string) => {
        const variableConfig = description.variables?.[placeholder];

        if (!variableConfig) {
            return '';
        }

        const resolver = descriptionResolvers[variableConfig.resolver];

        if (!resolver) {
            return '';
        }

        return resolver({ form }, variableConfig.params);
    });

    return normalizeSpaces(result);
};

export { renderDescription };
