import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
