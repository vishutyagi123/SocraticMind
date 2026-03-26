import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
