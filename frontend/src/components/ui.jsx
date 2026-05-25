import { useState, useEffect } from 'react'

// ── Toast notification (replaces showNotification() in all JSPs) ──────────────
export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  const bg = type === 'success' ? 'bg-green-500' : 'bg-red-500'
  return (
    <div
      className={`fixed top-5 right-5 z-50 px-5 py-4 rounded-lg shadow-xl text-white font-semibold text-sm
        ${bg} animate-slide-up flex items-center gap-3`}
      style={{ animation: 'slideIn .3s ease' }}
    >
      <i className={`fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`} />
      {message}
      <button onClick={onClose} className="ml-2 opacity-80 hover:opacity-100">
        <i className="fas fa-times" />
      </button>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState(null)
  const show = (message, type = 'success') => setToast({ message, type })
  const hide = () => setToast(null)
  const ToastEl = toast
    ? <Toast message={toast.message} type={toast.type} onClose={hide} />
    : null
  return { show, ToastEl }
}

// ── Logout confirm modal (identical to all three dashboard JSPs) ──────────────
export function LogoutModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 max-w-sm w-[90%] text-center shadow-modal">
        <div className="text-5xl text-amber-400 mb-4">
          <i className="fas fa-exclamation-triangle" />
        </div>
        <h2 className="text-gray-900 text-2xl font-bold mb-2">Logout Confirmation</h2>
        <p className="text-gray-500 mb-8">Are you sure you want to logout?</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-surface text-gray-800 border border-border rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            <i className="fas fa-sign-out-alt mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Generic modal container ───────────────────────────────────────────────────
export function Modal({ title, onClose, children, maxWidth = 'max-w-xl' }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className={`bg-white rounded-xl ${maxWidth} w-full max-h-[90vh] overflow-y-auto shadow-modal`}>
        <div className="flex justify-between items-center px-6 py-4 border-b-2 border-surface">
          <h2 className="text-gray-900 text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">
            &times;
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', center = false }) {
  const sizes = { sm: 'w-5 h-5 border-2', md: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4' }
  const el = (
    <div
      className={`${sizes[size]} rounded-full border-gray-200 border-t-primary animate-spin inline-block`}
      style={{ borderTopColor: 'var(--primary)' }}
    />
  )
  if (center) return <div className="flex justify-center py-12">{el}</div>
  return el
}

// ── Loading state for full pages ──────────────────────────────────────────────
export function LoadingState({ text = 'Loading...' }) {
  return (
    <div className="text-center py-16">
      <i className="fas fa-spinner fa-spin text-5xl mb-4" style={{ color: 'var(--primary)' }} />
      <p className="text-gray-500 mt-4">{text}</p>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="text-center py-16 bg-white rounded-xl shadow-card">
      <i className={`fas ${icon} text-6xl text-gray-200 mb-4`} />
      <h3 className="text-gray-900 font-bold text-lg mb-2">{title}</h3>
      {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
    </div>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    pending:     'badge-blue',
    active:      'badge-green',
    in_progress: 'badge-gold',
    resolved:    'badge-gray',
    closed:      'badge-gray',
    open:        'badge-red',
    in_review:   'badge-blue',
  }
  const label = (status || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return <span className={map[status] || 'badge-gray'}>{label}</span>
}

// ── Urgency badge ─────────────────────────────────────────────────────────────
export function UrgencyBadge({ urgency = '' }) {
  const u = urgency.toLowerCase()
  if (u.includes('very')) return <span className="badge-red">{urgency}</span>
  if (u.includes('urgent')) return <span className="badge-gold">{urgency}</span>
  return <span className="badge-blue">{urgency || 'Normal'}</span>
}

// ── Avatar initials ───────────────────────────────────────────────────────────
export function Avatar({ firstName = '', lastName = '', size = 'md', gradient = true }) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  const sizes = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-xl',
    lg: 'w-[70px] h-[70px] text-2xl',
    xl: 'w-24 h-24 text-3xl',
  }
  const bg = gradient
    ? 'background: linear-gradient(135deg, #0B1F3A 0%, #C9A227 100%)'
    : 'background: linear-gradient(135deg, #0B1F3A, #0B1F3A)'
  return (
    <div
      className={`${sizes[size]} rounded-full text-white flex items-center justify-center font-bold flex-shrink-0`}
      style={{ background: gradient ? 'linear-gradient(135deg, #0B1F3A 0%, #C9A227 100%)' : '#0B1F3A' }}
    >
      {initials}
    </div>
  )
}

// ── Alert box ─────────────────────────────────────────────────────────────────
export function Alert({ type, message, onClose }) {
  if (!message) return null
  return (
    <div className={`${type === 'success' ? 'alert-success' : 'alert-error'} mb-6 flex items-start gap-3`}>
      <i className={`fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mt-0.5`} />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-60 hover:opacity-100 text-sm">&times;</button>
      )}
    </div>
  )
}

// ── Page header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle }) {
  return (
    <div className="content-header">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  )
}

// ── Detail row (icon + label: value) ──────────────────────────────────────────
export function DetailRow({ icon, label, value, iconColor = 'text-primary' }) {
  return (
    <div className="flex items-center gap-3 py-2 text-gray-500 text-sm">
      <i className={`fas ${icon} ${iconColor} w-5`} />
      <span><strong className="text-gray-900">{label}:</strong> {value}</span>
    </div>
  )
}

// ── Format currency ───────────────────────────────────────────────────────────
export function formatMoney(val) {
  if (!val) return 'Not specified'
  return val.replace(/Rs\./gi, '₹').replace(/Rs/gi, '₹').replace(/₹\s+/g, '₹')
}

// ── Format status ─────────────────────────────────────────────────────────────
export function formatStatus(s) {
  return (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
