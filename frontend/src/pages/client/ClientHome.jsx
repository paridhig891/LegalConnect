import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function ClientHome() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const quickActions = [
    { icon: 'fa-upload',  label: 'Upload Case',       path: '/client/upload-case' },
    { icon: 'fa-search',  label: 'Search Lawyers',    path: '/client/search-lawyers' },
    { icon: 'fa-list-check', label: 'Track My Cases', path: '/client/case-tracker' },
    { icon: 'fa-comments', label: 'Case Chat',        path: '/client/chat' },
  ]

  return (
    <div>
      <div className="content-header">
        <h1>Welcome Back, {user?.firstName}!</h1>
        <p>Here's what's happening with your legal matters today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: 'fa-briefcase',     label: 'Active Cases',        value: '—' },
          { icon: 'fa-users',          label: 'Lawyer Connections',  value: '—' },
          { icon: 'fa-calendar-check', label: 'Appointments',        value: '—' },
          { icon: 'fa-file-alt',       label: 'Documents',           value: '—' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon"><i className={`fas ${s.icon}`} /></div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{s.value}</div>
            <div className="text-gray-500 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card">
        <h3>Quick Actions</h3>
        <p className="mb-6">Get started by uploading your case or searching for the perfect lawyer to handle your legal matter.</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(a => (
            <button
              key={a.label}
              onClick={() => navigate(a.path)}
              className="p-4 bg-surface border-2 border-border rounded-lg text-center cursor-pointer
                         transition-all font-semibold text-gray-900
                         hover:bg-primary hover:text-white hover:border-primary hover:-translate-y-0.5"
            >
              <i className={`fas ${a.icon} block text-3xl mb-2`} />
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
