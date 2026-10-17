import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { PlatformProvider } from './context/PlatformContext'
import Layout from './components/layout/Layout'
import LoginPage from './pages/Login/LoginPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import UniversitiesPage from './pages/Universities/UniversitiesPage'
import UniversityWizard from './pages/Universities/UniversityWizard'
import UniversityDetailPage from './pages/Universities/UniversityDetailPage'

function ProtectedLayout() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedLayout />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/universities" element={<UniversitiesPage />} />
          <Route path="/universities/new" element={<UniversityWizard />} />
          <Route path="/universities/:id" element={<UniversityDetailPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <PlatformProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </PlatformProvider>
    </AuthProvider>
  )
}
