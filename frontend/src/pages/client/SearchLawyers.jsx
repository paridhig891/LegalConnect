import { useState, useEffect } from 'react'
import { lawyersApi } from '../../api/api'
import { LoadingState, EmptyState, Avatar, Modal } from '../../components/ui'

const SPECIALIZATIONS = ['','Criminal Law','Civil Law','Family Law','Corporate Law','Property Law','Tax Law','Labour Law','Intellectual Property','Consumer Law']
const EXPERIENCE       = ['','0-2 years','3-5 years','6-10 years','10+ years']
const RATES            = ['','₹500-1000/hour','₹1000-2000/hour','₹2000-5000/hour','₹5000+/hour']

function StarRating({ rating }) {
  const r = rating || 0
  return (
    <span className="text-yellow-400 text-sm">
      {'★'.repeat(Math.round(r))}{'☆'.repeat(5 - Math.round(r))}
      <span className="text-gray-500 ml-1">({r.toFixed(1)})</span>
    </span>
  )
}

function ContactModal({ lawyer, onClose }) {
  const [copied, setCopied] = useState(null)
  if (!lawyer) return null

  const copy = (val, label) => {
    navigator.clipboard.writeText(val)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <Modal title="Contact Lawyer" onClose={onClose}>
      {/* Lawyer summary at top of modal */}
      <div className="text-center mb-6 pb-6 border-b border-surface">
        <Avatar firstName={lawyer.firstName} lastName={lawyer.lastName} size="lg" />
        <div className="mt-3 font-bold text-gray-900 text-lg">Adv. {lawyer.firstName} {lawyer.lastName}</div>
        <div className="text-sm font-semibold mt-1" style={{ color: 'var(--primary)' }}>{lawyer.specialization}</div>
        <StarRating rating={lawyer.avgRating} />
      </div>

      <div className="space-y-3">
        {[
          { icon: 'fa-envelope', label: 'Email', value: lawyer.email },
          { icon: 'fa-phone',    label: 'Phone', value: lawyer.phone },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 p-4 bg-surface rounded-lg">
            <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-white text-lg"
              style={{ background: '#0B1F3A' }}>
              <i className={`fas ${icon}`} />
            </div>
            <div className="flex-1">
              <div className="text-gray-400 text-xs mb-0.5">{label}</div>
              <div className="text-gray-900 font-semibold">{value}</div>
            </div>
            <button onClick={() => copy(value, label)}
              className="px-3 py-1.5 text-white text-sm font-semibold rounded-lg transition-all"
              style={{ background: copied === label ? '#10b981' : 'var(--primary)' }}>
              {copied === label ? <><i className="fas fa-check mr-1" />Copied</> : 'Copy'}
            </button>
          </div>
        ))}
      </div>
    </Modal>
  )
}

export default function SearchLawyers() {
  const [lawyers, setLawyers]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [contact, setContact]   = useState(null)
  const [filters, setFilters]   = useState({ specialization:'', experience:'', hourlyRate:'', location:'' })

  const load = (f = filters) => {
    setLoading(true)
    const params = {}
    if (f.specialization) params.specialization = f.specialization
    if (f.experience)     params.experience     = f.experience
    if (f.hourlyRate)     params.hourlyRate      = f.hourlyRate
    if (f.location)       params.location        = f.location
    lawyersApi.search(params)
      .then(r => setLawyers(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const reset = () => {
    const cleared = { specialization:'', experience:'', hourlyRate:'', location:'' }
    setFilters(cleared)
    load(cleared)
  }

  return (
    <div>
      <div className="content-header">
        <h1>Search Lawyers</h1>
        <p>Find and connect with verified legal professionals</p>
      </div>

      {/* Filter card */}
      <div className="card mb-2">
        <h3>Filter Lawyers</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { key:'specialization', label:'Specialization', opts: SPECIALIZATIONS },
            { key:'experience',     label:'Experience',     opts: EXPERIENCE },
            { key:'hourlyRate',     label:'Hourly Rate',    opts: RATES },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-gray-900 font-medium mb-2 text-sm">{f.label}</label>
              <select className="form-control" value={filters[f.key]}
                onChange={e => setFilters(prev => ({ ...prev, [f.key]: e.target.value }))}>
                <option value="">All</option>
                {f.opts.filter(Boolean).map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label className="block text-gray-900 font-medium mb-2 text-sm">Location</label>
            <input className="form-control" placeholder="City or State" value={filters.location}
              onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))} />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => load()} className="btn-primary-gold flex-1 py-3">
            <i className="fas fa-search mr-2" /> Search
          </button>
          <button onClick={reset} className="px-6 py-3 bg-surface border border-border rounded-lg font-semibold hover:bg-gray-100">
            Reset
          </button>
        </div>
      </div>

      {loading ? <LoadingState text="Searching lawyers..." /> : lawyers.length === 0 ? (
        <EmptyState icon="fa-user-slash" title="No Lawyers Found" subtitle="Try adjusting your filters." />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
          {lawyers.map(l => (
            <div key={l.userId}
              className="bg-white rounded-xl p-6 shadow-card border-2 border-transparent
                         transition-all hover:-translate-y-1 hover:shadow-card-hover hover:border-primary">
              {/* Lawyer header */}
              <div className="flex gap-4 mb-4 pb-4 border-b-2 border-surface">
                <Avatar firstName={l.firstName} lastName={l.lastName} size="lg" gradient={false} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-lg">Adv. {l.firstName} {l.lastName}</span>
                    {l.isVerified && (
                      <span className="badge-green text-xs py-0.5 px-2">✓ Verified</span>
                    )}
                  </div>
                  <div className="font-semibold text-sm mt-0.5" style={{ color: 'var(--primary)' }}>
                    {l.specialization}
                  </div>
                  <StarRating rating={l.avgRating} />
                  <div className="text-gray-400 text-xs mt-0.5">{l.reviewCount} review{l.reviewCount !== 1 ? 's' : ''}</div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4 text-sm text-gray-500">
                {[
                  { icon:'fa-map-marker-alt', val: l.city || l.cityPractice },
                  { icon:'fa-briefcase',      val: l.yearsExperience },
                  { icon:'fa-money-bill-wave',val: l.hourlyRate },
                  { icon:'fa-certificate',    val: `Bar: ${l.barNumber}` },
                ].filter(d => d.val).map((d, i) => (
                  <div key={i} className="flex gap-2">
                    <i className={`fas ${d.icon} w-4`} style={{ color:'var(--primary)' }} />
                    <span>{d.val}</span>
                  </div>
                ))}
              </div>

              {l.bio && (
                <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">{l.bio}</p>
              )}

              <button onClick={() => setContact(l)} className="btn-primary-gold w-full py-3 text-sm">
                <i className="fas fa-envelope mr-2" /> Contact Lawyer
              </button>
            </div>
          ))}
        </div>
      )}

      <ContactModal lawyer={contact} onClose={() => setContact(null)} />
    </div>
  )
}
