import { useState, useEffect, useRef } from 'react'
import { casesApi, aiApi } from '../../api/api'

const LAWYER_PROMPTS = [
  'Summarize this case for first hearing preparation.',
  'List missing facts and evidence gaps in this case.',
  'Give procedural next steps for this case.',
]

export default function LawyerAiSupport() {
  const [cases, setCases]       = useState([])
  const [caseId, setCaseId]     = useState('')
  const [messages, setMessages] = useState([])
  const [prompt, setPrompt]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [status, setStatus]     = useState({ text: 'Ready. Select an active case and start chatting.', type: 'ok' })
  const boxRef = useRef()

  useEffect(() => {
    casesApi.getActive()
      .then(r => { setCases(r.data || []); if (r.data?.length) setCaseId(String(r.data[0].id)) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight
  }, [messages])

  const addMsg = (role, text) => setMessages(m => [...m, { role, text }])

  const send = async () => {
    const text = prompt.trim()
    if (!text || loading) return
    addMsg('user', text)
    setPrompt('')
    setLoading(true)
    setStatus({ text: 'AI is processing your request...', type: 'ok' })

    const selectedCase = cases.find(c => String(c.id) === caseId)
    const contextMsg = selectedCase
      ? `[Case context: #${selectedCase.id} "${selectedCase.title}" (${selectedCase.type}, ${selectedCase.city}, Status: ${selectedCase.status})]\n\nAs a lawyer, I need: ${text}`
      : `As a lawyer, I need: ${text}`

    const history = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }))

    try {
      const res = await aiApi.chat({ message: contextMsg, history })
      addMsg('ai', res.data?.reply || 'No response received.')
      setStatus({ text: 'Ready.', type: 'ok' })
    } catch {
      addMsg('ai', 'Sorry, the AI assistant is temporarily unavailable.')
      setStatus({ text: 'AI unavailable. Please try again.', type: 'warn' })
    } finally { setLoading(false) }
  }

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  return (
    <div>
      <div className="content-header">
        <h1><i className="fas fa-comments mr-3" />AI Drafting Support</h1>
        <p>Ask in plain language. Get conversation-style drafting help from selected case details.</p>
      </div>

      {/* Case selector */}
      <div className="card mb-4">
        <div className={`px-4 py-2 rounded-lg mb-4 text-sm font-medium
          ${status.type === 'ok' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-yellow-50 text-yellow-800 border border-yellow-200'}`}>
          {status.text}
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2 text-sm">Active Case</label>
          <select className="form-control max-w-md" value={caseId} onChange={e => setCaseId(e.target.value)}>
            <option value="">— No case selected —</option>
            {cases.map(c => <option key={c.id} value={c.id}>#{c.id} — {c.title}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        {/* Messages */}
        <div ref={boxRef} className="rounded-xl border border-border bg-gray-50 min-h-[280px] max-h-[420px] overflow-y-auto p-4 mb-4">
          {messages.length === 0 && (
            <p className="text-gray-400 text-sm text-center mt-10">Select a case and start asking for drafting assistance.</p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex mb-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed
                ${m.role === 'user' ? 'text-white rounded-br-sm' : 'text-gray-900 border border-border bg-white rounded-bl-sm'}`}
                style={m.role === 'user' ? { background: '#0B1F3A' } : {}}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start mb-3">
              <div className="bg-white border border-border rounded-xl px-4 py-3">
                <i className="fas fa-spinner fa-spin text-gray-400" />
              </div>
            </div>
          )}
        </div>

        {/* Quick prompts */}
        <div className="flex flex-wrap gap-2 mb-4">
          {LAWYER_PROMPTS.map(p => (
            <button key={p} onClick={() => setPrompt(p)}
              className="border border-border bg-white text-gray-800 rounded-full px-3 py-1.5 text-xs hover:border-primary transition-colors">
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <textarea className="form-control resize-none" rows={2} value={prompt}
            onChange={e => setPrompt(e.target.value)} onKeyDown={onKey}
            placeholder="Type your request... (Enter to send)" disabled={loading} />
          <button onClick={send} disabled={loading || !prompt.trim()} className="btn-primary-gold px-6 self-stretch">
            {loading ? <i className="fas fa-spinner fa-spin" /> : 'Send'}
          </button>
        </div>
        <p className="text-gray-400 text-xs mt-3">
          Tip: short instructions work best (e.g. "prepare checklist for tomorrow hearing").
        </p>
      </div>
    </div>
  )
}
