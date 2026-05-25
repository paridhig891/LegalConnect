import { useState, useEffect, useRef } from 'react'
import { casesApi } from '../../api/api'
import { useToast, Modal, LoadingState, EmptyState, StatusBadge, formatMoney } from '../../components/ui'

const CASE_TYPES = ['Criminal Law','Civil Law','Family Law','Corporate Law','Property Law','Tax Law','Labour Law','Intellectual Property','Consumer Law','Other']
const URGENCY    = ['Normal','Urgent','Very Urgent']
const BUDGETS    = ['₹5,000-10,000','₹10,000-25,000','₹25,000-50,000','₹50,000-1,00,000','₹1,00,000+']

export default function UploadCase() {
  const [cases, setCases]     = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fileName, setFileName] = useState('')
  const fileRef = useRef()
  const { show, ToastEl } = useToast()

  const [form, setForm] = useState({
    caseTitle: '', caseType: '', city: '', urgency: 'Normal',
    budget: '', caseDescription: '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const loadCases = () => {
    casesApi.getMyCases()
      .then(r => setCases(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadCases() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (fileRef.current?.files[0]) fd.append('document', fileRef.current.files[0])
      await casesApi.submit(fd)
      show('Case submitted successfully! Lawyers will be notified.')
      setShowModal(false)
      setForm({ caseTitle:'', caseType:'', city:'', urgency:'Normal', budget:'', caseDescription:'' })
      setFileName('')
      loadCases()
    } catch (err) {
      show(err.response?.data?.message || 'Failed to submit case', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      {ToastEl}

      {/* Header with "Add New Case" button — matches original layout */}
      <div className="content-header flex justify-between items-center">
        <div>
          <h1>Upload Case</h1>
          <p>Submit your legal case to connect with verified lawyers</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary-gold">
          <i className="fas fa-plus mr-2" /> Add New Case
        </button>
      </div>

      {/* Cases list */}
      {loading ? <LoadingState text="Loading your cases..." /> : cases.length === 0 ? (
        <EmptyState icon="fa-folder-open" title="No Cases Yet"
          subtitle="Click 'Add New Case' to submit your first legal case." />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {cases.map(c => (
            <div key={c.id} className="case-card">
              <div className="flex justify-between items-start mb-4 pb-4 border-b-2 border-surface">
                <div>
                  <div className="text-xl font-bold text-gray-900">{c.title}</div>
                  <div className="text-gray-400 text-sm mt-1">Case ID: #{c.id}</div>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex gap-2"><i className="fas fa-gavel w-5" style={{ color:'var(--primary)' }} />
                  <span><strong className="text-gray-900">Type:</strong> {c.type}</span></div>
                <div className="flex gap-2"><i className="fas fa-map-marker-alt w-5" style={{ color:'var(--primary)' }} />
                  <span><strong className="text-gray-900">Location:</strong> {c.city}</span></div>
                <div className="flex gap-2"><i className="fas fa-money-bill-wave w-5" style={{ color:'var(--primary)' }} />
                  <span><strong className="text-gray-900">Budget:</strong> {formatMoney(c.budget)}</span></div>
                <div className="flex gap-2"><i className="fas fa-calendar w-5" style={{ color:'var(--primary)' }} />
                  <span><strong className="text-gray-900">Submitted:</strong> {new Date(c.createdAt).toLocaleDateString()}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Case Modal — matches original modal UX */}
      {showModal && (
        <Modal title="Submit New Case" onClose={() => setShowModal(false)} maxWidth="max-w-2xl">
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-gray-900 font-medium mb-2 text-sm">Case Title <span className="text-red-500">*</span></label>
              <input className="form-control" value={form.caseTitle} onChange={e => set('caseTitle', e.target.value)} required placeholder="Brief title for your case" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="mb-5">
                <label className="block text-gray-900 font-medium mb-2 text-sm">Case Type <span className="text-red-500">*</span></label>
                <select className="form-control" value={form.caseType} onChange={e => set('caseType', e.target.value)} required>
                  <option value="">Select Type</option>
                  {CASE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="mb-5">
                <label className="block text-gray-900 font-medium mb-2 text-sm">City <span className="text-red-500">*</span></label>
                <input className="form-control" value={form.city} onChange={e => set('city', e.target.value)} required placeholder="City where case applies" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="mb-5">
                <label className="block text-gray-900 font-medium mb-2 text-sm">Urgency <span className="text-red-500">*</span></label>
                <select className="form-control" value={form.urgency} onChange={e => set('urgency', e.target.value)}>
                  {URGENCY.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div className="mb-5">
                <label className="block text-gray-900 font-medium mb-2 text-sm">Budget</label>
                <select className="form-control" value={form.budget} onChange={e => set('budget', e.target.value)}>
                  <option value="">Select Budget</option>
                  {BUDGETS.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-gray-900 font-medium mb-2 text-sm">Case Description <span className="text-red-500">*</span></label>
              <textarea className="form-control" rows={4} value={form.caseDescription}
                onChange={e => set('caseDescription', e.target.value)} required
                placeholder="Describe your legal situation in detail..." />
            </div>

            {/* File upload — same dashed-border drag target as original */}
            <div className="mb-6">
              <label className="block text-gray-900 font-medium mb-2 text-sm">Supporting Document (Optional)</label>
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer
                           transition-all hover:border-primary hover:bg-surface"
                onClick={() => fileRef.current?.click()}
              >
                <i className="fas fa-cloud-upload-alt text-5xl text-gray-400 mb-3 block" />
                <p className="text-gray-500">Click to upload or drag & drop</p>
                <p className="text-gray-400 text-sm mt-1">PDF, DOC, DOCX, JPG (max 5MB)</p>
                {fileName && (
                  <p className="mt-3 font-semibold" style={{ color: 'var(--primary)' }}>
                    <i className="fas fa-file-check mr-2" />{fileName}
                  </p>
                )}
              </div>
              <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={e => setFileName(e.target.files[0]?.name || '')} />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-surface">
              <button type="button" onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-surface text-gray-800 border border-border rounded-lg font-semibold hover:bg-gray-100">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary-gold px-8 py-3">
                {submitting ? <><i className="fas fa-spinner fa-spin mr-2" />Submitting...</> : 'Submit Case'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
