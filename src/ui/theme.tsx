import {
  createContext,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type AppTheme = 'dark' | 'light'

type ThemeContextValue = {
  isDark: boolean
  setTheme: (theme: AppTheme) => void
  theme: AppTheme
  toggleTheme: () => void
}

const themeStorageKey = 'vettools-theme'

const isAppTheme = (value: string | null): value is AppTheme => (
  value === 'dark' || value === 'light'
)

const readStoredTheme = (): AppTheme => {
  if (import.meta.env.MODE === 'test') {
    return 'light'
  }

  if (typeof window === 'undefined') {
    return 'light'
  }

  try {
    const storedTheme = window.localStorage.getItem(themeStorageKey)

    return isAppTheme(storedTheme) ? storedTheme : 'light'
  } catch {
    return 'light'
  }
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  setTheme: () => undefined,
  theme: 'light',
  toggleTheme: () => undefined,
})

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>(readStoredTheme)

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme

    if (import.meta.env.MODE === 'test') {
      return
    }

    try {
      window.localStorage.setItem(themeStorageKey, theme)
    } catch {
      // Storage can be unavailable in private or restricted browser modes.
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => currentTheme === 'dark' ? 'light' : 'dark')
  }, [])

  const value = useMemo<ThemeContextValue>(() => ({
    isDark: theme === 'dark',
    setTheme,
    theme,
    toggleTheme,
  }), [theme, toggleTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export { ThemeContext, ThemeProvider }
export type { AppTheme }
