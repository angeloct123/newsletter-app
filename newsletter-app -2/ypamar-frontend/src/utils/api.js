import { Auth } from '../context/AppContext'

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api'

export async function api(path, options = {}) {
  const url = `${API_BASE}${path}`
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  const token = Auth.getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, { ...options, headers })

  if (res.status === 401) {
    Auth.logout()
    window.location.reload()
    throw new Error('Sessione scaduta')
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Errore')
  return data
}

// Backend returns paginated subscribers: { subscribers, total, page, totalPages }
// Campaign create/update uses htmlcontent (no underscore)
// Send uses targetTags (array, not JSON string)

export function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('it-IT', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function calcRate(part, total) {
  if (!total) return '0.0'
  return ((part / total) * 100).toFixed(1)
}

export function announce(msg) {
  const el = document.getElementById('a11y-status')
  if (el) {
    el.textContent = ''
    setTimeout(() => { el.textContent = msg }, 100)
  }
}

export { API_BASE }
