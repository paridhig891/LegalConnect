import { useState, useEffect } from 'react'
import { casesApi } from '../../api/api'
import { useToast, LoadingState, EmptyState, Avatar, formatMoney, formatStatus } from '../../components/ui'

const STATUS_OPTIONS = ['active','in_progress','resolved','closed']

function TimelinePanel({ caseId, visible }) {
  const [items, setItems] = useState(null)
  useEffect(() => {
    if (!visible || items !== null) return
    casesApi.getTimeline(caseId)
      .then(r => setItems(r.data || []))
      .catch(() => setItems([]))
  }, [visible, caseId])

  if (!visible) return null
  return (
    <div className="mt-3 bg-surface border border-border rounded-lg p-4">
      {items == null ? (
        <p className="text-gray-400 text-sm">Loading timeline...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-400 text-sm">No timeline entries yet.</p>
      ) : items.map((t, i) => (
        <div key={i} className="text-sm text-gray-700 mb-1">
          <strong className="capitalize">{t.status}</strong>
          {t.note && <span> | {t.note}</span>}
          <span className="text-gray-400"> ({t.actorName} | {new Date(t.createdAt).toLocaleString()})</span>
        </div>
      ))}
    </div>
  )
}

export default function ActiveCases() {
  const [cases, setCases]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [statusMap, setStatusMap] = useState({})   // caseId → selected status
  const [noteMap, setNoteMap]   = useState({})     // caseId → note text
  const [saving, setSaving]     = useState({})
  const [timelines, setTimelines] = useState({})   // caseId → bool open
  const { show, ToastEl }       = useToast()

  const load = () => {
    setLoading(true)
    casesApi.getActive()
      .then(r => {
        const data = r.data || []
        setCases(data)
        // Pre-fill status dropdowns with current status
        const sm = {}
        data.forEach(c => { sm[c.id] = c.status })
        setStatusMap(sm)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (caseId) => {
    setSaving(s => ({ ...s, [caseId]: true }))
    try {
      await casesApi.updateStatus(caseId, { status: statusMap[caseId], note: noteMap[caseId] || '' })
      show('Case status updated.')
      // Reset timeline cache for this case so it reloads on next open
      setTimelines(t => ({ ...t, [caseId]: false }))
      load()
    } catch (err) {
      show(err.response?.data?.message || 'Failed to update status', 'error')
    } finally {
      setSaving(s => ({ ...s, [caseId]: false }))
    }
  }

  const toggleTimeline = (caseId) => {
    setTimelines(t => ({ ...t, [caseId]: !t[caseId] }))
  }

  return (
    <div>
      {ToastEl}

      <div className="content-header">
        <h1>Active Cases</h1>
        <p>Manage your ongoing client cases</p>
      </div>

      {loading ? <LoadingState text="Loading active cases..." /> : cases.length === 0 ? (
        <EmptyState icon="fa-briefcase" title="No Active Cases" subtitle="Accepted cases will appear here." />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {cases.map(c => (
            <div key={c.id} className="case-card active-border">
              {/* Header */}
              <div className="flex justify-between items-start mb-4 pb-4 border-b-2 border-surface">
                <div>
                  <div className="text-xl font-bold text-gray-900">{c.title}</div>
                  <div className="text-gray-400 text-sm mt-1">Case ID: #{c.id}</div>
                </div>
                <span className="badge-green">{formatStatus(c.status)}</span>
              </div>

              {/* Client info */}
              <div className="flex items-center gap-4 mb-4 p-3 bg-surface rounded-lg">
                <Avatar firstName={c.clientFirstName} lastName={c.clientLastName} size="md" gradient={false} />
                <div>
                  <div className="font-semibold text-gray-900">{c.clientFirstName} {c.clientLastName}</div>
                  <div className="text-gray-400 text-sm">{c.clientEmail}</div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4 text-sm text-gray-500">
                <div className="flex gap-3"><i className="fas fa-gavel w-5 text-green-500" />
                  <span>{c.type}</span></div>
                <div className="flex gap-3"><i className="fas fa-map-marker-alt w-5 text-green-500" />
                  <span>{c.city}</span></div>
                <div className="flex gap-3"><i className="fas fa-money-bill-wave w-5 text-green-500" />
                  <span>{formatMoney(c.budget)}</span></div>
              </div>

              {/* Status control */}
              <div className="mt-4 pt-4 border-t border-border">
                <label className="block text-gray-500 text-xs font-semibold mb-2 uppercase tracking-wide">
                  Update Case Status
                </label>
                <select
                  className="form-control mb-3"
                  value={statusMap[c.id] || c.status}
                  onChange={e => setStatusMap(s => ({ ...s, [c.id]: e.target.value }))}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{formatStatus(s)}</option>
                  ))}
                </select>
                <textarea
                  className="form-control mb-3 resize-y"
                  rows={2}
                  placeholder="Add an optional timeline note"
                  value={noteMap[c.id] || ''}
                  onChange={e => setNoteMap(n => ({ ...n, [c.id]: e.target.value }))}
                />
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => updateStatus(c.id)}
                    disabled={saving[c.id]}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700"
                  >
                    {saving[c.id] ? <i className="fas fa-spinner fa-spin" /> : 'Save Status'}
                  </button>
                  <button
                    onClick={() => toggleTimeline(c.id)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold text-sm hover:bg-gray-600"
                  >
                    {timelines[c.id] ? 'Hide Timeline' : 'View Timeline'}
                  </button>
                </div>
                <TimelinePanel caseId={c.id} visible={!!timelines[c.id]} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
