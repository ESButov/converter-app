import type { CalculatorRoute } from '../data/calculators'

type FavoriteCalculatorButtonProps = {
  isFavorite: boolean
  onToggle: (calculatorId: string) => void
  route: CalculatorRoute
}

function FavoriteCalculatorButton({
  isFavorite,
  onToggle,
  route,
}: FavoriteCalculatorButtonProps) {
  return (
    <button
      aria-label={`${isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}: ${route.name}`}
      aria-pressed={isFavorite}
      className="app-home-favorite-button"
      onClick={() => onToggle(route.to)}
      type="button"
    >
      <span className="app-home-favorite-button__icon" aria-hidden="true">
        {isFavorite ? '★' : '☆'}
      </span>
    </button>
  )
}

export default FavoriteCalculatorButton
