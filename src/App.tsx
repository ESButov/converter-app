import './App.css'
import { Routes, Route } from 'react-router-dom'
import IpsCalculationPage from './pages/calculation/ips'
import AlbuminPage from './pages/calculation/albumin'
import LipidSavePage from './pages/calculation/lipid-save'
import BodySurfaceAreaPage from './pages/calculation/body-surface-area'
import GlucosePage from './pages/calculation/glucose'
import EchoPage from './pages/calculation/echo'
import IvDripPage from './pages/calculation/iv-drip'
import BloodTransfusionPage from './pages/calculation/blood-transfusion'
import KaliumPage from './pages/calculation/kalium'
import EnteralNutritionPage from './pages/calculation/enteral-nutrition'
import EcgPage from './pages/calculation/ecg'
import MainPage from './pages'

function App() {
  return (
    <>
      <section id="center">
        <Routes>
          <Route index element={<MainPage />} />
          <Route path="calculation">
            <Route path='ips' element={<IpsCalculationPage />} />
            <Route path='albumin' element={<AlbuminPage />} />
            <Route path='lipid-save' element={<LipidSavePage />} />
            <Route path='body-surface-area' element={<BodySurfaceAreaPage />} />
            <Route path='glucose' element={<GlucosePage />} />
            <Route path='echo' element={<EchoPage />} />
            <Route path='iv-drip' element={<IvDripPage />} />
            <Route path='blood-transfusion' element={<BloodTransfusionPage />} />
            <Route path='kalium' element={<KaliumPage />} />
            <Route path='enteral-nutrition' element={<EnteralNutritionPage />} />
            <Route path='ecg' element={<EcgPage />} />
          </Route>
        </Routes>
      </section>
    </>
  )
}

export default App
