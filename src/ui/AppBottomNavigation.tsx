import type { ReactNode } from 'react'
import {
  Link,
  useInRouterContext,
  useLocation,
  type To,
} from 'react-router-dom'

type BottomNavigationItem = {
  activePathPrefixes: readonly string[]
  iconClassName: string
  label: string
  to: string
}

type BottomNavigationLinkProps = {
  children: ReactNode
  className: string
  label: string
  to: To
}

const hashHrefFromTo = (to: To) => {
  if (typeof to !== 'string') {
    const pathname = to.pathname ?? '/'
    const search = to.search ?? ''
    const hash = to.hash ?? ''

    return `#${pathname}${search}${hash}`
  }

  return `#${to}`
}

const bottomNavigationItems: readonly BottomNavigationItem[] = [
  {
    activePathPrefixes: ['/reference'],
    iconClassName: 'app-home-bottom-nav__icon--reference',
    label: 'Справочник',
    to: '/reference',
  },
  {
    activePathPrefixes: ['/', '/home', '/calculation'],
    iconClassName: 'app-home-bottom-nav__icon--calculator',
    label: 'Калькуляторы',
    to: '/home',
  },
  {
    activePathPrefixes: ['/notes'],
    iconClassName: 'app-home-bottom-nav__icon--notes',
    label: 'Заметки',
    to: '/notes',
  },
  {
    activePathPrefixes: ['/favorites'],
    iconClassName: 'app-home-bottom-nav__icon--favorites',
    label: 'Избранное',
    to: '/favorites',
  },
  {
    activePathPrefixes: ['/settings'],
    iconClassName: 'app-home-bottom-nav__icon--settings',
    label: 'Настройки',
    to: '/settings',
  },
]

const getIsActiveItem = (pathname: string, item: BottomNavigationItem) => (
  item.activePathPrefixes.some((prefix) => (
    prefix === '/'
      ? pathname === '/'
      : pathname === prefix || pathname.startsWith(`${prefix}/`)
  ))
)

const getItemClassName = (isActive: boolean) => [
  'app-home-bottom-nav__item',
  isActive ? 'active' : '',
].filter(Boolean).join(' ')

function StaticBottomNavigationLink({
  children,
  className,
  label,
  to,
}: BottomNavigationLinkProps) {
  return (
    <a aria-label={label} className={className} href={hashHrefFromTo(to)}>
      {children}
    </a>
  )
}

function BottomNavigationContent({
  iconClassName,
  label,
}: Pick<BottomNavigationItem, 'iconClassName' | 'label'>) {
  const iconClass = [
    'app-home-bottom-nav__icon',
    iconClassName,
  ].join(' ')

  return (
    <>
      <span className={iconClass} aria-hidden="true" />
      <span className="app-home-bottom-nav__label" aria-hidden="true">
        {label}
      </span>
    </>
  )
}

function RoutedBottomNavigation() {
  const location = useLocation()

  return (
    <nav className="app-home-bottom-nav" aria-label="Основная навигация">
      {bottomNavigationItems.map((item) => {
        const isActive = getIsActiveItem(location.pathname, item)

        return (
          <Link
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.label}
            className={getItemClassName(isActive)}
            key={item.to}
            to={item.to}
          >
            <BottomNavigationContent
              iconClassName={item.iconClassName}
              label={item.label}
            />
          </Link>
        )
      })}
    </nav>
  )
}

function AppBottomNavigation() {
  const isInRouter = useInRouterContext()

  if (isInRouter) {
    return <RoutedBottomNavigation />
  }

  return (
    <nav className="app-home-bottom-nav" aria-label="Основная навигация">
      {bottomNavigationItems.map((item) => (
        <StaticBottomNavigationLink
          className="app-home-bottom-nav__item"
          key={item.to}
          label={item.label}
          to={item.to}
        >
          <BottomNavigationContent
            iconClassName={item.iconClassName}
            label={item.label}
          />
        </StaticBottomNavigationLink>
      ))}
    </nav>
  )
}

export default AppBottomNavigation
