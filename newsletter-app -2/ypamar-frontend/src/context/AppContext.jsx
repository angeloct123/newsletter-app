import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'

const AppContext = createContext(null)

// ─── Auth helpers ───
const Auth = {
  getToken: () => localStorage.getItem('newsletter_token'),
  setToken: (t) => localStorage.setItem('newsletter_token', t),
  removeToken: () => localStorage.removeItem('newsletter_token'),
  getUser: () => {
    try { return JSON.parse(localStorage.getItem('newsletter_user')) } catch { return null }
  },
  setUser: (u) => localStorage.setItem('newsletter_user', JSON.stringify(u)),
  removeUser: () => localStorage.removeItem('newsletter_user'),
  isAuthenticated: () => !!localStorage.getItem('newsletter_token'),
  logout: () => { Auth.removeToken(); Auth.removeUser() },
}

let toastId = 0

export function AppProvider({ children }) {
  const [user, setUser] = useState(Auth.isAuthenticated() ? Auth.getUser() : null)
  const [page, setPage] = useState('dashboard')
  const [pageData, setPageData] = useState(null)
  const [toasts, setToasts] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const showToast = useCallback((message, type = 'info') => {
    const id = ++toastId
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }, [])

  const removeToast = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), [])

  const navigate = useCallback((pg, data = null) => {
    setPage(pg)
    setPageData(data)
    setSidebarOpen(false)
    window.scrollTo(0, 0)
  }, [])

  const login = useCallback((userData, token) => {
    Auth.setToken(token)
    Auth.setUser(userData)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    Auth.logout()
    setUser(null)
    setPage('dashboard')
    setPageData(null)
  }, [])

  const value = useMemo(() => ({
    user, page, pageData, toasts, sidebarOpen,
    showToast, removeToast, navigate, login, logout,
    setSidebarOpen,
  }), [user, page, pageData, toasts, sidebarOpen, showToast, removeToast, navigate, login, logout])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export { Auth }
