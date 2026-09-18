import type { User } from '../types'

type ProfileMenuProps = {
  user: User
  profileOpen: boolean
  setProfileOpen: (value: boolean) => void
  onEditProfile: () => void
  onOpenSettings: () => void
  onLogout: () => void
}

export function ProfileMenu({ user, profileOpen, setProfileOpen, onEditProfile, onOpenSettings, onLogout }: ProfileMenuProps) {
  return (
    <div className="topbar-actions">
      <div className="profile-chip" onClick={() => setProfileOpen(!profileOpen)}>
        <span className="profile-avatar">{(user.name || user.email).charAt(0).toUpperCase()}</span>
        <span>{user.name || 'User'}</span>
      </div>

      {profileOpen && (
        <div className="profile-menu">
          <div className="profile-menu-header">
            <span className="profile-avatar">{(user.name || user.email).charAt(0).toUpperCase()}</span>
            <div>
              <strong>{user.name || 'User'}</strong>
              <small>{user.email}</small>
            </div>
          </div>

          <button type="button" className="menu-action" onClick={onEditProfile}>
            Edit profile
          </button>
          <button
            type="button"
            className="menu-action"
            onClick={() => {
              setProfileOpen(false)
              onOpenSettings()
            }}
          >
            Settings
          </button>
          <button type="button" className="menu-action danger" onClick={onLogout}>
            Log out
          </button>
        </div>
      )}
    </div>
  )
}