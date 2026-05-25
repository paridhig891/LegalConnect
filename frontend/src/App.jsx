import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import DashboardLayout from './components/DashboardLayout'

// Public pages
import LandingPage    from './pages/LandingPage'
import LoginPage      from './pages/LoginPage'
import ClientRegister from './pages/ClientRegister'
import LawyerRegister from './pages/LawyerRegister'

// Client pages
import ClientHome        from './pages/client/ClientHome'
import SearchLawyers     from './pages/client/SearchLawyers'
import UploadCase        from './pages/client/UploadCase'
import CaseTracker       from './pages/client/CaseTracker'
import ClientAiSupport   from './pages/client/ClientAiSupport'
import ClientProfile     from './pages/client/ClientProfile'

// Lawyer pages
import LawyerHome      from './pages/lawyer/LawyerHome'
import NewCases        from './pages/lawyer/NewCases'
import ActiveCases     from './pages/lawyer/ActiveCases'
import LawyerProfile   from './pages/lawyer/LawyerProfile'
import LawyerAiSupport from './pages/lawyer/LawyerAiSupport'

// Shared pages
import CaseChat     from './pages/shared/CaseChat'
import Notifications from './pages/shared/Notifications'

// Admin pages
import AdminHome       from './pages/admin/AdminHome'
import AdminLawyers    from './pages/admin/AdminLawyers'
import AdminComplaints from './pages/admin/AdminComplaints'
import AdminLogs       from './pages/admin/AdminLogs'

// ── Role-guarded wrapper ──────────────────────────────────────────────────────
function RequireRole({ role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.userType !== role) return <Navigate to={`/${user.userType}`} replace />
  return <DashboardLayout />
}

// ── Root redirect by role ──────────────────────────────────────────────────────
function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  return <Navigate to={`/${user.userType}`} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"                  element={<LandingPage />} />
          <Route path="/login"             element={<LoginPage />} />
          <Route path="/register/client"   element={<ClientRegister />} />
          <Route path="/register/lawyer"   element={<LawyerRegister />} />

          {/* Client dashboard */}
          <Route element={<RequireRole role="client" />}>
            <Route path="/client"                   element={<ClientHome />} />
            <Route path="/client/search-lawyers"    element={<SearchLawyers />} />
            <Route path="/client/upload-case"       element={<UploadCase />} />
            <Route path="/client/case-tracker"      element={<CaseTracker />} />
            <Route path="/client/chat"              element={<CaseChat />} />
            <Route path="/client/notifications"     element={<Notifications />} />
            <Route path="/client/profile"           element={<ClientProfile />} />
            <Route path="/client/ai-support"        element={<ClientAiSupport />} />
          </Route>

          {/* Lawyer dashboard */}
          <Route element={<RequireRole role="lawyer" />}>
            <Route path="/lawyer"                   element={<LawyerHome />} />
            <Route path="/lawyer/new-cases"         element={<NewCases />} />
            <Route path="/lawyer/active-cases"      element={<ActiveCases />} />
            <Route path="/lawyer/chat"              element={<CaseChat />} />
            <Route path="/lawyer/notifications"     element={<Notifications />} />
            <Route path="/lawyer/profile"           element={<LawyerProfile />} />
            <Route path="/lawyer/ai-support"        element={<LawyerAiSupport />} />
          </Route>

          {/* Admin dashboard */}
          <Route element={<RequireRole role="admin" />}>
            <Route path="/admin"                    element={<AdminHome />} />
            <Route path="/admin/lawyers"            element={<AdminLawyers />} />
            <Route path="/admin/complaints"         element={<AdminComplaints />} />
            <Route path="/admin/logs"               element={<AdminLogs />} />
          </Route>

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
