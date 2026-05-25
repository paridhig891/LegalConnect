import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { notifApi } from '../api/api'
import { LogoutModal } from './ui'

// nav config per role — mirrors the three dashboard JSPs exactly
const NAV = {
  client: [
    { to: '/client',               icon: 'fa-home',         label: 'Dashboard Home' },
    { to: '/client/search-lawyers',icon: 'fa-search',       label: 'Search Lawyers' },
    { to: '/client/upload-case',   icon: 'fa-upload',       label: 'Upload Case' },
    { to: '/client/case-tracker',  icon: 'fa-list-check',   label: 'Case Tracker' },
    { to: '/client/chat',          icon: 'fa-comments',     label: 'Case Chat' },
    { to: '/client/notifications', icon: 'fa-bell',         label: 'Notifications', badge: true },
    { to: '/client/profile',       icon: 'fa-user-edit',    label: 'Update Profile' },
    { to: '/client/ai-support',    icon: 'fa-robot',        label: 'AI Support' },
  ],
  lawyer: [
    { to: '/lawyer',               icon: 'fa-home',         label: 'Dashboard Home' },
    { to: '/lawyer/new-cases',     icon: 'fa-folder-plus',  label: 'New Cases' },
    { to: '/lawyer/active-cases',  icon: 'fa-briefcase',    label: 'Active Cases' },
    { to: '/lawyer/chat',          icon: 'fa-comments',     label: 'Case Chat' },
    { to: '/lawyer/notifications', icon: 'fa-bell',         label: 'Notifications', badge: true },
    { to: '/lawyer/profile',       icon: 'fa-user-tie',     label: 'Lawyer Info' },
    { to: '/lawyer/ai-support',    icon: 'fa-robot',        label: 'AI Support' },
  ],
  admin: [
    { to: '/admin',                icon: 'fa-chart-pie',    label: 'Overview' },
    { to: '/admin/lawyers',        icon: 'fa-user-shield',  label: 'Lawyer Management' },
    { to: '/admin/complaints',     icon: 'fa-flag',         label: 'Complaints' },
    { to: '/admin/logs',           icon: 'fa-clipboard-list', label: 'Audit Logs' },
  ],
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showLogout, setShowLogout] = useState(false)
  const [unread, setUnread] = useState(0)
  const role = user?.userType || 'client'
  const navItems = NAV[role] || []

  // Poll notification badge every 12s — matches original setInterval(refreshNotificationBadge, 12000)
  useEffect(() => {
    if (role === 'admin') return
    const fetch = () => {
      notifApi.getAll()
        .then(res => {
          const count = (res.data || []).filter(n => !n.isRead).length
          setUnread(count)
        })
        .catch(() => {})
    }
    fetch()
    const id = setInterval(fetch, 12000)
    return () => clearInterval(id)
  }, [role])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`

  return (
    <>
      <aside className="sidebar">
        {/* ── Header ── */}
        <div className="px-6 py-8 border-b border-white/10">
          <div className="flex items-center gap-3 text-2xl font-bold mb-6">
            <i className="fas fa-balance-scale text-3xl" />
            <span>LegalConnect</span>
          </div>

          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3
                            text-2xl font-bold" style={{ color: 'var(--primary)' }}>
              {initials}
            </div>
            <div className="font-semibold text-base">
              {role === 'lawyer' ? 'Hello, Adv. ' : 'Hello, '}{user?.firstName} {user?.lastName}
            </div>
            <div className="text-sm opacity-80 mt-0.5">{user?.email}</div>
            {role === 'lawyer' && (
              <div className="inline-block mt-2 bg-white/20 text-xs px-3 py-1 rounded-full">
                Verified Lawyer
              </div>
            )}
            {role === 'admin' && (
              <div className="inline-block mt-2 bg-white/20 text-xs px-3 py-1 rounded-full">
                Administrator
              </div>
            )}
          </div>
        </div>

        {/* ── Nav ── */}
        <nav className="py-6">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === `/${role}`}
              className={({ isActive }) =>
                `nav-item${isActive ? ' active' : ''}`
              }
            >
              <i className={`fas ${item.icon} text-xl w-6`} />
              <span className="flex items-center gap-2 text-[0.95rem] font-medium">
                {item.label}
                {item.badge && unread > 0 && (
                  <span className="notif-badge">{unread > 99 ? '99+' : unread}</span>
                )}
              </span>
            </NavLink>
          ))}

          <button
            onClick={() => setShowLogout(true)}
            className="nav-item logout w-full text-left border-0 bg-transparent"
          >
            <i className="fas fa-sign-out-alt text-xl w-6" />
            <span className="text-[0.95rem] font-medium">Logout</span>
          </button>
        </nav>
      </aside>

      {showLogout && (
        <LogoutModal
          onCancel={() => setShowLogout(false)}
          onConfirm={handleLogout}
        />
      )}
    </>
  )
}
