import { useState, useEffect } from 'react'
import { adminApi } from '../../api/api'
import { LoadingState, EmptyState } from '../../components/ui'

const ACTION_META = {
  VERIFY_LAWYER:   { color: '#10b981', icon: 'fa-check-circle',  label: 'Verify Lawyer'   },
  UNVERIFY_LAWYER: { color: '#f59e0b', icon: 'fa-times-circle',  label: 'Unverify Lawyer' },
  SUSPEND_USER:    { color: '#ef4444', icon: 'fa-ban',           label: 'Suspend User'    },
  ACTIVATE_USER:   { color: '#3b82f6', icon: 'fa-check',         label: 'Activate User'   },
  UPDATE_COMPLAINT:{ color: '#6366f1', icon: 'fa-flag',          label: 'Update Complaint'},
}

export default function AdminLogs() {
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    adminApi.getLogs()
      .then(r => setLogs(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = logs.filter(l => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      l.action?.toLowerCase().includes(s) ||
      l.adminName?.toLowerCase().includes(s) ||
      l.targetName?.toLowerCase().includes(s) ||
      l.details?.toLowerCase().includes(s)
    )
  })

  return (
    <div>
      <div className="content-header">
        <h1>Admin Audit Logs</h1>
        <p>Full history of all administrative actions on the platform (last 100)</p>
      </div>

      {/* Search */}
      <div className="card mb-6 py-4">
        <div className="relative max-w-md">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="form-control pl-11"
            placeholder="Search by action, admin, or target..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? <LoadingState text="Loading audit logs..." /> : filtered.length === 0 ? (
        <EmptyState icon="fa-clipboard-list" title="No Logs Found" subtitle="No audit log entries match your search." />
      ) : (
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[1fr_1.5fr_1fr_1.5fr_1.2fr] gap-4 px-5 py-3
            bg-surface border-b border-border text-gray-500 text-xs font-semibold uppercase tracking-wide">
            <span>Action</span>
            <span>Admin</span>
            <span>Target User</span>
            <span>Details</span>
            <span>Date & Time</span>
          </div>

          {/* Rows */}
          {filtered.map((log, i) => {
            const meta = ACTION_META[log.action] || { color: '#6b7280', icon: 'fa-cog', label: log.action }
            return (
              <div
                key={log.id}
                className={`px-5 py-4 border-b border-gray-50 transition-colors hover:bg-surface
                  md:grid md:grid-cols-[1fr_1.5fr_1fr_1.5fr_1.2fr] md:gap-4 md:items-center
                  flex flex-col gap-1`}
              >
                {/* Action badge */}
                <div>
                  <span
                    className="inline-flex items-center gap-1.5 text-white text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: meta.color }}
                  >
                    <i className={`fas ${meta.icon}`} />
                    {meta.label}
                  </span>
                </div>

                {/* Admin */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: '#0B1F3A' }}
                  >
                    {(log.adminName || '').charAt(0)}
                  </div>
                  <span className="text-gray-900 text-sm font-medium truncate">{log.adminName}</span>
                </div>

                {/* Target */}
                <div className="text-gray-700 text-sm">
                  {log.targetName
                    ? <span className="font-medium">{log.targetName}</span>
                    : <span className="text-gray-400">—</span>}
                </div>

                {/* Details */}
                <div className="text-gray-500 text-sm truncate">{log.details || '—'}</div>

                {/* Timestamp */}
                <div className="text-gray-400 text-xs whitespace-nowrap">
                  <i className="fas fa-clock mr-1" />
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
