import { useEffect, useState, type FormEvent } from 'react'
import './App.css'
import { AuthPage } from './pages/AuthPage'
import { WorkspacePage } from './pages/WorkspacePage'
import type { AuthResponse, ChatSession, Message, User } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

const starterMessages: Message[] = []
const conversationsStorageKey = 'vata_conversations'
const activeConversationStorageKey = 'vata_active_conversation'

function formatConversationLabel(timestamp: number) {
  const date = new Date(timestamp)
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startOfConversationDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dayDifference = Math.round((startOfToday.getTime() - startOfConversationDay.getTime()) / 86_400_000)
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  if (dayDifference === 0) return `Today ${time}`
  if (dayDifference === 1) return `Yesterday ${time}`

  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${time}`
}

function readStoredConversations(): ChatSession[] {
  const savedValue = localStorage.getItem(conversationsStorageKey)
  if (!savedValue) return []

  try {
    return JSON.parse(savedValue) as ChatSession[]
  } catch {
    return []
  }
}

function readStoredActiveConversation(): string | null {
  return localStorage.getItem(activeConversationStorageKey)
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const responseText = await response.text()

  if (!responseText.trim()) {
    throw new Error('Server returned an empty response')
  }

  try {
    return JSON.parse(responseText) as T
  } catch {
    throw new Error(responseText)
  }
}

function App() {
  const [mode, setMode] = useState<'login' | 'register'>('register')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('vata_token'))
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('vata_user')
    return savedUser ? (JSON.parse(savedUser) as User) : null
  })
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [conversations, setConversations] = useState<ChatSession[]>(readStoredConversations)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(readStoredActiveConversation)
  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [showWelcomeText, setShowWelcomeText] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId) ?? null
  const messages = activeConversation?.messages ?? starterMessages

  useEffect(() => {
    const timer = window.setTimeout(() => setShowWelcomeText(true), 150)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (token) {
      localStorage.setItem('vata_token', token)
    } else {
      localStorage.removeItem('vata_token')
    }
  }, [token])

  useEffect(() => {
    if (user) {
      localStorage.setItem('vata_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('vata_user')
    }
  }, [user])

  useEffect(() => {
    localStorage.setItem(conversationsStorageKey, JSON.stringify(conversations))
  }, [conversations])

  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem(activeConversationStorageKey, activeConversationId)
    } else {
      localStorage.removeItem(activeConversationStorageKey)
    }
  }, [activeConversationId])

  const fetchUsers = async () => {
    if (!token) return
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Unable to fetch users')
      const data = await readJsonResponse<User[]>(response)
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    }
  }

  useEffect(() => {
    if (token) {
      fetchUsers()
    }
  }, [token])

  const resetForm = () => {
    setName('')
    setEmail('')
    setPassword('')
  }

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = mode === 'register' ? 'register' : 'login'
      const payload = mode === 'register' ? { name, email, password } : { email, password }

      const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await readJsonResponse<AuthResponse & { message?: string }>(response)

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed')
      }

      setUser(data.user)
      setToken(data.accessToken)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setToken(null)
    setUser(null)
    setUsers([])
    setError('')
    setEditingId(null)
    setProfileOpen(false)
    setConversations([])
    setActiveConversationId(null)
    setDraft('')
  }

  const handleUpdateUser = async (id: string) => {
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName, email: editEmail }),
      })

      if (!response.ok) throw new Error('Unable to update user')

      const updatedUser = await readJsonResponse<User>(response)
      setUsers((current) => current.map((item) => (item.id === id ? updatedUser : item)))

      if (user?.id === id) {
        setUser(updatedUser)
      }

      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft.trim()) return

    const now = Date.now()
    const conversationId = activeConversationId ?? String(now)
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const nextMessage: Message = { id: Date.now(), sender: 'me', text: draft.trim(), time }
    const reply: Message = {
      id: Date.now() + 1,
      sender: 'bot',
      text: 'Got it! I have processed your instruction.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setConversations((current) => {
      const existingConversation = current.find((conversation) => conversation.id === conversationId)

      if (!existingConversation) {
        return [
          {
            id: conversationId,
            title: formatConversationLabel(now),
            createdAt: now,
            updatedAt: now,
            messages: [nextMessage, reply],
          },
          ...current,
        ]
      }

      return current.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              updatedAt: now,
              messages: [...conversation.messages, nextMessage, reply],
            }
          : conversation,
      )
    })
    setActiveConversationId(conversationId)
    setDraft('')
  }

  const handleResetConversation = () => {
    setActiveConversationId(null)
    setDraft('')
  }

  const handleOpenConversation = (conversationId: string) => {
    setActiveConversationId(conversationId)
  }

  const handleCopyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Copy failed', error)
    }
  }

  const handleToggleDarkMode = () => {
    setDarkMode((current) => !current)
  }

  return (
    <div className={`studio-shell auth-only-shell ${darkMode ? 'theme-dark' : ''}`}>
      <main className="studio-main auth-page-main">
        {!user ? (
          <AuthPage
            mode={mode}
            setMode={setMode}
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            loading={loading}
            error={error}
            showWelcomeText={showWelcomeText}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
            onSubmit={handleAuthSubmit}
          />
        ) : (
          <WorkspacePage
            user={user}
            users={users}
            conversations={conversations}
            activeConversationId={activeConversationId}
            activeConversationTitle={activeConversation?.title ?? 'New Chat Session'}
            messages={messages}
            draft={draft}
            setDraft={setDraft}
            profileOpen={profileOpen}
            setProfileOpen={setProfileOpen}
            editingId={editingId}
            setEditingId={setEditingId}
            editName={editName}
            setEditName={setEditName}
            editEmail={editEmail}
            setEditEmail={setEditEmail}
            handleSendMessage={handleSendMessage}
            handleUpdateUser={handleUpdateUser}
            handleLogout={handleLogout}
            onOpenConversation={handleOpenConversation}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
            onResetConversation={handleResetConversation}
            onCopyMessage={handleCopyMessage}
          />
        )}
      </main>
    </div>
  )
}

export default App