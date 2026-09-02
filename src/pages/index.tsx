import { NavLink } from "react-router-dom";

export default function MainPage() {
    const routes = [
        {
            name: 'Рассчет ИПС',
            to: 'ips'
        },
        {
            name: 'Расчет крови и компонентов крови',
            to: 'blood-transfusion',
        },
        {
            name: 'Расчет площади тела',
            to: 'body-surface-area',
        },
        {
            name: 'Расчет норм ЭхоКГ',
            to: 'echo',
        },
        {
            name: 'ЭКГ',
            to: 'ecg',
        },
        {
            name: 'Расчет FLK',
            to: 'flk',
        },
        {
            name: 'Расчеты смешанных инфузий',
            to: 'mixed-infusions',
        },
        {
            name: 'Расчет ПЭП',
            to: 'pep',
        },
        {
            name: 'Корректировка электролитов',
            to: 'electrolytes',
        },
        {
            name: 'Конвертер едениц измерения',
            to: 'convert',
        },
        {
            name: 'Калькулятор ПДР',
            to: 'pdr',
        },
        {
            name: 'Калькулятор расчета инфузионной терапии',
            to: 'ipscalc',
        },
        {
            name: 'Расчет препаратов для СЛР',
            to: 'clr',
        },
        {
            name: 'Расчет энетрального питания / НЭП',
            to: 'enteral-nutrition',
        },
        {
            name: 'Приготовление раствора глюкозы',
            to: 'glucose',
        },
        {
            name: 'Расчет капельного введения',
            to: 'iv-drip',
        },
        {
            name: 'Протокол липидного спасения',
            to: 'lipid-save'
        },
        {
            name: 'Токсикология',
            to: 'reference/toxic',
            isAbsolutePath: true,
        },
    ] as Array<{name?: string, to: string, isAbsolutePath?: boolean}>
    const calcDomain = 'calculation';
    const formatURL = (route: {to: string, isAbsolutePath?: boolean}): string => (
        route.isAbsolutePath ? route.to : `${calcDomain}/${route.to}`
    )
    return (
        <>
            <h1>Тестовый макет вет калькуляторов</h1>
            <nav className="navigation">
                { routes.map(route => (
                    <NavLink
                        key={route.to}
                        className="calc-category"
                        to={formatURL(route)}
                    >
                        {route.name || route.to}
                    </NavLink>
                ))}
            </nav>
        </>
    )
}
