type CalculatorRoute = {
  name: string
  to: string
}

type CalculatorRouteWithGroup = CalculatorRoute & {
  groupId: string
  groupName: string
}

type CalculatorGroup = {
  id: string
  name: string
  routes: CalculatorRoute[]
}

const calculatorGroups: CalculatorGroup[] = [
  {
    id: 'infusion',
    name: 'Инфузионная терапия',
    routes: [
      {
        name: 'Расчет инфузионной терапии',
        to: '/calculation/ipscalc',
      },
      {
        name: 'Расчет капельного введения',
        to: '/calculation/iv-drip',
      },
      {
        name: 'Приготовление раствора глюкозы',
        to: '/calculation/glucose',
      },
      {
        name: 'Расчет ИПС',
        to: '/calculation/ips',
      },
      {
        name: 'Расчет смешанных инфузий',
        to: '/calculation/mixed-infusions',
      },
    ],
  },
  {
    id: 'critical-care',
    name: 'Интенсивная терапия',
    routes: [
      {
        name: 'Расчет крови и ее компонентов',
        to: '/calculation/blood-transfusion',
      },
      {
        name: 'Корректировка электролитов',
        to: '/calculation/electrolytes',
      },
      {
        name: 'Расчет препаратов для СЛР',
        to: '/calculation/clr',
      },
      {
        name: 'Протокол липидного спасения',
        to: '/calculation/lipid-save',
      },
    ],
  },
  {
    id: 'nutrition',
    name: 'Кормление',
    routes: [
      {
        name: 'Расчет ПЭП',
        to: '/calculation/pep',
      },
      {
        name: 'Расчет энтерального питания',
        to: '/calculation/enteral-nutrition',
      },
    ],
  },
  {
    id: 'diagnostics',
    name: 'УЗИ',
    routes: [
      {
        name: 'Расчет норм ЭХОКГ',
        to: '/calculation/echo',
      },
      {
        name: 'ЭКГ',
        to: '/calculation/ecg',
      },
      {
        name: 'Калькулятор ПДР',
        to: '/calculation/pdr',
      },
    ],
  },
  {
    id: 'other',
    name: 'Прочее',
    routes: [
      {
        name: 'Расчет площади тела',
        to: '/calculation/body-surface-area',
      },
      {
        name: 'Конвертер единиц измерения',
        to: '/calculation/convert',
      },
    ],
  },
]

const calculatorRoutes: CalculatorRouteWithGroup[] = calculatorGroups.flatMap((group) => (
  group.routes.map((route) => ({
    ...route,
    groupId: group.id,
    groupName: group.name,
  }))
))

const calculatorRoutesByPath = new Map(
  calculatorRoutes.map((route) => [route.to, route]),
)

const getFavoriteCalculatorRoutes = (favoriteIds: readonly string[]) => (
  favoriteIds.flatMap((favoriteId) => {
    const route = calculatorRoutesByPath.get(favoriteId)

    return route === undefined ? [] : [route]
  })
)

export {
  calculatorGroups,
  calculatorRoutes,
  getFavoriteCalculatorRoutes,
}

export type {
  CalculatorGroup,
  CalculatorRoute,
  CalculatorRouteWithGroup,
}
