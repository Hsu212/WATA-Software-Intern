type ChatSidebarProps = {
  userName: string
  itemCount: number
  sidebarOpen: boolean
  setSidebarOpen: (value: boolean) => void
  activeItem: string
  onSelect: (item: 'new-chat' | 'search' | 'recents' | 'library' | 'settings') => void
  onNewChat: () => void
}

export function ChatSidebar({
  userName,
  itemCount,
  sidebarOpen,
  setSidebarOpen,
  activeItem,
  onSelect,
  onNewChat,
}: ChatSidebarProps) {
  const sideBarItems = [
    { key: 'search', label: 'Explore Chats', icon: '🔍' },
    { key: 'recents', label: 'Recent Activity', icon: '⏱️' },
    { key: 'library', label: 'Resource Library', icon: '📁' },
    { key: 'settings', label: 'Settings', icon: '⚙️' },
  ] as const

  return (
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
        onClick={onNewChat}
        title="New Session"
      >
        <span className="new-chat-icon">+</span>
        {sidebarOpen && <span>New Session</span>}
      </button>

      <div className="sidebar-section">
        {sidebarOpen && <div className="sidebar-section-label">Navigation</div>}
        {sideBarItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={activeItem === item.key ? 'sidebar-item active' : 'sidebar-item'}
            onClick={() => onSelect(item.key)}
            title={sidebarOpen ? undefined : item.label}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            {sidebarOpen && <span className="sidebar-item-text">{item.label}</span>}
          </button>
        ))}
      </div>

      <div className="compact-sidebar-card">
        {sidebarOpen ? (
          <>
            <span className="mini-label">Active Workspace</span>
            <strong>{userName || 'User Hub'}</strong>
            <small>{itemCount} teammates synced</small>
          </>
        ) : (
          <div className="sidebar-rail-indicator" title={`${userName} (${itemCount} items)`}>
            <span className="rail-dot" />
            <span className="rail-pulse" />
          </div>
        )}
      </div>
    </aside>
  )
}