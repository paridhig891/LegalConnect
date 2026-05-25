import { useState, useEffect } from 'react'
import { casesApi } from '../../api/api'
import { useToast, LoadingState, EmptyState, UrgencyBadge, Avatar, formatMoney } from '../../components/ui'

export default function NewCases() {
  const [cases, setCases]     = useState([])
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState({})
  const { show, ToastEl }     = useToast()

  const load = () => {
    setLoading(true)
    casesApi.getPending()
      .then(r => setCases(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const accept = async (caseId) => {
    if (!window.confirm('Are you sure you want to accept this case?')) return
    setAccepting(a => ({ ...a, [caseId]: true }))
    try {
      await casesApi.accept(caseId)
      show('Case accepted successfully! Check Active Cases.')
      // Animate removal — matching original fade-out behaviour
      setTimeout(() => {
        setCases(prev => prev.filter(c => c.id !== caseId))
      }, 800)
    } catch (err) {
      show(err.response?.data?.message || 'Error accepting case', 'error')
      setAccepting(a => ({ ...a, [caseId]: false }))
    }
  }

  return (
    <div>
      {ToastEl}

      <div className="content-header">
        <h1>New Case Requests</h1>
        <p>Review and respond to client case submissions</p>
      </div>

      {loading ? <LoadingState text="Loading cases..." /> : cases.length === 0 ? (
        <EmptyState icon="fa-inbox" title="No New Cases"
          subtitle="New cases will appear here when clients submit requests." />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {cases.map(c => {
            const isAccepting = accepting[c.id]
            return (
              <div key={c.id} className="case-card" id={`case-${c.id}`}>
                {/* Header */}
                <div className="flex justify-between items-start mb-4 pb-4 border-b-2 border-surface">
                  <div>
                    <div className="text-xl font-bold text-gray-900">{c.title}</div>
                    <div className="text-gray-400 text-sm mt-1">Case ID: #{c.id}</div>
                  </div>
                  <UrgencyBadge urgency={c.urgency} />
                </div>

                {/* Client info block */}
                <div className="flex items-center gap-4 mb-4 p-4 bg-surface rounded-lg">
                  <Avatar firstName={c.clientFirstName} lastName={c.clientLastName} size="md" gradient={false} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">
                      {c.clientFirstName} {c.clientLastName}
                    </div>
                    <div className="text-gray-400 text-sm truncate">
                      <i className="fas fa-envelope mr-1" />{c.clientEmail}
                      {c.clientPhone && <><span className="mx-2">|</span><i className="fas fa-phone mr-1" />{c.clientPhone}</>}
                    </div>
                  </div>
                </div>

                {/* Case details */}
                <div className="space-y-2 mb-4 text-sm text-gray-500">
                  {[
                    { icon:'fa-gavel',          label:'Type',      val: c.type },
                    { icon:'fa-map-marker-alt', label:'Location',  val: c.city },
                    { icon:'fa-money-bill-wave',label:'Budget',    val: formatMoney(c.budget) },
                    { icon:'fa-calendar',       label:'Submitted', val: new Date(c.createdAt).toLocaleDateString() },
                  ].map(d => (
                    <div key={d.label} className="flex gap-3">
                      <i className={`fas ${d.icon} w-5`} style={{ color:'var(--primary)' }} />
                      <span><strong className="text-gray-900">{d.label}:</strong> {d.val}</span>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div className="bg-surface p-4 rounded-lg text-gray-500 text-sm leading-relaxed mb-4">
                  <strong>Description:</strong><br />{c.caseDescription}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  {c.documentPath ? (
                    <a href={`/uploads/${c.documentPath}`} target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-2 py-3 bg-surface border border-border rounded-lg font-semibold text-gray-800 hover:bg-gray-100 text-sm">
                      <i className="fas fa-download" /> Download Doc
                    </a>
                  ) : (
                    <button disabled className="flex items-center justify-center gap-2 py-3 bg-surface text-gray-400 rounded-lg font-semibold text-sm cursor-not-allowed">
                      <i className="fas fa-file" /> No Document
                    </button>
                  )}

                  <button
                    onClick={() => accept(c.id)}
                    disabled={isAccepting}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white text-sm transition-all
                      ${isAccepting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                  >
                    {isAccepting
                      ? <><i className="fas fa-spinner fa-spin" /> Accepting...</>
                      : <><i className="fas fa-check" /> Accept Case</>}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
