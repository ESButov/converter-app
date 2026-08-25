type Calc = (form: Required<CalcFormData>) => number | undefined;

type TemplateVariableConfig = {
    resolver: string;
    params?: Record<string, unknown>;
};

type DynamicDescriptionTemplate = {
    template: string;
    variables?: Record<string, TemplateVariableConfig>;
};

type DescriptionTemplate = string | DynamicDescriptionTemplate;

interface DrugDefinition {
    key: string;
    name: string;
    allowedAnimals?: string[];
    description?: DescriptionTemplate;
    additionalDescription?: DescriptionTemplate;
    injectorLock?: number;
    speedLock?: number;
}

interface Drug extends DrugDefinition {
    id: string;
    allowedAnimals: string[];
    calculate: Calc;
    checkAllowed: (animal?: string) => boolean;
}

interface CalcFormData {
    animal?: string,
    drug?: Drug,
    weight?: number,
    dose?: number,
    injector?: number,
    speed?: number,
};

const hasPositiveNumber = (value: unknown): value is number => (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value > 0
);

const checkValid = (form: CalcFormData): form is Required<CalcFormData> => (
    Boolean(form.animal) &&
    Boolean(form.drug) &&
    hasPositiveNumber(form.weight) &&
    hasPositiveNumber(form.dose) &&
    hasPositiveNumber(form.injector) &&
    hasPositiveNumber(form.speed)
);

export { checkValid }
export type {
    Calc,
    CalcFormData,
    DescriptionTemplate,
    Drug,
    DrugDefinition,
    TemplateVariableConfig,
}
