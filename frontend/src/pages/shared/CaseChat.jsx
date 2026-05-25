import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { messagesApi } from '../../api/api'

export default function CaseChat() {
  const { user } = useAuth()
  const [chats, setChats]         = useState([])
  const [selectedCase, setSelected] = useState(null)   // { caseId, caseTitle, otherParty }
  const [messages, setMessages]   = useState([])
  const [msgText, setMsgText]     = useState('')
  const [sending, setSending]     = useState(false)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const fileRef  = useRef()
  const msgBox   = useRef()
  const pollRef  = useRef()

  const loadChats = () => {
    messagesApi.getChatList()
      .then(r => setChats(r.data || []))
      .catch(() => {})
  }

  const loadMessages = (caseId) => {
    if (!caseId) return
    messagesApi.getMessages(caseId)
      .then(r => {
        setMessages(r.data || [])
        setTimeout(() => { if (msgBox.current) msgBox.current.scrollTop = msgBox.current.scrollHeight }, 50)
        loadChats() // refresh unread counts
      })
      .catch(() => {})
  }

  useEffect(() => { loadChats() }, [])

  const selectCase = (chat) => {
    setSelected(chat)
    setLoadingMsgs(true)
    messagesApi.getMessages(chat.caseId)
      .then(r => {
        setMessages(r.data || [])
        setLoadingMsgs(false)
        setTimeout(() => { if (msgBox.current) msgBox.current.scrollTop = msgBox.current.scrollHeight }, 50)
        loadChats()
      })
      .catch(() => setLoadingMsgs(false))

    clearInterval(pollRef.current)
    pollRef.current = setInterval(() => loadMessages(chat.caseId), 6000)
  }

  useEffect(() => () => clearInterval(pollRef.current), [])

  const send = async (e) => {
    e.preventDefault()
    if (!selectedCase || sending) return
    const text = msgText.trim()
    const file = fileRef.current?.files[0]
    if (!text && !file) return

    setSending(true)
    try {
      const fd = new FormData()
      fd.append('messageText', text)
      if (file) fd.append('file', file)
      await messagesApi.sendMessage(selectedCase.caseId, fd)
      setMsgText('')
      if (fileRef.current) fileRef.current.value = ''
      loadMessages(selectedCase.caseId)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message')
    } finally { setSending(false) }
  }

  return (
    <div>
      <div className="content-header">
        <h1>Case Chat</h1>
        <p>Message your client or lawyer directly within each case</p>
      </div>

      <div className="chat-layout">
        {/* ── Case list panel ── */}
        <div className="chat-panel">
          <h2 className="px-4 py-4 border-b border-border text-gray-900 font-bold text-lg">Case Chats</h2>
          <div className="overflow-y-auto max-h-[75vh]">
            {chats.length === 0 ? (
              <p className="p-4 text-gray-400 text-sm">No chat-eligible cases yet.</p>
            ) : chats.map(chat => (
              <div
                key={chat.caseId}
                onClick={() => selectCase(chat)}
                className={`px-4 py-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-surface
                  ${selectedCase?.caseId === chat.caseId
                    ? 'bg-blue-50 border-l-4 border-l-primary'
                    : ''}`}
              >
                <div className="font-semibold text-gray-900 flex items-center gap-1 text-sm">
                  #{chat.caseId} — {chat.caseTitle}
                  {chat.unreadCount > 0 && (
                    <span className="notif-badge">{chat.unreadCount}</span>
                  )}
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  {chat.caseStatus} | {chat.otherPartyName}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Message pane ── */}
        <div className="chat-panel flex flex-col">
          <div className="px-4 py-4 border-b border-border font-semibold text-gray-900">
            {selectedCase
              ? `Case #${selectedCase.caseId}: ${selectedCase.caseTitle} | ${selectedCase.otherPartyName}`
              : 'Select a case to start chat'}
          </div>

          {/* Messages */}
          <div ref={msgBox} className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
            {!selectedCase && <p className="text-gray-400 text-sm">No case selected.</p>}
            {loadingMsgs && <p className="text-gray-400 text-sm text-center py-8">Loading messages...</p>}
            {selectedCase && !loadingMsgs && messages.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">No messages yet. Start the conversation!</p>
            )}
            {messages.map(msg => {
              const mine = msg.senderUserId === user?.userId
              return (
                <div key={msg.messageId} className={`flex mb-3 ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm ${mine ? 'msg-mine rounded-br-sm' : 'msg-other rounded-bl-sm'}`}>
                    {msg.messageText && <div className="leading-relaxed">{msg.messageText}</div>}
                    {msg.filePath && (
                      <div className="mt-1">
                        <a href={`/uploads/${msg.filePath}`} target="_blank" rel="noreferrer"
                          className="underline text-blue-600 text-xs">
                          <i className="fas fa-paperclip mr-1" /> Attachment
                        </a>
                      </div>
                    )}
                    <div className="text-xs opacity-60 mt-1">
                      {msg.senderName} | {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Composer */}
          {selectedCase && (
            <form onSubmit={send} className="border-t border-border px-4 py-3 flex gap-2 items-center flex-wrap">
              <input
                type="text"
                className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="Type a message..."
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                style={{ minWidth: 0 }}
              />
              <input ref={fileRef} type="file" className="hidden" />
              <button type="button" onClick={() => fileRef.current?.click()}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 flex-shrink-0">
                <i className="fas fa-paperclip" />
              </button>
              <button type="submit" disabled={sending}
                className="btn-primary-gold px-5 py-2 text-sm flex-shrink-0">
                {sending ? <i className="fas fa-spinner fa-spin" /> : 'Send'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
