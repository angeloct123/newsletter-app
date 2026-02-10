import { useState, useEffect, useRef, useCallback } from 'react'
import { api, formatDate } from '../utils/api'
import { useApp } from '../context/AppContext'

/* ============================================================
   CampaignsPage v3.1 — Premium Campaign Dashboard
   Features: skeleton, cards, custom modals, search/filter,
   stats bars, drag & drop reorder, quick actions hover,
   duplication with edit, staggered animations
   ============================================================ */

const STATUS_MAP = {
  draft:     { l: 'Bozza',         icon: '📝', b: 'cp-badge-draft',     color: '#94a3b8' },
  scheduled: { l: 'Programmata',    icon: '📅', b: 'cp-badge-scheduled', color: '#a29bfe' },
  sending:   { l: 'In invio...',    icon: '📤', b: 'cp-badge-sending',   color: '#f59e0b' },
  sent:      { l: 'Inviata',       icon: '✅', b: 'cp-badge-sent',      color: '#22c55e' },
}

// ---------- Skeleton Loading ----------
function SkeletonCard({ index }) {
  return (
    <div className="cp-card cp-skeleton" style={{ animationDelay: `${index * 0.08}s` }}>
      <div className="cp-card-header">
        <div className="cp-skel-line cp-skel-title" />
        <div className="cp-skel-badge" />
      </div>
      <div className="cp-skel-line cp-skel-subject" />
      <div className="cp-card-stats-row">
        <div className="cp-skel-stat" />
        <div className="cp-skel-stat" />
        <div className="cp-skel-stat" />
      </div>
    </div>
  )
}

// ---------- Stat Mini Bar ----------
function StatBar({ label, value, total, color, icon }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="cp-stat-item">
      <div className="cp-stat-header">
        <span className="cp-stat-icon">{icon}</span>
        <span className="cp-stat-value">{value?.toLocaleString?.() ?? value}</span>
      </div>
      <div className="cp-stat-bar-bg">
        <div className="cp-stat-bar-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="cp-stat-footer">
        <span className="cp-stat-label">{label}</span>
        <span className="cp-stat-pct" style={{ color }}>{pct}%</span>
      </div>
    </div>
  )
}

