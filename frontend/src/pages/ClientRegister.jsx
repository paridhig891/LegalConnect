import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/api'

function Field({ label, required, children }) {
  return (
    <div className="mb-5">
      <label className="block text-gray-900 font-medium mb-2 text-sm">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function ClientRegister() {
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phone:'', city:'', password:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.registerClient(form)
      navigate('/login?registration=success')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-5">
      <div className="bg-white rounded-[20px] shadow-modal max-w-md w-full p-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4" style={{ color: 'var(--primary)' }}>
            <i className="fas fa-user-plus" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Client Registration</h2>
          <p className="text-gray-500">Create your LegalConnect client account</p>
        </div>

        {error && (
          <div className="alert-error mb-6"><i className="fas fa-exclamation-circle mr-2" />{error}</div>
        )}

        <form onSubmit={handleSubmit}>
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

          <button type="submit" disabled={loading} className="btn-primary-gold w-full py-4 text-base mt-2">
            {loading ? <><i className="fas fa-spinner fa-spin mr-2" />Registering...</> : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-6 text-gray-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold" style={{ color: 'var(--primary)' }}>Login</Link>
        </div>
        <div className="text-center mt-3">
          <Link to="/" className="text-gray-400 text-sm hover:text-primary">
            <i className="fas fa-arrow-left mr-1" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
