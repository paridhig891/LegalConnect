import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { lawyersApi, authApi } from '../../api/api'
import { Alert, Avatar } from '../../components/ui'

const SPECIALIZATIONS = ['Criminal Law','Civil Law','Family Law','Corporate Law','Property Law','Tax Law','Labour Law','Intellectual Property','Consumer Law']
const EXPERIENCE       = ['0-2 years','3-5 years','6-10 years','10+ years']
const RATES            = ['₹500-1000/hour','₹1000-2000/hour','₹2000-5000/hour','₹5000+/hour']

export default function LawyerProfile() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '', phone: '', city: '',
    bio:'', primarySpecialization:'', hourlyRate:'', cityPractice:'', yearsExperience:'',
  })
  const [pwForm, setPwForm]   = useState({ currentPassword:'', newPassword:'' })
  const [alert, setAlert]     = useState(null)
  const [pwAlert, setPwAlert] = useState(null)
  const [saving, setSaving]   = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setPw = (k, v) => setPwForm(f => ({ ...f, [k]: v }))

  const handleProfile = async (e) => {
    e.preventDefault(); setSaving(true); setAlert(null)
    try {
      // Update both personal (auth) and lawyer professional info
      await Promise.all([
        authApi.updateProfile({ firstName: form.firstName, lastName: form.lastName, phone: form.phone, city: form.city }),
        lawyersApi.updateProfile({ bio: form.bio, primarySpecialization: form.primarySpecialization, hourlyRate: form.hourlyRate, cityPractice: form.cityPractice, yearsExperience: form.yearsExperience }),
      ])
      setAlert({ type:'success', msg:'Profile updated successfully!' })
    } catch (err) {
      setAlert({ type:'error', msg: err.response?.data?.message || 'Update failed.' })
    } finally { setSaving(false) }
  }

  const handlePassword = async (e) => {
    e.preventDefault(); setSavingPw(true); setPwAlert(null)
    try {
      await authApi.changePassword(pwForm)
      setPwAlert({ type:'success', msg:'Password changed successfully!' })
      setPwForm({ currentPassword:'', newPassword:'' })
    } catch (err) {
      setPwAlert({ type:'error', msg: err.response?.data?.message || 'Password change failed.' })
    } finally { setSavingPw(false) }
  }

  return (
    <div>
      <div className="content-header">
        <h1>Lawyer Profile</h1>
        <p>Manage your professional information and credentials</p>
      </div>

      <div className="max-w-3xl mx-auto">
        {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

        <div className="card">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center font-bold text-white text-3xl"
              style={{ background: 'linear-gradient(135deg, #0B1F3A 0%, #C9A227 100%)' }}>
              {(user?.firstName || '').charAt(0)}{(user?.lastName || '').charAt(0)}
            </div>
          </div>

          <form onSubmit={handleProfile}>
            <h3 className="pb-4 border-b-2 border-surface mb-6">Personal Information</h3>

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

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-gray-900 font-medium mb-2 text-sm">Phone Number</label>
                <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-900 font-medium mb-2 text-sm">City</label>
                <input className="form-control" value={form.city} onChange={e => set('city', e.target.value)} />
              </div>
            </div>

            <h3 className="mt-8 mb-6 pb-4 border-b-2 border-surface">Professional Details</h3>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-gray-900 font-medium mb-2 text-sm">Years of Experience</label>
                <select className="form-control" value={form.yearsExperience} onChange={e => set('yearsExperience', e.target.value)}>
                  <option value="">Select Experience</option>
                  {EXPERIENCE.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-900 font-medium mb-2 text-sm">Primary Specialization</label>
                <select className="form-control" value={form.primarySpecialization} onChange={e => set('primarySpecialization', e.target.value)}>
                  <option value="">Select Specialization</option>
                  {SPECIALIZATIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-gray-900 font-medium mb-2 text-sm">City of Practice</label>
                <input className="form-control" value={form.cityPractice} onChange={e => set('cityPractice', e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-900 font-medium mb-2 text-sm">Hourly Rate</label>
                <select className="form-control" value={form.hourlyRate} onChange={e => set('hourlyRate', e.target.value)}>
                  <option value="">Select Rate</option>
                  {RATES.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-900 font-medium mb-2 text-sm">Professional Bio</label>
              <textarea className="form-control" rows={4} value={form.bio}
                onChange={e => set('bio', e.target.value)}
                placeholder="Describe your legal expertise, achievements, and approach..." />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setForm(f => ({ ...f, bio:'', primarySpecialization:'', hourlyRate:'', cityPractice:'', yearsExperience:'' }))}
                className="flex-1 py-3 bg-surface border border-border rounded-lg font-semibold hover:bg-gray-100">
                <i className="fas fa-undo mr-2" /> Reset
              </button>
              <button type="submit" disabled={saving} className="btn-primary-gold flex-1 py-3">
                {saving ? <i className="fas fa-spinner fa-spin" /> : <><i className="fas fa-save mr-2" />Update Profile</>}
              </button>
            </div>
          </form>
        </div>

        {/* Change password */}
        <div className="card">
          {pwAlert && <Alert type={pwAlert.type} message={pwAlert.msg} onClose={() => setPwAlert(null)} />}
          <h3 className="pb-4 border-b-2 border-surface mb-6">Change Password</h3>
          <form onSubmit={handlePassword}>
            <div className="mb-5">
              <label className="block text-gray-900 font-medium mb-2 text-sm">Current Password <span className="text-red-500">*</span></label>
              <input type="password" className="form-control" value={pwForm.currentPassword} onChange={e => setPw('currentPassword', e.target.value)} required />
            </div>
            <div className="mb-6">
              <label className="block text-gray-900 font-medium mb-2 text-sm">New Password <span className="text-red-500">*</span></label>
              <input type="password" className="form-control" minLength={8} value={pwForm.newPassword} onChange={e => setPw('newPassword', e.target.value)} required />
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
