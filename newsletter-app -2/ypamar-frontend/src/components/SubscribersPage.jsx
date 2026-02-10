import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { api, formatDate, API_BASE } from '../utils/api'
import { Auth } from '../context/AppContext'
import { useApp } from '../context/AppContext'
import TagInput, { TagsDisplay } from './TagInput'

// FIX: Page size for real pagination
const PAGE_SIZE = 50

export default function SubscribersPage() {
  const { showToast } = useApp()
  const [subs, setSubs] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editSub, setEditSub] = useState(null)

  // FIX: Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // FIX: Load with real pagination (backend already supports it)
  const load = useCallback((page = 1) => {
    setLoading(true)
    const params = `?page=${page}&limit=${PAGE_SIZE}`
    api(`/subscribers${params}`).then(data => {
      setSubs(data.subscribers || [])
      setTotalPages(data.totalPages || 1)
      setTotalCount(data.total || 0)
      setCurrentPage(data.page || page)
    })
    .catch(e => showToast(e.message, 'error'))
    .finally(() => setLoading(false))
  }, [showToast])

  useEffect(() => { load() }, [load])

  // FIX: Memoized filtered list — avoids recalculating on every render
  const filtered = useMemo(() => {
    return subs.filter(s => {
      if (filter === 'active' && s.status !== 'active') return false
      if (filter === 'unsubscribed' && s.status !== 'unsubscribed') return false
      if (search) {
        const q = search.toLowerCase()
        const match = (s.email || '').toLowerCase().includes(q) ||
                      (s.name || '').toLowerCase().includes(q)
        if (!match) {
          try {
            const tags = JSON.parse(s.tags || '[]')
            if (!tags.some(t => t.toLowerCase().includes(q))) return false
          } catch { return false }
        }
      }
      return true
    })
  }, [subs, search, filter])

  const del = (id, email) => {
    if (!confirm(`Eliminare ${email}?`)) return
    api(`/subscribers/${id}`, { method: 'DELETE' })
      .then(() => { showToast('Eliminato', 'success'); load(currentPage) })
      .catch(e => showToast(e.message, 'error'))
  }

  const exportCSV = () => {
    fetch(`${API_BASE}/subscribers/export`, {
      headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
    }).then(r => r.blob()).then(blob => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'subscribers.csv'; a.click()
      URL.revokeObjectURL(url)
      showToast('Export completato', 'success')
    }).catch(e => showToast(e.message, 'error'))
  }

  // FIX: Pagination handlers
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return
    load(page)
  }

  return (
    <div className="subscribers-page">
      {/* Header actions */}
      <div className="page-actions">
        <div className="search-bar">
          <input
            className="form-input"
            placeholder="🔍 Cerca per email, nome o tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="form-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">Tutti</option>
            <option value="active">Attivi</option>
            <option value="unsubscribed">Disiscritti</option>
          </select>
        </div>
        <div className="action-buttons">
          <button className="btn btn-primary" onClick={() => { setEditSub(null); setShowAdd(true) }}>
            ➕ Aggiungi
          </button>
          <button className="btn btn-secondary" onClick={() => setShowImport(true)}>
            📥 Importa CSV
          </button>
          <button className="btn btn-secondary" onClick={exportCSV}>
            📤 Esporta CSV
          </button>
        </div>
      </div>

      {/* FIX: Show total count */}
      <div className="subscribers-info" style={{ padding: '0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        {totalCount} iscritti totali — Pagina {currentPage} di {totalPages}
      </div>

      {/* Subscribers table */}
      {loading ? (
        <div className="loading-spinner">Caricamento...</div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Nome</th>
                  <th>Stato</th>
                  <th>Tag</th>
                  <th>Data</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.email}</strong></td>
                    <td>{s.name || '-'}</td>
                    <td>
                      <span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                        {s.status === 'active' ? '● Attivo' : '○ Disiscritto'}
                      </span>
                    </td>
                    <td><TagsDisplay tags={s.tags} /></td>
                    <td>{formatDate(s.created_at)}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => { setEditSub(s); setShowAdd(true) }}>
                        ✏️
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => del(s.id, s.email)}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Nessun iscritto trovato</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FIX: Pagination controls */}
          {totalPages > 1 && (
            <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1rem 0' }}>
              <button className="btn btn-sm btn-secondary" onClick={() => goToPage(1)} disabled={currentPage === 1}>
                ⏮ Prima
              </button>
              <button className="btn btn-sm btn-secondary" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                ◀ Prec
              </button>
              <span className="btn btn-sm" style={{ cursor: 'default' }}>
                {currentPage} / {totalPages}
              </span>
              <button className="btn btn-sm btn-secondary" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                Succ ▶
              </button>
              <button className="btn btn-sm btn-secondary" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}>
                Ultima ⏭
              </button>
            </div>
          )}
        </>
      )}

      {/* Add/Edit modal */}
      {showAdd && (
        <SubscriberModal
          sub={editSub}
          onClose={() => { setShowAdd(false); setEditSub(null) }}
          onSaved={() => { setShowAdd(false); setEditSub(null); load(currentPage) }}
          showToast={showToast}
        />
      )}

      {/* Import modal */}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImported={() => { setShowImport(false); load(1) }}
          showToast={showToast}
        />
      )}
    </div>
  )
}

