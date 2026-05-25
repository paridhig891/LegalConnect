import { useState, useEffect } from 'react'
import { casesApi, clientApi } from '../../api/api'
import { useToast, LoadingState, Modal, StatusBadge } from '../../components/ui'

function TimelineSection({ caseId }) {
  const [items, setItems] = useState(null)
  useEffect(() => {
    casesApi.getTimeline(caseId)
      .then(r => setItems(r.data || []))
      .catch(() => setItems([]))
  }, [caseId])

  if (!items) return <p className="text-gray-400 text-sm">Loading timeline...</p>
  if (items.length === 0) return <p className="text-gray-400 text-sm">No timeline entries yet.</p>

  return (
    <div className="space-y-2 mt-2 w-[100%]">
      {items.map((t, i) => (
        <div key={i} className="text-sm text-gray-700 w-[95%]">
          <strong className="capitalize">{t.status}</strong>
          {t.note && <span> | {t.note}</span>}
          <span className="text-gray-400"> ({t.actorName} | {new Date(t.createdAt).toLocaleString()})</span>
        </div>
      ))}
    </div>
  )
}

function ReviewModal({ caseId, onClose, onDone, show: showModal }) {
  const [rating, setRating]     = useState(5)
  const [text, setText]         = useState('')
  const [submitting, setSub]    = useState(false)
  const [error, setError]       = useState('')
  const { show, ToastEl }       = useToast()

  if (!showModal) return null
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSub(true); setError('')
    try {
      await clientApi.submitReview({ caseId, rating, reviewText: text })
      show('Review submitted!')
      setTimeout(onDone, 1000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review')
    } finally { setSub(false) }
  }

  return (
    <Modal title="Rate Your Lawyer" onClose={onClose}>
      {ToastEl}
      {error && <div className="alert-error mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="block text-gray-900 font-medium mb-3">Rating</label>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(n => (
              <button key={n} type="button" onClick={() => setRating(n)}
                className={`w-10 h-10 rounded-full font-bold border-2 transition-all
                  ${n <= rating ? 'border-yellow-400 bg-yellow-400 text-white' : 'border-gray-200 text-gray-400'}`}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-gray-900 font-medium mb-2">Review (optional)</label>
          <textarea className="form-control" rows={3} value={text} onChange={e => setText(e.target.value)}
            placeholder="Share your experience with this lawyer..." />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 bg-surface border border-border rounded-lg font-semibold hover:bg-gray-100">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary-gold flex-1 py-3">
            {submitting ? <i className="fas fa-spinner fa-spin" /> : 'Submit Review'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function ComplaintModal({ caseId, onClose, onDone, show: showModal }) {
  const [desc, setDesc]       = useState('')
  const [submitting, setSub]  = useState(false)
  const [error, setError]     = useState('')

  if (!showModal) return null
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSub(true); setError('')
    try {
      await clientApi.submitComplaint({ caseId, description: desc })
      onDone()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint')
    } finally { setSub(false) }
  }

  return (
    <Modal title="Raise a Complaint" onClose={onClose}>
      {error && <div className="alert-error mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-900 font-medium mb-2">Describe your complaint <span className="text-red-500">*</span></label>
          <textarea className="form-control" rows={4} value={desc} onChange={e => setDesc(e.target.value)} required
            placeholder="Explain the issue you encountered..." />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 bg-surface border border-border rounded-lg font-semibold hover:bg-gray-100">Cancel</button>
          <button type="submit" disabled={submitting || !desc.trim()} className="flex-1 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600">
            {submitting ? <i className="fas fa-spinner fa-spin" /> : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function CaseTracker() {
  const [cases, setCases]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [reviewCase, setReview] = useState(null)
  const [complaintCase, setComplaint] = useState(null)
  const { show, ToastEl }       = useToast()

  const load = () => {
    casesApi.getTracker()
      .then(r => setCases(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  if (loading) return <LoadingState text="Loading your cases..." />

  return (
    <div>
      {ToastEl}

      <div className="content-header">
        <h1>Case Timeline & Tracking</h1>
        <p>Track status changes, rate lawyers, and raise complaints.</p>
      </div>

      {cases.length === 0 ? (
        <div className="card text-center py-12">
          <i className="fas fa-folder-open text-6xl text-gray-200 mb-4 block" />
          <h3 className="text-gray-900 font-bold text-lg">No Cases Found</h3>
          <p className="text-gray-500 mt-1">Upload your first case to start tracking.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map(c => (
            <div key={c.caseId} className="bg-white border border-border rounded-xl p-5 shadow-card">
              {/* Top row */}
              <div className="flex flex-wrap justify-between gap-4 mb-4">
                <div>
                  <div className="font-bold text-gray-900 text-lg">
                    #{c.caseId} — {c.title}
                  </div>
                  <div className="text-gray-500 text-sm mt-1">
                    {c.type} | {c.city}
                    {c.lawyerName && <> | Lawyer: <strong>{c.lawyerName}</strong></>}
                    {!c.lawyerName && <span className="text-gray-400"> | Awaiting lawyer</span>}
                  </div>
                </div>
                <StatusBadge status={c.status} />
              </div>

              {/* Timeline */}
              <div className="pt-3 border-t border-border">
                <TimelineSection caseId={c.caseId} />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-4">
                {c.canReview && (
                  <button onClick={() => setReview(c.caseId)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 text-sm">
                    <i className="fas fa-star mr-2" /> Submit Review
                  </button>
                )}
                {c.lawyerUserId && (
                  <button onClick={() => setComplaint(c.caseId)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 text-sm">
                    <i className="fas fa-flag mr-2" /> Raise Complaint
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ReviewModal
        caseId={reviewCase}
        show={!!reviewCase}
        onClose={() => setReview(null)}
        onDone={() => { setReview(null); show('Review submitted!'); load() }}
      />
      <ComplaintModal
        caseId={complaintCase}
        show={!!complaintCase}
        onClose={() => setComplaint(null)}
        onDone={() => { setComplaint(null); show('Complaint submitted. Admin will review it.') }}
      />
    </div>
  )
}
