import { useState, useEffect } from 'react'
import { notifApi } from '../../api/api'
import { LoadingState, EmptyState } from '../../components/ui'

const TYPE_META = {
  case_request: { icon: 'fa-folder-plus',   color: '#3b82f6', label: 'New Case'       },
  case_status:  { icon: 'fa-sync-alt',      color: '#f59e0b', label: 'Status Update'  },
  review:       { icon: 'fa-star',          color: '#f59e0b', label: 'Review Request' },
  admin:        { icon: 'fa-shield-alt',    color: '#ef4444', label: 'Admin Action'   },
  info:         { icon: 'fa-info-circle',   color: '#6b7280', label: 'Info'           },
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Notifications() {
  const [notifs, setNotifs]   = useState([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

  const load = () => {
    notifApi.getAll()
      .then(r => setNotifs(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const markAllRead = async () => {
    setMarking(true)
    try {
      await notifApi.markAllRead()
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch {}
    finally { setMarking(false) }
  }

  const unreadCount = notifs.filter(n => !n.isRead).length

  if (loading) return <LoadingState text="Loading notifications..." />

  return (
    <div>
      {/* Header with mark-all-read — matches notifications.jsp header exactly */}
      <div className="content-header flex justify-between items-center">
        <div>
          <h1>
            Notifications
            {unreadCount > 0 && (
              <span className="ml-3 badge-red text-base">{unreadCount} unread</span>
            )}
          </h1>
          <p>Stay updated with all your case and platform activity</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={marking}
            className="btn-primary-gold flex items-center gap-2"
          >
            {marking
              ? <><i className="fas fa-spinner fa-spin" /> Marking...</>
              : <><i className="fas fa-check-double" /> Mark All Read</>}
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <EmptyState
          icon="fa-bell-slash"
          title="No Notifications"
          subtitle="You're all caught up! New notifications will appear here."
        />
      ) : (
        <div className="space-y-3">
          {notifs.map(n => {
            const meta = TYPE_META[n.type] || TYPE_META.info
            return (
              <div
                key={n.notificationId}
                className={`bg-white rounded-xl px-5 py-4 shadow-card border-l-4 transition-all
                  ${!n.isRead ? 'border-l-primary' : 'border-l-gray-200 opacity-70'}`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-white text-lg"
                    style={{ background: meta.color }}
                  >
                    <i className={`fas ${meta.icon}`} />
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="font-bold text-gray-900 text-base">{n.title}</div>
                        <div className="text-gray-500 text-sm mt-1 leading-relaxed">{n.message}</div>
                        {n.relatedCaseId && (
                          <div className="text-xs mt-1" style={{ color: 'var(--primary)' }}>
                            Case #{n.relatedCaseId}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full text-white font-semibold"
                          style={{ background: meta.color }}
                        >
                          {meta.label}
                        </span>
                        <span className="text-gray-400 text-xs">{timeAgo(n.createdAt)}</span>
                        {!n.isRead && (
                          <span className="inline-block w-2 h-2 rounded-full bg-red-500 mt-0.5" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
