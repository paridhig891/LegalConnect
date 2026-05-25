import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../api/api'
import { Alert, Avatar } from '../../components/ui'

export default function ClientProfile() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    phone:     '',
    city:      '',
  })
  const [pwForm, setPwForm]   = useState({ currentPassword: '', newPassword: '' })
  const [alert, setAlert]     = useState(null)
  const [pwAlert, setPwAlert] = useState(null)
  const [saving, setSaving]   = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setPw = (k, v) => setPwForm(f => ({ ...f, [k]: v }))

  const handleProfile = async (e) => {
    e.preventDefault()
    setSaving(true); setAlert(null)
    try {
      await authApi.updateProfile(form)
      setAlert({ type: 'success', msg: 'Profile updated successfully!' })
    } catch (err) {
      setAlert({ type: 'error', msg: err.response?.data?.message || 'Update failed.' })
    } finally { setSaving(false) }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    setSavingPw(true); setPwAlert(null)
    try {
      await authApi.changePassword(pwForm)
      setPwAlert({ type: 'success', msg: 'Password changed successfully!' })
      setPwForm({ currentPassword: '', newPassword: '' })
    } catch (err) {
      setPwAlert({ type: 'error', msg: err.response?.data?.message || 'Password change failed.' })
    } finally { setSavingPw(false) }
  }

  return (
    <div>
      <div className="content-header">
        <h1>Update Profile</h1>
        <p>Manage your personal information</p>
      </div>

      <div className="max-w-2xl mx-auto">
        {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

        <div className="card">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <Avatar firstName={user?.firstName} lastName={user?.lastName} size="xl" />
          </div>

          <h3 className="pb-4 border-b-2 border-surface mb-6">Personal Information</h3>

          <form onSubmit={handleProfile}>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-gray-900 font-medium mb-2 text-sm">First Name <span className="text-red-500">*</span></label>
                <input className="form-control" value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
              </div>
              <div>
                <label className="block text-gray-900 font-medium mb-2 text-sm">Last Name <span className="text-red-500">*</span></label>
                <input className="form-control" value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-gray-900 font-medium mb-2 text-sm">Email Address</label>
              <input className="form-control" value={user?.email} disabled />
              <p className="text-gray-400 text-xs mt-1">Email cannot be changed</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-900 font-medium mb-2 text-sm">Phone Number</label>
                <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Your phone number" />
              </div>
              <div>
                <label className="block text-gray-900 font-medium mb-2 text-sm">City</label>
                <input className="form-control" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Your city" />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setForm({ firstName: user?.firstName||'', lastName: user?.lastName||'', phone:'', city:'' })}
                className="flex-1 py-3 bg-surface border border-border rounded-lg font-semibold hover:bg-gray-100">
                <i className="fas fa-undo mr-2" /> Reset
              </button>
              <button type="submit" disabled={saving} className="btn-primary-gold flex-1 py-3">
                {saving ? <i className="fas fa-spinner fa-spin" /> : <><i className="fas fa-save mr-2" />Update Profile</>}
              </button>
            </div>
          </form>
        </div>

        {/* Change password card */}
        <div className="card">
          {pwAlert && <Alert type={pwAlert.type} message={pwAlert.msg} onClose={() => setPwAlert(null)} />}
          <h3 className="pb-4 border-b-2 border-surface mb-6">Change Password</h3>
          <form onSubmit={handlePassword}>
            <div className="mb-5">
              <label className="block text-gray-900 font-medium mb-2 text-sm">Current Password <span className="text-red-500">*</span></label>
              <input type="password" className="form-control" value={pwForm.currentPassword}
                onChange={e => setPw('currentPassword', e.target.value)} required />
            </div>
            <div className="mb-6">
              <label className="block text-gray-900 font-medium mb-2 text-sm">New Password <span className="text-red-500">*</span></label>
              <input type="password" className="form-control" minLength={8} value={pwForm.newPassword}
                onChange={e => setPw('newPassword', e.target.value)} required />
            </div>
            <button type="submit" disabled={savingPw} className="btn-primary-gold w-full py-3">
              {savingPw ? <i className="fas fa-spinner fa-spin" /> : <><i className="fas fa-lock mr-2" />Change Password</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
