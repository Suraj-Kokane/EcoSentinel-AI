import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout.jsx'
import { GeoDataProvider } from './store/GeoDataContext.jsx'
import { LiveDataProvider } from './store/LiveDataContext.jsx'

import Dashboard from './pages/Dashboard.jsx'
import EnvironmentalIntelligence from './pages/EnvironmentalIntelligence.jsx'
import RiskMapPage from './pages/RiskMapPage.jsx'
import SatelliteIntelligence from './pages/SatelliteIntelligence.jsx'
import AIPrediction from './pages/AIPrediction.jsx'
import DisasterIntelligence from './pages/DisasterIntelligence.jsx'
import Analytics from './pages/Analytics.jsx'
import CitizenReports from './pages/CitizenReports.jsx'
import IotMonitoring from './pages/IotMonitoring.jsx'
import Infrastructure from './pages/Infrastructure.jsx'
import AlertCenter from './pages/AlertCenter.jsx'
import CommandCenter from './pages/CommandCenter.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  return (
    <GeoDataProvider>
      <LiveDataProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/environmental" element={<EnvironmentalIntelligence />} />
            <Route path="/risk-map" element={<RiskMapPage />} />
            <Route path="/satellite-intelligence" element={<SatelliteIntelligence />} />
            <Route path="/ai-prediction" element={<AIPrediction />} />
            <Route path="/disasters" element={<DisasterIntelligence />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/citizen-reports" element={<CitizenReports />} />
            <Route path="/iot" element={<IotMonitoring />} />
            <Route path="/infrastructure" element={<Infrastructure />} />
            <Route path="/alerts" element={<AlertCenter />} />
            <Route path="/command-center" element={<CommandCenter />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </LiveDataProvider>
    </GeoDataProvider>
  )
}