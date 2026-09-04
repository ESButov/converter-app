import './App.css'
import { Routes, Route } from 'react-router-dom'
import IpsCalculationPage from './pages/calculation/ips'
import LipidSavePage from './pages/calculation/lipid-save'
import BodySurfaceAreaPage from './pages/calculation/body-surface-area'
import GlucosePage from './pages/calculation/glucose'
import EchoPage from './pages/calculation/echo'
import IvDripPage from './pages/calculation/iv-drip'
import BloodTransfusionPage from './pages/calculation/blood-transfusion'
import KaliumPage from './pages/calculation/kalium'
import EnteralNutritionPage from './pages/calculation/enteral-nutrition'
import EcgPage from './pages/calculation/ecg'
import FlkPage from './pages/calculation/flk'
import MixedInfusionsPage from './pages/calculation/mixed-infusions'
import PepPage from './pages/calculation/pep'
import ElectrolytesPage from './pages/calculation/electrolytes'
import SodiumCorrectionPage from './pages/calculation/sodium-correction'
import GlucoseInsulinPage from './pages/calculation/glucose-insulin'
import ConvertPage from './pages/calculation/convert'
import PdrPage from './pages/calculation/pdr'
import IpscalcPage from './pages/calculation/ipscalc'
import ClrPage from './pages/calculation/clr'
import ToxicologyReferencePage from './pages/reference/toxic'
import ActiveSubstancesReferencePage from './pages/reference/substances'
import VeterinaryPreparationsReferencePage from './pages/reference/preparations'
import MainPage from './pages'
import HomePage from './pages/home'
import ReferencePage from './pages/reference'
import SettingsPage from './pages/settings'
import CalculationLayout from './layouts/CalculationLayout'

function App() {
  return (
    <>
      <section id="center">
        <Routes>
          <Route index element={<MainPage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path='calculation/iv-drip' element={<IvDripPage />} />
          <Route path='calculation/echo' element={<EchoPage />} />
          <Route path='calculation/ecg' element={<EcgPage />} />
          <Route path='calculation/pdr' element={<PdrPage />} />
          <Route path="calculation" element={<CalculationLayout />}>
            <Route path='ips' element={<IpsCalculationPage />} />
            <Route path='lipid-save' element={<LipidSavePage />} />
            <Route path='body-surface-area' element={<BodySurfaceAreaPage />} />
            <Route path='glucose' element={<GlucosePage />} />
            <Route path='blood-transfusion' element={<BloodTransfusionPage />} />
            <Route path='kalium' element={<KaliumPage />} />
            <Route path='enteral-nutrition' element={<EnteralNutritionPage />} />
            <Route path='flk' element={<FlkPage />} />
            <Route path='mixed-infusions' element={<MixedInfusionsPage />} />
            <Route path='pep' element={<PepPage />} />
            <Route path='electrolytes' element={<ElectrolytesPage />} />
            <Route path='sodium-correction' element={<SodiumCorrectionPage />} />
            <Route path='glucose-insulin' element={<GlucoseInsulinPage />} />
            <Route path='convert' element={<ConvertPage />} />
            <Route path='ipscalc' element={<IpscalcPage />} />
            <Route path='clr' element={<ClrPage />} />
          </Route>
          <Route path="reference">
            <Route index element={<ReferencePage />} />
            <Route path='toxic' element={<ToxicologyReferencePage />} />
            <Route path='toxic/:itemId' element={<ToxicologyReferencePage />} />
            <Route path='substances' element={<ActiveSubstancesReferencePage />} />
            <Route path='substances/:substanceId' element={<ActiveSubstancesReferencePage />} />
            <Route path='preparations' element={<VeterinaryPreparationsReferencePage />} />
            <Route path='preparations/:preparationId' element={<VeterinaryPreparationsReferencePage />} />
          </Route>
        </Routes>
      </section>
    </>
  )
}

export default App