// ---------- Delete Confirmation Modal ----------
function DeleteModal({ campaign, onConfirm, onCancel }) {
  const [confirming, setConfirming] = useState(false)
  const handleConfirm = async () => {
    setConfirming(true)
    await onConfirm()
    setConfirming(false)
  }
  return (
    <div className="cp-modal-overlay" onClick={onCancel}>
      <div className="cp-modal" onClick={e => e.stopPropagation()}>
        <div className="cp-modal-icon">🗑️</div>
        <h3 className="cp-modal-title">Elimina campagna</h3>
        <p className="cp-modal-desc">
          Stai per eliminare <strong>"{campaign.name}"</strong>. Questa azione è irreversibile.
        </p>
        <div className="cp-modal-actions">
          <button onClick={onCancel} className="cp-btn cp-btn-ghost" disabled={confirming}>Annulla</button>
          <button onClick={handleConfirm} className="cp-btn cp-btn-danger" disabled={confirming}>
            {confirming ? '⏳ Eliminazione...' : '🗑️ Elimina'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------- Duplicate Modal (duplicate + edit or just duplicate) ----------
function DuplicateModal({ campaign, onDuplicate, onDuplicateAndEdit, onCancel }) {
  const [duplicating, setDuplicating] = useState(false)
  return (
    <div className="cp-modal-overlay" onClick={onCancel}>
      <div className="cp-modal" onClick={e => e.stopPropagation()}>
        <div className="cp-modal-icon">📋</div>
        <h3 className="cp-modal-title">Duplica campagna</h3>
        <p className="cp-modal-desc">
          Stai per duplicare <strong>"{campaign.name}"</strong>. Scegli un'opzione:
        </p>
        <div className="cp-modal-actions" style={{ flexDirection: 'column', gap: 8 }}>
          <button
            onClick={async () => { setDuplicating(true); await onDuplicateAndEdit(); setDuplicating(false) }}
            className="cp-btn cp-btn-primary"
            disabled={duplicating}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {duplicating ? '⏳ Duplicazione...' : '📝 Duplica e modifica'}
          </button>
          <button
            onClick={async () => { setDuplicating(true); await onDuplicate(); setDuplicating(false) }}
            className="cp-btn cp-btn-ghost"
            disabled={duplicating}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            📋 Duplica e basta
          </button>
          <button onClick={onCancel} className="cp-btn cp-btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            Annulla
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------- Quick Actions Floating Bar ----------
function QuickActions({ campaign, onEdit, onDuplicate, onDelete, onReport }) {
  const isSent = campaign.status === 'sent'
  return (
    <div className="cp-quick-actions" onClick={e => e.stopPropagation()}>
      <button
        className="cp-qa-btn"
        onClick={isSent ? onReport : onEdit}
        title={isSent ? 'Vedi report' : 'Modifica'}
      >
        {isSent ? '📊' : '✏️'}
      </button>
      <button className="cp-qa-btn" onClick={onDuplicate} title="Duplica">📋</button>
      <div className="cp-qa-divider" />
      <button className="cp-qa-btn cp-qa-danger" onClick={onDelete} title="Elimina">🗑️</button>
    </div>
  )
}

// ---------- Main Component ----------
export default function CampaignsPage() {
  const { navigate, showToast } = useApp()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [duplicateTarget, setDuplicateTarget] = useState(null)
  const [sortBy, setSortBy] = useState('newest')
  const [hoveredId, setHoveredId] = useState(null)
  const searchRef = useRef(null)

  // --- Drag & Drop state ---
  const [dragId, setDragId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)
  const [customOrder, setCustomOrder] = useState(null) // null = use sortBy, array = manual order

  const load = useCallback(() => {
    setLoading(true)
    api('/campaigns')
      .then(data => {
        setCampaigns(data)
        // Load saved order from localStorage
        try {
          const savedOrder = JSON.parse(localStorage.getItem('cp_campaign_order') || 'null')
          if (savedOrder && Array.isArray(savedOrder)) {
            setCustomOrder(savedOrder)
          }
        } catch {}
      })
      .catch(e => showToast(e.message, 'error'))
      .finally(() => setLoading(false))
  }, [showToast])

  useEffect(() => { load() }, [load])

  // Keyboard shortcut: Ctrl+K → focus search, Ctrl+N → new campaign
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        navigate('new-campaign')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate])

  // ---------- Delete ----------
  const del = async () => {
    if (!deleteTarget) return
    try {
      await api(`/campaigns/${deleteTarget.id}`, { method: 'DELETE' })
      showToast('Campagna eliminata', 'success')
      load()
    } catch (e) {
      showToast(e.message, 'error')
    }
    setDeleteTarget(null)
  }

  // ---------- Duplicate ----------
  const dup = async (andEdit = false) => {
    if (!duplicateTarget) return
    try {
      const result = await api(`/campaigns/${duplicateTarget.id}/duplicate`, { method: 'POST' })
      if (andEdit && result?.id) {
        showToast('Campagna duplicata — apertura editor...', 'success')
        navigate('edit-campaign', result.id)
      } else {
        showToast('Campagna duplicata', 'success')
        load()
      }
    } catch (e) {
      showToast(e.message, 'error')
    }
    setDuplicateTarget(null)
  }

  // ---------- Drag & Drop ----------
  const handleDragStart = (e, id) => {
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
    // Create custom drag image
    const el = e.currentTarget
    if (el) {
      const ghost = el.cloneNode(true)
      ghost.style.width = el.offsetWidth + 'px'
      ghost.style.opacity = '0.85'
      ghost.style.transform = 'rotate(2deg) scale(1.02)'
      ghost.style.boxShadow = '0 16px 48px rgba(108, 92, 231, 0.4)'
      ghost.style.position = 'fixed'
      ghost.style.top = '-9999px'
      document.body.appendChild(ghost)
      e.dataTransfer.setDragImage(ghost, el.offsetWidth / 2, 30)
      requestAnimationFrame(() => document.body.removeChild(ghost))
    }
  }

  const handleDragOver = (e, id) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (id !== dragId) setDragOverId(id)
  }

  const handleDragLeave = () => {
    setDragOverId(null)
  }

  const handleDrop = (e, targetId) => {
    e.preventDefault()
    setDragOverId(null)

    if (!dragId || dragId === targetId) { setDragId(null); return }

    // Reorder the list
    const currentList = getOrderedCampaigns()
    const ids = currentList.map(c => c.id)
    const fromIdx = ids.indexOf(dragId)
    const toIdx = ids.indexOf(targetId)
    if (fromIdx === -1 || toIdx === -1) { setDragId(null); return }

    const newIds = [...ids]
    newIds.splice(fromIdx, 1)
    newIds.splice(toIdx, 0, dragId)

    setCustomOrder(newIds)
    setSortBy('custom')

    // Persist order
    try {
      localStorage.setItem('cp_campaign_order', JSON.stringify(newIds))
    } catch {}

    setDragId(null)
    showToast('Ordine aggiornato', 'success')
  }

  const handleDragEnd = () => {
    setDragId(null)
    setDragOverId(null)
  }

  // ---------- Filter + Sort ----------
  const getOrderedCampaigns = useCallback(() => {
    let list = campaigns.filter(c => {
      if (filterStatus !== 'all' && c.status !== filterStatus) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return c.name?.toLowerCase().includes(q) || c.subject?.toLowerCase().includes(q)
      }
      return true
    })

    if (sortBy === 'custom' && customOrder) {
      const orderMap = {}
      customOrder.forEach((id, idx) => { orderMap[id] = idx })
      list.sort((a, b) => (orderMap[a.id] ?? 9999) - (orderMap[b.id] ?? 9999))
    } else {
      list.sort((a, b) => {
        switch (sortBy) {
          case 'oldest': return new Date(a.created_at || 0) - new Date(b.created_at || 0)
          case 'name': return (a.name || '').localeCompare(b.name || '')
          case 'status': return (a.status || '').localeCompare(b.status || '')
          default: return new Date(b.created_at || 0) - new Date(a.created_at || 0)
        }
      })
    }
    return list
  }, [campaigns, filterStatus, search, sortBy, customOrder])

  const filtered = getOrderedCampaigns()

  // ---------- Quick Stats ----------
  const totalSent = campaigns.filter(c => c.status === 'sent').length
  const totalDraft = campaigns.filter(c => c.status === 'draft').length
  const totalScheduled = campaigns.filter(c => c.status === 'scheduled').length

  // ---------- Render ----------
  return (
    <div className="cp-container">
      {/* Header */}
      <div className="cp-header">
        <div className="cp-header-left">
          <h1 className="cp-title">Campagne</h1>
          <span className="cp-count">{campaigns.length}</span>
        </div>
        <div className="cp-header-right">
          <button className="cp-btn cp-btn-primary cp-btn-new" onClick={() => navigate('new-campaign')}
            title="Nuova campagna (⌘+N)"
          >
            <span className="cp-btn-icon">＋</span>
            Nuova campagna
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      {!loading && campaigns.length > 0 && (
        <div className="cp-quick-stats">
          <div className="cp-quick-stat" onClick={() => setFilterStatus('all')}>
            <span className="cp-qs-number">{campaigns.length}</span>
            <span className="cp-qs-label">Totali</span>
          </div>
          <div className="cp-quick-stat" onClick={() => setFilterStatus('sent')}>
            <span className="cp-qs-number cp-qs-sent">{totalSent}</span>
            <span className="cp-qs-label">Inviate</span>
          </div>
          <div className="cp-quick-stat" onClick={() => setFilterStatus('draft')}>
            <span className="cp-qs-number cp-qs-draft">{totalDraft}</span>
            <span className="cp-qs-label">Bozze</span>
          </div>
          <div className="cp-quick-stat" onClick={() => setFilterStatus('scheduled')}>
            <span className="cp-qs-number cp-qs-scheduled">{totalScheduled}</span>
            <span className="cp-qs-label">Programmate</span>
          </div>
        </div>
      )}

      {/* Search + Filter Bar */}
      <div className="cp-toolbar">
        <div className="cp-search-wrapper">
          <span className="cp-search-icon">🔍</span>
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cerca campagne..."
            className="cp-search-input"
            aria-label="Cerca campagne"
          />
          {search && (
            <button className="cp-search-clear" onClick={() => setSearch('')} aria-label="Pulisci ricerca">✕</button>
          )}
          <kbd className="cp-search-shortcut">⌘K</kbd>
        </div>
        <div className="cp-filter-group">
          {['all', 'draft', 'scheduled', 'sending', 'sent'].map(s => (
            <button
              key={s}
              className={`cp-filter-btn ${filterStatus === s ? 'active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === 'all' ? 'Tutte' : STATUS_MAP[s]?.l}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={e => { setSortBy(e.target.value); if (e.target.value !== 'custom') setCustomOrder(null) }}
          className="cp-sort-select"
          aria-label="Ordina campagne"
        >
          <option value="newest">Più recenti</option>
          <option value="oldest">Meno recenti</option>
          <option value="name">Nome A-Z</option>
          <option value="status">Stato</option>
          {customOrder && <option value="custom">📌 Ordine personalizzato</option>}
        </select>
      </div>

      {/* Drag hint */}
      {!loading && filtered.length > 1 && (
        <p className="cp-drag-hint">💡 Trascina le card per riordinare le campagne</p>
      )}

      {/* Campaign Cards */}
      <div className="cp-grid">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} index={i} />)
        ) : filtered.length === 0 ? (
          <div className="cp-empty">
            <div className="cp-empty-icon">{search || filterStatus !== 'all' ? '🔍' : '📬'}</div>
            <h3 className="cp-empty-title">
              {search || filterStatus !== 'all' ? 'Nessun risultato' : 'Nessuna campagna ancora'}
            </h3>
            <p className="cp-empty-desc">
              {search || filterStatus !== 'all'
                ? 'Prova a cambiare i filtri di ricerca.'
                : 'Crea la tua prima campagna e inizia a comunicare con i tuoi iscritti.'}
            </p>
            {!search && filterStatus === 'all' && (
              <button className="cp-btn cp-btn-primary" onClick={() => navigate('new-campaign')}>
                ✨ Crea prima campagna
              </button>
            )}
          </div>
        ) : (
          filtered.map((c, i) => {
            const st = STATUS_MAP[c.status] || STATUS_MAP.draft
            const isDragging = dragId === c.id
            const isDragOver = dragOverId === c.id
            const isHovered = hoveredId === c.id

            return (
              <div
                key={c.id}
                className={`cp-card cp-card-${c.status} ${isDragging ? 'cp-card-dragging' : ''} ${isDragOver ? 'cp-card-dragover' : ''}`}
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => c.status === 'sent' ? navigate('campaign-report', c.id) : navigate('edit-campaign', c.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') c.status === 'sent' ? navigate('campaign-report', c.id) : navigate('edit-campaign', c.id) }}
                aria-label={`Campagna: ${c.name}`}
                onMouseEnter={() => setHoveredId(c.id)}
                onMouseLeave={() => setHoveredId(null)}
                /* Drag & Drop */
                draggable
                onDragStart={e => handleDragStart(e, c.id)}
                onDragOver={e => handleDragOver(e, c.id)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, c.id)}
                onDragEnd={handleDragEnd}
              >
                {/* Drag indicator */}
                <div className="cp-drag-handle" title="Trascina per riordinare">⠿</div>

                {/* Quick Actions (on hover) */}
                {isHovered && !dragId && (
                  <QuickActions
                    campaign={c}
                    onEdit={() => navigate('edit-campaign', c.id)}
                    onReport={() => navigate('campaign-report', c.id)}
                    onDuplicate={() => setDuplicateTarget(c)}
                    onDelete={() => setDeleteTarget(c)}
                  />
                )}

                {/* Card Header */}
                <div className="cp-card-header">
                  <div className="cp-card-title-row">
                    <h3 className="cp-card-title">{c.name}</h3>
                    <span className={`cp-badge ${st.b}`}>
                      <span className="cp-badge-icon">{st.icon}</span>
                      {st.l}
                    </span>
                  </div>
                  <p className="cp-card-subject">
                    <span className="cp-card-subject-label">Oggetto:</span> {c.subject || '—'}
                  </p>
                  {c.status === 'scheduled' && c.scheduled_at && (
                    <p className="cp-card-schedule">📅 Programmata per {formatDate(c.scheduled_at)}</p>
                  )}
                </div>

                {/* Stats (sent) */}
                {c.status === 'sent' && (
                  <div className="cp-card-stats">
                    <StatBar label="Aperture" value={c.total_opened} total={c.total_sent} color="#6c5ce7" icon="📧" />
                    <StatBar label="Click" value={c.total_clicked} total={c.total_sent} color="#00b894" icon="🖱️" />
                    <StatBar label="Inviate" value={c.total_sent} total={c.total_sent} color="#0984e3" icon="📤" />
                  </div>
                )}

                {/* Sending progress */}
                {c.status === 'sending' && (
                  <div className="cp-card-sending">
                    <div className="cp-sending-bar">
                      <div className="cp-sending-fill"
                        style={{ width: `${c.total_recipients ? Math.round((c.total_sent / c.total_recipients) * 100) : 0}%` }}
                      />
                    </div>
                    <span className="cp-sending-text">
                      {c.total_sent || 0} / {c.total_recipients || '?'} inviate
                    </span>
                  </div>
                )}

                {/* Card Footer */}
                <div className="cp-card-footer">
                  <span className="cp-card-date">
                    {c.status === 'sent' && c.sent_at ? `Inviata il ${formatDate(c.sent_at)}` :
                     c.created_at ? `Creata il ${formatDate(c.created_at)}` : ''}
                  </span>
                  <div className="cp-card-actions" onClick={e => e.stopPropagation()}>
                    <button className="cp-action-btn" onClick={() => setDuplicateTarget(c)} title="Duplica">📋</button>
                    <button className="cp-action-btn cp-action-danger" onClick={() => setDeleteTarget(c)} title="Elimina">🗑️</button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteModal campaign={deleteTarget} onConfirm={del} onCancel={() => setDeleteTarget(null)} />
      )}

      {/* Duplicate Modal */}
      {duplicateTarget && (
        <DuplicateModal
          campaign={duplicateTarget}
          onDuplicate={() => dup(false)}
          onDuplicateAndEdit={() => dup(true)}
          onCancel={() => setDuplicateTarget(null)}
        />
      )}
    </div>
  )
}
