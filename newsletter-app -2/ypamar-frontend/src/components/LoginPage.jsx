import { useState, useRef, useEffect } from 'react'
import { api } from '../utils/api'
import { useApp } from '../context/AppContext'

export default function LoginPage() {
  const { login } = useApp()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const ref = useRef()

  useEffect(() => { ref.current?.focus() }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!username || !password) { setError('Inserisci credenziali'); return }
    setLoading(true)
    setError('')
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      login(data.user, data.token)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-logo">
            <div className="login-logo-icon">Y</div>
            <div className="login-logo-text">YPAMAR</div>
          </div>
          <h1 className="login-title">Accedi alla dashboard</h1>
          <p className="login-subtitle">Inserisci le credenziali</p>
          {error && <div className="login-error" role="alert">{error}</div>}
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-user">Username</label>
              <input
                ref={ref}
                id="login-user"
                className="form-input"
                type="text"
                autoComplete="username"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-pass">Password</label>
              <input
                id="login-pass"
                className="form-input"
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <><span className="spinner"></span> Accesso...</> : 'Accedi'}
            </button>
          </form>
          <div className="login-footer">YPAMAR Newsletter System v5.0</div>
        </div>
      </div>
    </div>
  )
}
