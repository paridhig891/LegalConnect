import { useState, useEffect } from 'react'
import { adminApi } from '../../api/api'
import { LoadingState, EmptyState, useToast, Modal } from '../../components/ui'

const STATUS_COLORS = {
  open:      'badge-red',
  in_review: 'badge-blue',
  resolved:  'badge-green',
}

function ResolveModal({ complaint, onClose, onResolved }) {
  const [status, setStatus] = useState(complaint.status === 'open' ? 'in_review' : 'resolved')
  const [note, setNote]     = useState(complaint.resolutionNote || '')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await adminApi.updateComplaint(complaint.complaintId, { status, resolutionNote: note })
      onResolved()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update complaint.')
    } finally { setSaving(false) }
  }

  return (
    <Modal title={`Complaint #${complaint.complaintId}`} onClose={onClose}>
      {error && <div className="alert-error mb-4">{error}</div>}

      {/* Complaint summary */}
      <div className="bg-surface rounded-lg p-4 mb-5 text-sm text-gray-700 space-y-1">
        <div><strong>Case:</strong> #{complaint.caseId}</div>
        <div><strong>Filed by:</strong> {complaint.complainantName}</div>
        <div><strong>Against:</strong> {complaint.againstName}</div>
        <div><strong>Description:</strong> {complaint.description}</div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="block text-gray-900 font-medium mb-2 text-sm">Update Status</label>
          <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="open">Open</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-gray-900 font-medium mb-2 text-sm">Resolution Note</label>
          <textarea className="form-control" rows={4} value={note} onChange={e => setNote(e.target.value)}
            placeholder="Add a note about the resolution or investigation..." />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 bg-surface border border-border rounded-lg font-semibold hover:bg-gray-100">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary-gold flex-1 py-3">
            {saving ? <i className="fas fa-spinner fa-spin" /> : 'Update Complaint'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState(null)
  const [filter, setFilter]         = useState('all')
  const { show, ToastEl }           = useToast()

  const load = () => {
    adminApi.getComplaints()
      .then(r => setComplaints(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = filter === 'all'
    ? complaints
    : complaints.filter(c => c.status === filter)

  const counts = {
    all:       complaints.length,
    open:      complaints.filter(c => c.status === 'open').length,
    in_review: complaints.filter(c => c.status === 'in_review').length,
    resolved:  complaints.filter(c => c.status === 'resolved').length,
  }

  return (
    <div>
      {ToastEl}

      <div className="content-header">
        <h1>Complaints Management</h1>
        <p>Review and resolve disputes between clients and lawyers</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'all',       label: 'All'       },
          { key: 'open',      label: 'Open'      },
          { key: 'in_review', label: 'In Review' },
          { key: 'resolved',  label: 'Resolved'  },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border-2 flex items-center gap-2
              ${filter === tab.key
                ? 'text-white'
                : 'border-border bg-white text-gray-700 hover:border-primary'}`}
            style={filter === tab.key
              ? { background: 'var(--primary)', borderColor: 'var(--primary)' }
              : {}}
          >
            {tab.label}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full
              ${filter === tab.key ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {loading ? <LoadingState text="Loading complaints..." /> : filtered.length === 0 ? (
        <EmptyState icon="fa-flag" title="No Complaints" subtitle="No complaints match this filter." />
      ) : (
        <div className="space-y-4">
          {filtered.map(c => (
            <div key={c.complaintId}
              className="bg-white rounded-xl p-5 shadow-card border-l-4"
              style={{ borderLeftColor: c.status === 'resolved' ? '#10b981' : c.status === 'in_review' ? '#3b82f6' : '#ef4444' }}
            >
              <div className="flex flex-wrap justify-between gap-3 items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className="font-bold text-gray-900">Complaint #{c.complaintId}</span>
                    <span className={STATUS_COLORS[c.status] || 'badge-gray'}>
                      {(c.status || '').replace(/_/g, ' ')}
                    </span>
                    <span className="text-gray-400 text-xs">Case #{c.caseId}</span>
                  </div>

                  <div className="text-sm text-gray-700 space-y-1">
                    <div>
                      <strong>Filed by:</strong> {c.complainantName}
                      <span className="mx-2 text-gray-300">|</span>
                      <strong>Against:</strong> {c.againstName}
                    </div>
                    <div className="text-gray-500">{c.description}</div>
                    {c.resolutionNote && (
                      <div className="mt-2 p-3 bg-green-50 text-green-800 rounded-lg text-xs border border-green-200">
                        <strong>Resolution:</strong> {c.resolutionNote}
                      </div>
                    )}
                    <div className="text-gray-400 text-xs">
                      Filed: {new Date(c.createdAt).toLocaleDateString()}
                      {c.resolvedAt && <> | Resolved: {new Date(c.resolvedAt).toLocaleDateString()}</>}
                    </div>
                  </div>
                </div>

                {c.status !== 'resolved' && (
                  <button
                    onClick={() => setSelected(c)}
                    className="btn-primary-gold px-4 py-2 text-sm flex-shrink-0"
                  >
                    <i className="fas fa-edit mr-2" /> Manage
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <ResolveModal
          complaint={selected}
          onClose={() => setSelected(null)}
          onResolved={() => {
            setSelected(null)
            show('Complaint updated.')
            load()
          }}
        />
      )}
    </div>
  )
}
