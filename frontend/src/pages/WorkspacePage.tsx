import { useEffect, useState, type FormEvent } from 'react'
import { MessageActionButtons } from '../components/MessageActionButtons'
import { ProfileMenu } from '../components/ProfileMenu'
import type { ChatSession, User } from '../types'

type WorkspacePageProps = {
  user: User
  users: User[]
  conversations: ChatSession[]
  activeConversationId: string | null
  activeConversationTitle: string
  messages: Array<{
    id: number
    sender: 'me' | 'bot'
    text: string
    time: string
  }>
  draft: string
  setDraft: (value: string) => void
  profileOpen: boolean
  setProfileOpen: (value: boolean) => void
  editingId: string | null
  setEditingId: (value: string | null) => void
  editName: string
  setEditName: (value: string) => void
  editEmail: string
  setEditEmail: (value: string) => void
  handleSendMessage: (event: FormEvent<HTMLFormElement>) => void
  handleUpdateUser: (id: string) => Promise<void>
  handleLogout: () => void
  onOpenConversation: (conversationId: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (value: boolean) => void
  darkMode: boolean
  onToggleDarkMode: () => void
  onResetConversation: () => void
  onCopyMessage: (text: string) => Promise<void>
}

export function WorkspacePage({
  user,
  users,
  conversations,
  activeConversationId,
  activeConversationTitle,
  messages,
  draft,
  setDraft,
  profileOpen,
  setProfileOpen,
  editingId,
  setEditingId,
  editName,
  setEditName,
  editEmail,
  setEditEmail,
  handleSendMessage,
  handleUpdateUser,
  handleLogout,
  onOpenConversation,
  sidebarOpen,
  setSidebarOpen,
  darkMode,
  onToggleDarkMode,
  onResetConversation,
  onCopyMessage,
}: WorkspacePageProps) {
  const [activeSidebarItem, setActiveSidebarItem] = useState<'new-chat' | 'search' | 'recents' | 'library' | 'settings'>('search')
  const [chatSearchQuery, setChatSearchQuery] = useState('')
  const [messageFeedback, setMessageFeedback] = useState<Record<number, 'like' | 'dislike' | undefined>>({})
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoSave: true,
    compactMode: false,
    mentions: true,
    darkMode: false,
  })

  useEffect(() => {
    setSettings((current) => ({
      ...current,
      darkMode,
    }))
  }, [darkMode])

  const sideBarItems = [
    { key: 'search', label: 'Explore Chats', icon: '🔍' },
    { key: 'recents', label: 'Recent Activity', icon: '⏱️' },
    { key: 'library', label: 'Resource Library', icon: '📁' },
    { key: 'settings', label: 'Settings', icon: '⚙️' },
  ] as const

  const resourceItems = [
    { title: 'Workspace members', detail: `${users.length} synced teammate${users.length === 1 ? '' : 's'}` },
    { title: 'Secure session', detail: 'Auth, token, and profile management are connected to the backend.' },
    { title: 'Conversation history', detail: `${conversations.length} chat${conversations.length === 1 ? '' : 's'} saved in the workspace.` },
  ]

  const sortedConversations = [...conversations].sort((left, right) => right.updatedAt - left.updatedAt)

  const recentsByDay = sortedConversations.reduce<Record<string, ChatSession[]>>((groups, conversation) => {
    const date = new Date(conversation.updatedAt)
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const startOfConversationDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const dayDifference = Math.round((startOfToday.getTime() - startOfConversationDay.getTime()) / 86_400_000)

    const groupLabel =
      dayDifference === 0 ? 'Today' : dayDifference === 1 ? 'Yesterday' : date.toLocaleDateString([], { month: 'long', day: 'numeric' })

    if (!groups[groupLabel]) {
      groups[groupLabel] = []
    }

    groups[groupLabel].push(conversation)
    return groups
  }, {})

  const recentsOrder = ['Today', 'Yesterday', ...Object.keys(recentsByDay).filter((label) => label !== 'Today' && label !== 'Yesterday')]

  const normalizedSearchQuery = chatSearchQuery.trim().toLowerCase()
  const searchResults = normalizedSearchQuery
    ? sortedConversations
        .map((conversation) => {
          const matchingMessages = conversation.messages.filter((message) => message.text.toLowerCase().includes(normalizedSearchQuery))
          const conversationText = conversation.messages.map((message) => message.text.toLowerCase()).join(' ')
          const conversationMatches = conversationText.includes(normalizedSearchQuery)

          if (!matchingMessages.length && !conversationMatches) {
            return null
          }

          const matchedMessage = matchingMessages[0] ?? conversation.messages[conversation.messages.length - 1]
          return {
            conversation,
            snippet: matchedMessage?.text ?? 'No messages yet',
            time: formatConversationTime(conversation),
          }
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
    : []

  const highlightedSearchResults = searchResults.slice(0, 8)

  function formatConversationPreview(conversation: ChatSession) {
    const lastMessage = conversation.messages[conversation.messages.length - 1]
    if (!lastMessage) return 'No messages yet'
    return lastMessage.text.length > 52 ? `${lastMessage.text.slice(0, 52)}...` : lastMessage.text
  }

  function formatConversationTime(conversation: ChatSession) {
    return new Date(conversation.updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  const startEditingProfile = () => {
    setEditingId(user.id)
    setEditName(user.name ?? '')
    setEditEmail(user.email)
    setProfileOpen(false)
  }

  const openSettings = () => {
    setActiveSidebarItem('settings')
    setProfileOpen(false)
  }

  const handleSidebarSelect = (value: typeof activeSidebarItem) => {
    setActiveSidebarItem(value)
  }

  const handleMessageFeedback = (messageId: number, type: 'like' | 'dislike') => {
    setMessageFeedback((current) => {
      const next = { ...current }
      if (next[messageId] === type) {
        delete next[messageId]
      } else {
        next[messageId] = type
      }
      return next
    })
  }

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  const handleToggleSetting = (key: string) => {
    if (key === 'darkMode') {
      onToggleDarkMode()
      return
    }
    toggleSetting(key as keyof typeof settings)
  }

  const isSettingsView = activeSidebarItem === 'settings'
  const isLibraryView = activeSidebarItem === 'library'
  const isRecentsView = activeSidebarItem === 'recents'
  const isSearchView = activeSidebarItem === 'search'

  return (
    <div className="llm-shell">
      <aside className={`sidebar-panel ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header-row">
          <div className="brand-row" style={{ marginBottom: 0 }}>
            <div className="brand-mark">V</div>
            {sidebarOpen && <span className="brand-name">VATA</span>}
          </div>
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? '‹' : '›'}
          </button>
        </div>

        <button
          type="button"
          className="new-chat-button"
          onClick={() => {
            setActiveSidebarItem('search')
            onResetConversation()
          }}
          title="New Session"
        >
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', lineHeight: 1 }}>+</span>
          {sidebarOpen && <span>New Session</span>}
        </button>

        <div className="sidebar-section">
          {sidebarOpen && <div className="sidebar-section-label">Navigation</div>}
          {sideBarItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={activeSidebarItem === item.key ? 'sidebar-item active' : 'sidebar-item'}
              onClick={() => handleSidebarSelect(item.key)}
              title={sidebarOpen ? undefined : item.label}
            >
              <span>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </div>

        <div className="compact-sidebar-card">
          {sidebarOpen && (
            <>
              <span className="mini-label">Active Workspace</span>
              <strong>{user.name || 'User Hub'}</strong>
              <small>{users.length} teammates synced</small>
            </>
          )}
        </div>
      </aside>

      <section className="workspace-surface">
        <header className="workspace-topbar">
          <div className="topbar-title">
            <p className="mini-label">Dashboard</p>
            <h1>Welcome back, {user.name || 'Developer'}</h1>
          </div>

          <ProfileMenu
            user={user}
            profileOpen={profileOpen}
            setProfileOpen={setProfileOpen}
            onEditProfile={startEditingProfile}
            onOpenSettings={openSettings}
            onLogout={handleLogout}
          />
        </header>

        <div className="workspace-grid">
          {isSettingsView ? (
            <div className="card-panel settings-panel">
              <div className="panel-heading">
                <div>
                  <p className="mini-label">Preferences</p>
                  <h3>Workspace Settings</h3>
                </div>
              </div>

              <div className="settings-list">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive updates when teammates mention you.' },
                  { key: 'autoSave', label: 'Auto-save Sessions', description: 'Keep your active notes synced automatically.' },
                  { key: 'darkMode', label: 'Dark Mode Theme', description: 'Switch between sleek dark and clean light mode.' },
                ].map((setting) => (
                  <div key={setting.key} className="setting-item">
                    <div>
                      <strong>{setting.label}</strong>
                      <small>{setting.description}</small>
                    </div>
                    <button
                      type="button"
                      className={`toggle-switch ${
                        setting.key === 'darkMode' ? (darkMode ? 'on' : '') : (settings[setting.key as keyof typeof settings] ? 'on' : '')
                      }`}
                      onClick={() => handleToggleSetting(setting.key)}
                    >
                      <span />
                    </button>
                  </div>
                ))}
              </div>

              <div className="settings-actions">
                <button type="button" className="primary-button" onClick={() => setActiveSidebarItem('search')}>
                  Done
                </button>
              </div>
            </div>
          ) : isLibraryView ? (
            <div className="card-panel settings-panel">
              <div className="panel-heading">
                <div>
                  <p className="mini-label">Directory</p>
                  <h3>Resource Library</h3>
                </div>
              </div>
              <div className="settings-list">
                {resourceItems.map((item) => (
                  <div key={item.title} className="setting-item">
                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.detail}</small>
                    </div>
                  </div>
                ))}
              </div>
              <div className="settings-actions">
                <button type="button" className="primary-button" onClick={() => setActiveSidebarItem('search')}>
                  Back to Chat
                </button>
              </div>
            </div>
          ) : isRecentsView ? (
            <div className="card-panel settings-panel">
              <div className="panel-heading">
                <div>
                  <p className="mini-label">Timeline</p>
                  <h3>Recent Activity</h3>
                </div>
              </div>
              <div className="settings-list">
                {conversations.length === 0 ? (
                  <div className="setting-item">
                    <div>
                      <strong>No recent chats yet</strong>
                      <small>Start a conversation and it will appear here.</small>
                    </div>
                  </div>
                ) : (
                  recentsOrder.flatMap((groupLabel) => {
                    const groupItems = recentsByDay[groupLabel] ?? []

                    return [
                      groupItems.length > 0 ? (
                        <div key={groupLabel} className="recent-group-label">
                          {groupLabel}
                        </div>
                      ) : null,
                      ...groupItems.map((conversation) => (
                        <button
                          key={conversation.id}
                          type="button"
                          className={activeConversationId === conversation.id ? 'setting-item recent-chat-item active' : 'setting-item recent-chat-item'}
                          onClick={() => {
                            onOpenConversation(conversation.id)
                            setActiveSidebarItem('search')
                          }}
                        >
                          <div>
                            <strong>{conversation.title}</strong>
                            <small>{formatConversationPreview(conversation)}</small>
                          </div>
                          <small>{formatConversationTime(conversation)}</small>
                        </button>
                      )),
                    ]
                  })
                )}
              </div>
              <div className="settings-actions">
                <button type="button" className="primary-button" onClick={() => setActiveSidebarItem('search')}>
                  Back to Chat
                </button>
              </div>
            </div>
          ) : (
            <div className="card-panel llm-chat-panel">
              <div className="panel-heading">
                <div>
                  <p className="mini-label">Active Thread</p>
                  <h3>{isSearchView ? 'Explore Chats' : activeConversationTitle}</h3>
                </div>
                <span className="thread-status">Online</span>
              </div>

              {isSearchView ? (
                <div className="chat-search-panel">
                  <div className="chat-search-input-wrap">
                    <span className="chat-search-icon">⌕</span>
                    <input
                      value={chatSearchQuery}
                      onChange={(event) => setChatSearchQuery(event.target.value)}
                      placeholder="Search your chats with VATA"
                      className="chat-search-input"
                    />
                    {chatSearchQuery && (
                      <button type="button" className="chat-search-clear" onClick={() => setChatSearchQuery('')}>
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="chat-search-results">
                    {chatSearchQuery.trim() ? (
                      highlightedSearchResults.length === 0 ? (
                        <div className="chat-search-empty">
                          <strong>No matches found</strong>
                          <small>Try a different word or sentence from your chats with VATA.</small>
                        </div>
                      ) : (
                        highlightedSearchResults.map((result) => (
                          <button
                            key={result.conversation.id}
                            type="button"
                            className={activeConversationId === result.conversation.id ? 'chat-search-result active' : 'chat-search-result'}
                            onClick={() => onOpenConversation(result.conversation.id)}
                          >
                            <div>
                              <strong>{result.conversation.title}</strong>
                              <small>{result.snippet}</small>
                            </div>
                            <span>{result.time}</span>
                          </button>
                        ))
                      )
                    ) : (
                      <div className="chat-search-empty">
                        <strong>Search chats</strong>
                        <small>Type a word or sentence to find the conversation you had with VATA.</small>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="message-stream">
                    {messages.length === 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', textAlign: 'center', gap: '8px' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>How can I help you today?</h2>
                        <p style={{ fontSize: '0.95rem' }}>Start typing a message below to begin a new session.</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div key={message.id} className={`message-bubble ${message.sender}`}>
                          <p>{message.text}</p>
                          <span>{message.time}</span>
                          <MessageActionButtons
                            messageId={message.id}
                            messageText={message.text}
                            onResetConversation={onResetConversation}
                            onCopyMessage={onCopyMessage}
                            onFeedback={handleMessageFeedback}
                            feedback={messageFeedback[message.id]}
                          />
                        </div>
                      ))
                    )}
                  </div>

                  <form className="composer" onSubmit={handleSendMessage}>
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Ask VATA anything..."
                    />
                    <button type="submit" className="primary-button">Send</button>
                  </form>
                </>
              )}
            </div>
          )}

          {editingId ? (
            <div className="editor-form">
              <h3>Edit Profile Information</h3>
              <label>
                <span>Name</span>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </label>
              <label>
                <span>Email</span>
                <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="primary-button" onClick={() => handleUpdateUser(editingId)}>
                  Save Changes
                </button>
                <button type="button" className="ghost-button" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}