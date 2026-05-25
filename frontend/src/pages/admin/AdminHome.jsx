import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { adminApi } from '../../api/api'
import { LoadingState } from '../../components/ui'

function StatCard({ icon, value, label, colorClass }) {
  return (
    <div className="stat-card">
      <div className="stat-icon"><i className={`fas ${icon}`} /></div>
      <div className={`text-4xl font-bold mb-2 ${colorClass || 'text-gray-900'}`}>{value ?? '—'}</div>
      <div className="text-gray-500 text-sm">{label}</div>
    </div>
  )
}

export default function AdminHome() {
  const { user }  = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getStats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="content-header">
        <h1>Admin Dashboard</h1>
        <p>Platform overview and management controls</p>
      </div>

      {/* Welcome banner */}
      <div className="rounded-xl p-6 mb-8 text-white"
        style={{ background: 'linear-gradient(135deg, #0B1F3A 0%, #C9A227 100%)' }}>
        <h2 className="text-2xl font-bold mb-1">
          <i className="fas fa-shield-alt mr-3" />
          Welcome, {user?.firstName}!
        </h2>
        <p className="opacity-90">You have full administrative control over the LegalConnect platform.</p>
      </div>

      {/* Stats */}
      {loading ? <LoadingState text="Loading platform stats..." /> : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon="fa-user-clock"    value={stats?.pendingVerifications} label="Pending Verifications" colorClass="text-amber-500" />
          <StatCard icon="fa-flag"          value={stats?.openComplaints}       label="Open Complaints"       colorClass="text-red-500" />
          <StatCard icon="fa-users"         value={stats?.activeUsers}          label="Active Users"          colorClass="text-green-600" />
          <StatCard icon="fa-briefcase"     value={stats?.activeCases}          label="Active Cases"          colorClass="text-blue-600" />
        </div>
      )}

      {/* Quick access cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            icon: 'fa-user-shield', title: 'Lawyer Management',
            desc: 'Review pending verifications, verify or suspend lawyer accounts.',
            path: '/admin/lawyers', badge: stats?.pendingVerifications
          },
          {
            icon: 'fa-flag', title: 'Complaints',
            desc: 'Review and resolve complaints filed between clients and lawyers.',
            path: '/admin/complaints', badge: stats?.openComplaints
          },
          {
            icon: 'fa-clipboard-list', title: 'Audit Logs',
            desc: 'View the full history of admin actions on the platform.',
            path: '/admin/logs', badge: null
          },
        ].map(card => (
          <a key={card.title} href={card.path}
            className="card hover:shadow-card-hover hover:-translate-y-1 transition-all cursor-pointer no-underline block">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl mb-4 relative"
              style={{ background: 'linear-gradient(135deg, #0B1F3A 0%, #C9A227 100%)' }}>
              <i className={`fas ${card.icon}`} />
              {card.badge > 0 && (
                <span className="absolute -top-1 -right-1 notif-badge">{card.badge}</span>
              )}
            </div>
            <h3 className="mb-2">{card.title}</h3>
            <p>{card.desc}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
