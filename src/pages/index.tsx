import { NavLink } from "react-router-dom";

export default function MainPage() {
    const routes = [
        {
            name: 'Рассчет ИПС',
            to: 'ips'
        },
        {
            name: 'Рассчет Альбумина',
            to: 'albumin'
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
            name: 'Расчет норм ЭКГ',
            to: 'echo',
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
            name: 'Расчет восполнения калия',
            to: 'kalium',
        },
        {
            name: 'Протокол липидного спасения',
            to: 'lipid-save'
        },
    ] as Array<{name?: string, to: string}>
    const calcDomain = 'calculation';
    const formatURL = (to: string): string => `${calcDomain}/${to}` 
    return (
        <>
            <h1>Тестовый макет вет калькуляторов</h1>
            <nav className="navigation">
                { routes.map(route => (
                    <NavLink
                        key={route.to}
                        className="calc-category"
                        to={formatURL(route.to)}
                    >
                        {route.name || route.to}
                    </NavLink>
                ))}
            </nav>
        </>
    )
}