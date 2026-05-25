import { useState, useEffect } from 'react'
import { adminApi } from '../../api/api'
import { LoadingState, EmptyState, useToast } from '../../components/ui'

const ACTION_LABELS = {
  verify:    { label: 'Verify',    bg: 'bg-green-500 hover:bg-green-600',  icon: 'fa-check-circle'  },
  unverify:  { label: 'Unverify',  bg: 'bg-yellow-500 hover:bg-yellow-600',icon: 'fa-times-circle'  },
  suspend:   { label: 'Suspend',   bg: 'bg-red-500 hover:bg-red-600',      icon: 'fa-ban'           },
  activate:  { label: 'Activate',  bg: 'bg-blue-500 hover:bg-blue-600',    icon: 'fa-check'         },
}

function ActionBtn({ action, onClick, loading }) {
  const meta = ACTION_LABELS[action]
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${meta.bg} flex items-center gap-1`}
    >
      {loading
        ? <i className="fas fa-spinner fa-spin" />
        : <><i className={`fas ${meta.icon}`} /> {meta.label}</>}
    </button>
  )
}

export default function AdminLawyers() {
  const [lawyers, setLawyers]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [acting, setActing]     = useState({})   // userId → action in flight
  const [filter, setFilter]     = useState('all') // all | pending | verified | suspended
  const { show, ToastEl }       = useToast()

  const load = () => {
    adminApi.getLawyers()
      .then(r => setLawyers(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const doAction = async (userId, action) => {
    setActing(a => ({ ...a, [userId]: action }))
    try {
      await adminApi.action({ targetUserId: userId, action })
      show(`Action "${action}" performed successfully.`)
      load()
    } catch (err) {
      show(err.response?.data?.message || 'Action failed.', 'error')
    } finally {
      setActing(a => { const n = { ...a }; delete n[userId]; return n })
    }
  }

  const filtered = lawyers.filter(l => {
    if (filter === 'pending')   return !l.isVerified && l.isActive
    if (filter === 'verified')  return l.isVerified && l.isActive
    if (filter === 'suspended') return !l.isActive
    return true
  })

  const counts = {
    all:       lawyers.length,
    pending:   lawyers.filter(l => !l.isVerified && l.isActive).length,
    verified:  lawyers.filter(l => l.isVerified && l.isActive).length,
    suspended: lawyers.filter(l => !l.isActive).length,
  }

  return (
    <div>
      {ToastEl}

      <div className="content-header">
        <h1>Lawyer Management</h1>
        <p>Verify, suspend, or manage lawyer accounts</p>
      </div>

      {/* Filter tabs — matching the four tabs in admin-lawyers.jsp */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'all',       label: 'All Lawyers'  },
          { key: 'pending',   label: 'Pending Verification' },
          { key: 'verified',  label: 'Verified'     },
          { key: 'suspended', label: 'Suspended'    },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border-2 flex items-center gap-2
              ${filter === tab.key
                ? 'border-primary text-white'
                : 'border-border bg-white text-gray-700 hover:border-primary'}`}
            style={filter === tab.key ? { background: 'var(--primary)', borderColor: 'var(--primary)' } : {}}
          >
            {tab.label}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full
              ${filter === tab.key ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {loading ? <LoadingState text="Loading lawyers..." /> : filtered.length === 0 ? (
        <EmptyState icon="fa-user-slash" title="No Lawyers Found" subtitle="No lawyers match this filter." />
      ) : (
        <div className="space-y-4">
          {filtered.map(l => (
            <div key={l.userId}
              className="bg-white rounded-xl p-5 shadow-card border-l-4 flex flex-wrap gap-4 items-center"
              style={{ borderLeftColor: l.isVerified ? '#10b981' : l.isActive ? 'var(--primary)' : '#ef4444' }}
            >
              {/* Initials avatar */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #0B1F3A 0%, #C9A227 100%)' }}
              >
                {(l.firstName || '').charAt(0)}{(l.lastName || '').charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-base flex items-center gap-2 flex-wrap">
                  Adv. {l.firstName} {l.lastName}
                  {l.isVerified && <span className="badge-green text-xs">✓ Verified</span>}
                  {!l.isActive  && <span className="badge-red text-xs">Suspended</span>}
                  {!l.isVerified && l.isActive && <span className="badge-gold text-xs">Pending</span>}
                </div>
                <div className="text-gray-400 text-sm mt-1">
                  {l.email} | {l.specialization} | {l.city}
                </div>
                <div className="text-gray-400 text-xs mt-0.5">Bar: {l.barNumber}</div>
              </div>

              {/* Action buttons — available actions depend on current state */}
              <div className="flex flex-wrap gap-2 flex-shrink-0">
                {!l.isVerified && l.isActive && (
                  <ActionBtn action="verify"   onClick={() => doAction(l.userId, 'verify')}   loading={acting[l.userId] === 'verify'} />
                )}
                {l.isVerified && (
                  <ActionBtn action="unverify" onClick={() => doAction(l.userId, 'unverify')} loading={acting[l.userId] === 'unverify'} />
                )}
                {l.isActive && (
                  <ActionBtn action="suspend"  onClick={() => doAction(l.userId, 'suspend')}  loading={acting[l.userId] === 'suspend'} />
                )}
                {!l.isActive && (
                  <ActionBtn action="activate" onClick={() => doAction(l.userId, 'activate')} loading={acting[l.userId] === 'activate'} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
