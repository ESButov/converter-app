import type { CalcFormData, Calc } from "../types/types";

const map = new Map<string, Calc>();

map.set('l-2', (form: Required<CalcFormData>) => (
        (form.weight * form.dose * 60) / 20000 * (form.injector / form.speed)
    ))
map.set('l-10', (form: Required<CalcFormData>) => (
        (form.weight * form.dose * 60) / 100000 * (form.injector / form.speed)
    ))
map.set('cer', (form: Required<CalcFormData>) => (
        (form.weight * form.dose) / 5 * (form.injector / form.speed)
    ))
map.set('domitor', (form: Required<CalcFormData>) => (
        (form.weight * form.dose) / 1000 * (form.injector / form.speed)
    ))
map.set('ddm-01', (form: Required<CalcFormData>) => (
        (form.weight * form.dose) / 100 * (form.injector / form.speed)
    ))
map.set('ddm-05', (form: Required<CalcFormData>) => (
        (form.weight * form.dose) / 500 * (form.injector / form.speed)
    ))
map.set('vez', (form: Required<CalcFormData>) => (
        (form.weight * form.dose) / 100 * (form.injector / form.speed)
    ))
map.set('tr', (form: Required<CalcFormData>) => (
        (form.weight * form.dose) / 50 * (form.injector / form.speed)
    ))
map.set('nad', (form: Required<CalcFormData>) => (
        (form.weight * form.dose * 60) / 2000 * 24
    ))
map.set('ad', (form: Required<CalcFormData>) => (
        (form.weight * form.dose * 60) / 1000 * (form.injector / form.speed)
    ))
map.set('dop-05', (form: Required<CalcFormData>) => (
        (form.weight * 0.24)
    ))
map.set('dop-4', (form: Required<CalcFormData>) => (
        (form.weight * 0.03)
    ))
map.set('dob', (form: Required<CalcFormData>) => (
        (form.weight * 3) / 31.25
    ))

export default map

