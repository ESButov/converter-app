import { useCallback, useEffect, useMemo, useState } from 'react'

const favoriteCalculatorsStorageKey = 'vettools-favorite-calculators'
const favoriteCalculatorsChangeEvent = 'vettools-favorite-calculators-change'
let fallbackFavoriteCalculatorIds: string[] = []

const getCanUseWindow = () => typeof window !== 'undefined'

const getCanUseStorage = () => (
  getCanUseWindow() && window.localStorage !== undefined
)

const normalizeFavoriteIds = (favoriteIds: readonly unknown[]) => (
  Array.from(new Set(
    favoriteIds.filter((favoriteId): favoriteId is string => (
      typeof favoriteId === 'string' && favoriteId.length > 0
    )),
  ))
)

const readFavoriteCalculatorIds = () => {
  if (!getCanUseStorage()) {
    return fallbackFavoriteCalculatorIds
  }

  try {
    const storedFavoriteIds = window.localStorage.getItem(favoriteCalculatorsStorageKey)

    if (storedFavoriteIds === null) {
      return []
    }

    const parsedFavoriteIds: unknown = JSON.parse(storedFavoriteIds)

    const favoriteIds = Array.isArray(parsedFavoriteIds)
      ? normalizeFavoriteIds(parsedFavoriteIds)
      : []

    fallbackFavoriteCalculatorIds = favoriteIds

    return favoriteIds
  } catch {
    return fallbackFavoriteCalculatorIds
  }
}

const emitFavoriteCalculatorChange = () => {
  if (!getCanUseWindow()) {
    return
  }

  window.dispatchEvent(new Event(favoriteCalculatorsChangeEvent))
}

const writeFavoriteCalculatorIds = (favoriteIds: readonly string[]) => {
  fallbackFavoriteCalculatorIds = normalizeFavoriteIds(favoriteIds)

  if (!getCanUseStorage()) {
    emitFavoriteCalculatorChange()
    return
  }

  try {
    window.localStorage.setItem(
      favoriteCalculatorsStorageKey,
      JSON.stringify(fallbackFavoriteCalculatorIds),
    )
  } catch {
    // Storage can be unavailable in private or restricted browser modes.
  }

  emitFavoriteCalculatorChange()
}

const toggleFavoriteCalculator = (calculatorId: string) => {
  const currentFavoriteIds = readFavoriteCalculatorIds()

  if (currentFavoriteIds.includes(calculatorId)) {
    writeFavoriteCalculatorIds(
      currentFavoriteIds.filter((favoriteId) => favoriteId !== calculatorId),
    )
    return
  }

  writeFavoriteCalculatorIds([...currentFavoriteIds, calculatorId])
}

function useFavoriteCalculatorIds() {
  const [favoriteIds, setFavoriteIds] = useState(readFavoriteCalculatorIds)

  useEffect(() => {
    if (!getCanUseWindow()) {
      return undefined
    }

    const handleFavoriteChange = () => {
      setFavoriteIds(readFavoriteCalculatorIds())
    }

    window.addEventListener(favoriteCalculatorsChangeEvent, handleFavoriteChange)
    window.addEventListener('storage', handleFavoriteChange)

    return () => {
      window.removeEventListener(favoriteCalculatorsChangeEvent, handleFavoriteChange)
      window.removeEventListener('storage', handleFavoriteChange)
    }
  }, [])

  return favoriteIds
}

const clearFavoriteCalculatorIds = () => {
  fallbackFavoriteCalculatorIds = []

  if (getCanUseStorage()) {
    try {
      window.localStorage.removeItem(favoriteCalculatorsStorageKey)
    } catch {
      // Storage can be unavailable in private or restricted browser modes.
    }
  }

  emitFavoriteCalculatorChange()
}

function useFavoriteCalculatorState() {
  const favoriteIds = useFavoriteCalculatorIds()
  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds])
  const toggleFavorite = useCallback((calculatorId: string) => {
    toggleFavoriteCalculator(calculatorId)
  }, [])

  return {
    favoriteIds,
    favoriteIdSet,
    toggleFavorite,
  }
}

export {
  clearFavoriteCalculatorIds,
  favoriteCalculatorsStorageKey,
  readFavoriteCalculatorIds,
  toggleFavoriteCalculator,
  useFavoriteCalculatorState,
}
