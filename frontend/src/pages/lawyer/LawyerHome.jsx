import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { lawyersApi } from '../../api/api'

function AnimatedStat({ value, suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (value == null) return
    const target = parseFloat(value) || 0
    const duration = 1000
    const steps = 60
    const inc = target / steps
    let cur = 0
    const id = setInterval(() => {
      cur = Math.min(cur + inc, target)
      setDisplay(decimals ? cur.toFixed(decimals) : Math.round(cur))
      if (cur >= target) clearInterval(id)
    }, duration / steps)
    return () => clearInterval(id)
  }, [value, decimals])
  return <>{display}{suffix}</>
}

export default function LawyerHome() {
  const { user }      = useAuth()
  const navigate      = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    lawyersApi.getStats()
      .then(r => setStats(r.data))
      .catch(() => setStats({ newCases: 0, activeCases: 0, totalClients: 0, avgRating: 0 }))
      .finally(() => setLoading(false))
  }, [])

  const cards = stats ? [
    { icon: 'fa-folder-open', id: 'new',     label: 'New Case Requests', value: stats.newCases,     decimals: 0 },
    { icon: 'fa-briefcase',   id: 'active',  label: 'Active Cases',      value: stats.activeCases,  decimals: 0 },
    { icon: 'fa-users',       id: 'clients', label: 'Total Clients',      value: stats.totalClients, decimals: 0 },
    { icon: 'fa-star',        id: 'rating',  label: 'Average Rating',     value: stats.avgRating,    decimals: 1 },
  ] : []

  const quickActions = [
    { icon: 'fa-folder-plus', label: 'View New Cases',      path: '/lawyer/new-cases' },
    { icon: 'fa-briefcase',   label: 'Manage Active Cases', path: '/lawyer/active-cases' },
    { icon: 'fa-user-edit',   label: 'Update Profile',      path: '/lawyer/profile' },
  ]

  return (
    <div>
      <div className="content-header">
        <h1>Welcome Back, Adv. {user?.firstName}!</h1>
        <p>Here's an overview of your legal practice today.</p>
      </div>

      {/* Stats grid with animated counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon"><div className="spinner" /></div>
              <div className="text-3xl font-bold text-gray-900 mb-2 flex justify-center">
                <div className="spinner" />
              </div>
              <div className="text-gray-500 text-sm">Loading...</div>
            </div>
          ))
        ) : cards.map(c => (
          <div key={c.id} className="stat-card">
            <div className="stat-icon"><i className={`fas ${c.icon}`} /></div>
            <div className="text-3xl font-bold text-gray-900 mb-2 min-h-[48px] flex items-center justify-center">
              <AnimatedStat value={c.value} decimals={c.decimals} />
            </div>
            <div className="text-gray-500 text-sm">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card mb-6">
        <h3>Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {quickActions.map(a => (
            <button key={a.label} onClick={() => navigate(a.path)}
              className="p-4 bg-surface border-2 border-border rounded-lg text-center font-semibold text-gray-900
                         transition-all hover:bg-primary hover:text-white hover:border-primary hover:-translate-y-0.5">
              <i className={`fas ${a.icon} block text-3xl mb-2`} />
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tips card */}
      <div className="card">
        <h3>Professional Tips</h3>
        <p className="mt-2"><strong>Complete your profile:</strong> Add your bio, education, and specializations to increase visibility.</p>
        <p className="mt-3"><strong>Respond quickly:</strong> Fast response times to new cases increase your acceptance rate.</p>
        <p className="mt-3"><strong>Keep cases updated:</strong> Regular updates help maintain client trust and satisfaction.</p>
      </div>
    </div>
  )
}
