import CalcMap from '../constants/calculates';
import type { Calc, Drug, DrugDefinition } from '../types/types';

const fallbackCalculate: Calc = () => undefined;

class DrugCatalog {
    private byKey = new Map<string, Drug>();

    constructor(definitions: DrugDefinition[]) {
        definitions.forEach((definition, index) => {
            const allowedAnimals = definition.allowedAnimals ?? ['ALL'];
            const calculate = CalcMap.get(definition.key) ?? fallbackCalculate;
            const drug: Drug = {
                ...definition,
                id: `${index + 1}`,
                allowedAnimals,
                calculate,
                checkAllowed: (animal?: string) => {
                    if (!animal) {
                        return false;
                    }

                    return allowedAnimals.includes('ALL') || allowedAnimals.includes(animal);
                },
            };

            this.byKey.set(drug.key, drug);
        });
    }

    get options(): Drug[] {
        return [...this.byKey.values()];
    }

    withKey(key: string): Drug | undefined {
        return this.byKey.get(key);
    }
}

const isRecord = (value: unknown): value is Record<string, unknown> => (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
);

const parseDrugDefinitions = (value: unknown): DrugDefinition[] => {
    if (!Array.isArray(value)) {
        throw new Error('Drug catalog should be an array.');
    }

    return value.map((item, index) => {
        if (!isRecord(item) || typeof item.key !== 'string' || typeof item.name !== 'string') {
            throw new Error(`Drug catalog item #${index + 1} should have string key and name.`);
        }

        const definition: DrugDefinition = {
            key: item.key,
            name: item.name,
        };

        if (Array.isArray(item.allowedAnimals) && item.allowedAnimals.every(animal => typeof animal === 'string')) {
            definition.allowedAnimals = item.allowedAnimals;
        }

        if (typeof item.injectorLock === 'number') {
            definition.injectorLock = item.injectorLock;
        }

        if (typeof item.speedLock === 'number') {
            definition.speedLock = item.speedLock;
        }

        if ('description' in item) {
            definition.description = item.description as DrugDefinition['description'];
        }

        if ('additionalDescription' in item) {
            definition.additionalDescription = item.additionalDescription as DrugDefinition['additionalDescription'];
        }

        return definition;
    });
};

const getDrugCatalogUrl = () => `${import.meta.env.BASE_URL}data/drugs.json`;

const loadDrugCatalog = async (): Promise<DrugCatalog> => {
    const response = await fetch(getDrugCatalogUrl());

    if (!response.ok) {
        throw new Error(`Failed to load drug catalog: ${response.status}`);
    }

    const data = await response.json() as unknown;
    return new DrugCatalog(parseDrugDefinitions(data));
};

export { DrugCatalog, loadDrugCatalog };
