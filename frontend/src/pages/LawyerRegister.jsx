import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/api'

const SPECIALIZATIONS = [
  'Criminal Law','Civil Law','Family Law','Corporate Law',
  'Property Law','Tax Law','Labour Law','Intellectual Property','Consumer Law',
]
const EXPERIENCE = ['0-2 years','3-5 years','6-10 years','10+ years']
const RATES = ['₹500-1000/hour','₹1000-2000/hour','₹2000-5000/hour','₹5000+/hour']

function Field({ label, required, children, hint }) {
  return (
    <div className="mb-5">
      <label className="block text-gray-900 font-medium mb-2 text-sm">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-gray-400 text-xs mt-1">{hint}</p>}
    </div>
  )
}

export default function LawyerRegister() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'', phone:'', city:'', password:'',
    barNumber:'', stateLicensed:'', yearsExperience:'', specialization:'',
    cityPractice:'', hourlyRate:'',
  })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const nextStep = (e) => {
    e.preventDefault()
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.registerLawyer(form)
      navigate('/login?registration=success')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-5 py-10">
      <div className="bg-white rounded-[20px] shadow-modal max-w-lg w-full p-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4" style={{ color: 'var(--primary)' }}>
            <i className="fas fa-gavel" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Lawyer Registration</h2>
          <p className="text-gray-500">Join LegalConnect as a verified advocate</p>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center gap-4 mb-8">
          {[1, 2].map(n => (
            <div key={n} className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
              ${step === n ? 'bg-primary' : step > n ? 'bg-green-500' : 'bg-gray-200'}`}
              style={step === n ? { background: 'var(--primary)' } : {}}
            >
              {step > n ? <i className="fas fa-check text-sm" /> : n}
            </div>
          ))}
        </div>

        {error && (
          <div className="alert-error mb-6"><i className="fas fa-exclamation-circle mr-2" />{error}</div>
        )}

        {/* Step 1 — Personal info */}
        {step === 1 && (
          <form onSubmit={nextStep}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="First Name" required>
                <input className="form-control" value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
              </Field>
              <Field label="Last Name" required>
                <input className="form-control" value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
              </Field>
            </div>
            <Field label="Email Address" required>
              <input type="email" className="form-control" value={form.email} onChange={e => set('email', e.target.value)} required />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone Number" required>
                <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} required />
              </Field>
              <Field label="City" required>
                <input className="form-control" value={form.city} onChange={e => set('city', e.target.value)} required />
              </Field>
            </div>
            <Field label="Password" required>
              <input type="password" className="form-control" minLength={8} value={form.password} onChange={e => set('password', e.target.value)} required />
            </Field>
            <button type="submit" className="btn-primary-gold w-full py-4 text-base mt-2">
              Next: Professional Details <i className="fas fa-arrow-right ml-2" />
            </button>
          </form>
        )}

        {/* Step 2 — Professional info */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Bar Council Number" required>
                <input className="form-control" value={form.barNumber} onChange={e => set('barNumber', e.target.value)} required />
              </Field>
              <Field label="State Licensed" required>
                <input className="form-control" placeholder="e.g. Maharashtra" value={form.stateLicensed} onChange={e => set('stateLicensed', e.target.value)} required />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Years of Experience" required>
                <select className="form-control" value={form.yearsExperience} onChange={e => set('yearsExperience', e.target.value)} required>
                  <option value="">Select</option>
                  {EXPERIENCE.map(o => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Primary Specialization" required>
                <select className="form-control" value={form.specialization} onChange={e => set('specialization', e.target.value)} required>
                  <option value="">Select</option>
                  {SPECIALIZATIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City of Practice" required>
                <input className="form-control" value={form.cityPractice} onChange={e => set('cityPractice', e.target.value)} required />
              </Field>
              <Field label="Hourly Rate" required>
                <select className="form-control" value={form.hourlyRate} onChange={e => set('hourlyRate', e.target.value)} required>
                  <option value="">Select</option>
                  {RATES.map(o => <option key={o}>{o}</option>)}
                </select>
              </Field>
            </div>

            <div className="mt-4 p-4 rounded-lg text-sm text-amber-700" style={{ background:'#fffbeb', border:'1px solid #fcd34d' }}>
              <i className="fas fa-info-circle mr-2" />
              Your account will be pending admin verification before you can accept cases.
            </div>

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 py-3 bg-surface text-gray-800 border border-border rounded-lg font-semibold hover:bg-gray-100">
                <i className="fas fa-arrow-left mr-2" /> Back
              </button>
              <button type="submit" disabled={loading} className="btn-primary-gold flex-1 py-3 text-base">
                {loading ? <><i className="fas fa-spinner fa-spin mr-2" />Registering...</> : 'Submit Application'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-6 text-gray-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold" style={{ color: 'var(--primary)' }}>Login</Link>
        </div>
        <div className="text-center mt-3">
          <Link to="/" className="text-gray-400 text-sm"><i className="fas fa-arrow-left mr-1" /> Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