// --- Sub-components (Add/Edit modal) ---
function SubscriberModal({ sub, onClose, onSaved, showToast }) {
  const [email, setEmail] = useState(sub?.email || '')
  const [name, setName] = useState(sub?.name || '')
  const [status, setStatus] = useState(sub?.status || 'active')
  const [tags, setTags] = useState(() => {
    try { return JSON.parse(sub?.tags || '[]') } catch { return [] }
  })
  const [allTags, setAllTags] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => { api('/tags').then(setAllTags).catch(() => {}) }, [])

  const handleSave = async () => {
    if (!email.trim()) { showToast('Email obbligatoria', 'error'); return }
    setSaving(true)
    const payload = { email, name, status, tags: JSON.stringify(tags) }
    try {
      if (sub?.id) {
        await api(`/subscribers/${sub.id}`, { method: 'PUT', body: JSON.stringify(payload) })
        showToast('Modificato', 'success')
      } else {
        await api('/subscribers', { method: 'POST', body: JSON.stringify(payload) })
        showToast('Aggiunto', 'success')
      }
      onSaved()
    } catch (e) { showToast(e.message, 'error') }
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{sub ? 'Modifica iscritto' : 'Nuovo iscritto'}</h3>
          <button className="btn btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@esempio.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Nome</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Nome (opzionale)" />
          </div>
          <div className="form-group">
            <label className="form-label">Stato</label>
            <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="active">Attivo</option>
              <option value="unsubscribed">Disiscritto</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tag</label>
            <TagInput tags={tags} setTags={setTags} allTags={allTags} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Annulla</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '⏳ Salvataggio...' : '💾 Salva'}
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Import CSV modal ---
function ImportModal({ onClose, onImported, showToast }) {
  const fileRef = useRef(null)
  const [importing, setImporting] = useState(false)

  const handleImport = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) { showToast('Seleziona un file CSV', 'error'); return }
    setImporting(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch(`${API_BASE}/subscribers/import`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${Auth.getToken()}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore importazione')
      showToast(`Importati: ${data.imported || 0} iscritti`, 'success')
      onImported()
    } catch (e) { showToast(e.message, 'error') }
    setImporting(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📥 Importa CSV</h3>
          <button className="btn btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p>CSV con colonne: <code>email, name, tags</code> (opzionale)</p>
          <input type="file" ref={fileRef} accept=".csv" className="form-input" />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Annulla</button>
          <button className="btn btn-primary" onClick={handleImport} disabled={importing}>
            {importing ? '⏳ Importazione...' : '📥 Importa'}
          </button>
        </div>
      </div>
    </div>
  )
}
