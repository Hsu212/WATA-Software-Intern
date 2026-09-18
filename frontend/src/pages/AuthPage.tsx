import type { FormEvent } from 'react'

type AuthPageProps = {
  mode: 'login' | 'register'
  setMode: (value: 'login' | 'register') => void
  name: string
  setName: (value: string) => void
  email: string
  setEmail: (value: string) => void
  password: string
  setPassword: (value: string) => void
  loading: boolean
  error: string
  showWelcomeText: boolean
  darkMode: boolean
  onToggleDarkMode: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6.364 6.364 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

export function AuthPage({
  mode,
  setMode,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  loading,
  error,
  darkMode,
  onToggleDarkMode,
  onSubmit,
}: AuthPageProps) {
  return (
    <section className="auth-panel-clean">
      <button
        type="button"
        className="auth-theme-toggle"
        onClick={onToggleDarkMode}
        title="Toggle theme"
      >
        {darkMode ? <SunIcon /> : <MoonIcon />}
        <span>{darkMode ? 'Light' : 'Dark'}</span>
      </button>

      <div className="auth-copy-clean">
        <div className="brand-row">
          <div className="brand-mark">V</div>
          <span className="brand-name">VATA OS</span>
        </div>

        <div className="eyebrow-row">
          <span className="eyebrow">Next-Gen Workspace</span>
        </div>

        <h1>Elevate your daily productivity.</h1>
        <p>
          Securely manage your data, collaborate seamlessly, and experience a streamlined digital workspace crafted for speed and elegance.
        </p>

        <div className="auth-mini-stats">
          <div>
            <strong>100%</strong>
            <span>Secure Core</span>
          </div>
          <div>
            <strong>2.0</strong>
            <span>Modern Stack</span>
          </div>
        </div>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        <div className="auth-form-header">
          <p className="mini-label">Get Started</p>
          <h2>{mode === 'register' ? 'Create an account' : 'Welcome back'}</h2>
        </div>

        <div className="mode-switch">
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            Sign up
          </button>
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            Sign in
          </button>
        </div>

        {mode === 'register' && (
          <label>
            <span>Full Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              required
            />
          </label>
        )}

        <label>
          <span>Email Address</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />
        </label>

        <label>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </label>

        <div className="auth-meta-row">
          <label className="check-row">
            <input type="checkbox" defaultChecked />
            <span>Remember device</span>
          </label>
        </div>

        {error && <p className="error-text">{error}</p>}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Processing...' : mode === 'register' ? 'Create account' : 'Sign in'}
        </button>
      </form>
    </section>
  )
}