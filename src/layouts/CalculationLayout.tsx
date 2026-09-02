// src/layouts/CalculatorLayout.tsx
import { Link, Outlet } from 'react-router-dom'
import './CalculationLayout.css'

export default function CalculationLayout() {
  return (
    <main className="calculator-layout">
      <Link className="calculator-layout__home" to="/" aria-label="На главную">
        ←
      </Link>

      <section className="calculator-layout__content">
        <Outlet />
      </section>
    </main>
  )
}