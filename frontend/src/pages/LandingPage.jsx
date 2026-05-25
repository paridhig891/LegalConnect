import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-5">
      <div className="bg-white rounded-[20px] shadow-modal max-w-[900px] w-full p-12 text-center animate-slide-up">

        <div className="text-[4rem] mb-4" style={{ color: '#0B1F3A' }}>
          <i className="fas fa-balance-scale" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to LegalConnect</h1>
        <p className="text-gray-500 text-xl mb-12">AI-Powered Legal Services Platform</p>

        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <Link to="/login" className="btn-primary-gold flex items-center gap-2 text-base">
            <i className="fas fa-sign-in-alt" /> Login
          </Link>
          <Link to="/register/client" className="btn-primary-gold flex items-center gap-2 text-base">
            <i className="fas fa-user-plus" /> Register as Client
          </Link>
          <Link
            to="/register/lawyer"
            className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg font-semibold border-2 text-base transition-all hover:bg-primary hover:text-white hover:border-primary"
            style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
          >
            <i className="fas fa-gavel" /> Register as Lawyer
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { icon: 'fa-search',      title: 'Find Lawyers',  desc: 'Search and connect with verified lawyers across India' },
            { icon: 'fa-file-upload', title: 'Upload Cases',  desc: 'Submit your legal cases online with ease' },
            { icon: 'fa-robot',       title: 'AI Support',    desc: 'Get instant legal assistance powered by AI' },
          ].map(f => (
            <div key={f.title} className="p-6">
              <i className={`fas ${f.icon} text-4xl mb-4 block`} style={{ color: '#0B1F3A' }} />
              <h3 className="text-gray-900 font-bold text-xl mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
