import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login(form)
      const { token, userType, firstName, lastName, userId } = res.data
      login({ userType, firstName, lastName, userId, email: form.email }, token)
      navigate(`/${userType}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-5">
      <div className="bg-white rounded-[20px] shadow-modal max-w-md w-full p-10 animate-slide-up">

        <div className="text-center mb-8">
          <div className="text-5xl mb-4" style={{ color: 'var(--primary)' }}>
            <i className="fas fa-balance-scale" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-500">Login to access your LegalConnect account</p>
        </div>

        {error && (
          <div className="alert-error mb-6 flex items-center gap-3">
            <i className="fas fa-exclamation-circle" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-900 font-medium mb-2">Email Address</label>
            <div className="relative">
              <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                className="form-control pl-12"
                placeholder="Enter your email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-900 font-medium mb-2">Password</label>
            <div className="relative">
              <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPw ? 'text' : 'password'}
                className="form-control pl-12 pr-12"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <i className={`fas ${showPw ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-gold w-full py-4 text-lg"
          >
            {loading ? <><i className="fas fa-spinner fa-spin mr-2" />Logging in...</> : 'Login'}
          </button>
        </form>

        <div className="flex items-center my-6 text-gray-400">
          <div className="flex-1 border-b border-border" />
          <span className="px-4 text-sm">Don't have an account?</span>
          <div className="flex-1 border-b border-border" />
        </div>

        <div className="text-center">
          <Link to="/" className="font-semibold" style={{ color: 'var(--primary)' }}>
            Register as Client or Lawyer
          </Link>
        </div>
        <div className="text-center mt-4">
          <Link to="/" className="text-gray-400 text-sm hover:text-primary">
            <i className="fas fa-arrow-left mr-1" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
