import { useState, useEffect, useRef, useCallback } from 'react'
import { api, formatDate } from '../utils/api'
import { useApp } from '../context/AppContext'
import VisualEmailEditor, { exportEmailHTML } from './VisualEmailEditor'
import './CampaignEditor.css'

/* ============================================================
   CampaignEditor v3.2 — Premium Email Editor (Visual Mode Fix)
   Features: code/visual/preview modes, device frames, subject
   bar with placeholders, schedule, test email, send confirmation,
   auto-save, SVG icons, VisualEmailEditor integration.
   ============================================================ */

/* ── SVG Icon Components ── */
const ArrowLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)

const SaveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
)

const SendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

const TestIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 7l-10 7L2 7" />
  </svg>
)

const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
)

const MonitorIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
)

const PhoneIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
)

const TabletIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const TagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
)

const CodeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

/* ── Placeholder definitions ── */
const PLACEHOLDERS = [
  { code: '{{nome}}', label: 'Nome iscritto', example: 'Mario' },
  { code: '{{email}}', label: 'Email iscritto', example: 'mario@esempio.com' },
  { code: '{{unsubscribe}}', label: 'Link disiscrizione', example: '#' },
]

/* ── Character count helper ── */
function getCharClass(len) {
  if (len === 0) return 'ce-char-empty'
  if (len <= 50) return 'ce-char-good'
  if (len <= 70) return 'ce-char-warning'
  return 'ce-char-error'
}

/* ============================================================
   Main Component
   ============================================================ */
export default function CampaignEditor({ campaignId }) {
  const { navigate, showToast } = useApp()

  // ── State ──
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [campaign, setCampaign] = useState(null)

  // Fields
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [editorBlocks, setEditorBlocks] = useState(null)
  const [tags, setTags] = useState([])
  const [availableTags, setAvailableTags] = useState([])

  // Schedule
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')

  // Editor state
  const [mode, setMode] = useState('visual') // 'code' | 'visual' | 'preview'
  const [device, setDevice] = useState('desktop')
  const [showOptions, setShowOptions] = useState(false)
  const [showPlaceholders, setShowPlaceholders] = useState(false)
  const [hasUnsaved, setHasUnsaved] = useState(false)

  // Modals
  const [showTestModal, setShowTestModal] = useState(false)
  const [showSendConfirm, setShowSendConfirm] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testHistory, setTestHistory] = useState([])
  const [sendingTest, setSendingTest] = useState(false)
  const [sending, setSending] = useState(false)

  // Recipients count
  const [recipientCount, setRecipientCount] = useState(null)

  // Refs
  const iframeRef = useRef(null)
  const codeRef = useRef(null)
  const subjectRef = useRef(null)
  const autoSaveTimer = useRef(null)

  // ── Load campaign ──
  const loadCampaign = useCallback(async () => {
    try {
      if (!campaignId) { setLoading(false); return; }
      const data = await api(`/campaigns/${campaignId}`)
      setCampaign(data)
      setName(data.name || '')
      setSubject(data.subject || '')
      setHtmlContent(data.html_content || '')
      setTags(data.tags || [])

      // Load editor blocks if available
      if (data.editor_blocks) {
        try {
          const blocks = typeof data.editor_blocks === 'string'
            ? JSON.parse(data.editor_blocks)
            : data.editor_blocks
          setEditorBlocks(blocks)
        } catch {
          setEditorBlocks(null)
        }
      }

      if (data.scheduled_at) {
        const dt = new Date(data.scheduled_at)
        setScheduleDate(dt.toISOString().split('T')[0])
        setScheduleTime(dt.toTimeString().slice(0, 5))
      }

      // If has blocks, default to visual mode; otherwise code
      if (data.editor_blocks) {
        setMode('visual')
      } else if (data.html_content) {
        setMode('code')
      }
    } catch {
      showToast('Errore nel caricamento campagna', 'error')
      navigate('campaigns')
    } finally {
      setLoading(false)
    }
  }, [campaignId, showToast, navigate])

  useEffect(() => { loadCampaign() }, [loadCampaign])

  // ── Load available tags ──
  useEffect(() => {
    const loadTags = async () => {
      try {
        const data = await api('/tags')
        setAvailableTags(data)
      } catch {}
    }
    loadTags()
  }, [])

  // ── Recipient count ──
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const params = tags.length > 0 ? `?tags=${tags.join(',')}` : ''
        const data = await api(`/subscribers/count${params}`)
        setRecipientCount(data.count)
      } catch {}
    }
    fetchCount()
  }, [tags])

  // ── Auto-save ──
  useEffect(() => {
    if (!hasUnsaved || !campaign) return
    autoSaveTimer.current = setTimeout(() => {
      handleSave(true)
    }, 5000)
    return () => clearTimeout(autoSaveTimer.current)
  }, [name, subject, htmlContent, tags, scheduleDate, scheduleTime, hasUnsaved])

  // ── Mark unsaved ──
  const markUnsaved = () => setHasUnsaved(true)

  // ── Visual editor blocks change handler ──
  const handleBlocksChange = useCallback((newBlocks) => {
    setEditorBlocks(newBlocks)
    // Generate HTML from blocks for preview/send
    try {
      const html = exportEmailHTML(newBlocks, {
        bodyBg: '#f4f4f7',
        emailWidth: 600,
        preheaderText: subject,
      })
      setHtmlContent(html)
    } catch {
      // Keep previous HTML if export fails
    }
    markUnsaved()
  }, [subject])

  // ── Sync HTML when switching from visual to code ──
  const handleModeChange = useCallback((newMode) => {
    if (mode === 'visual' && newMode === 'code' && editorBlocks) {
      try {
        const html = exportEmailHTML(editorBlocks, {
          bodyBg: '#f4f4f7',
          emailWidth: 600,
          preheaderText: subject,
        })
        setHtmlContent(html)
      } catch {}
    }
    setMode(newMode)
  }, [mode, editorBlocks, subject])

  // ── Update preview iframe ──
  useEffect(() => {
    if (mode === 'preview' && iframeRef.current) {
      const doc = iframeRef.current.contentDocument
      if (doc) {
        doc.open()
        doc.write(htmlContent || '<html><body style="font-family:sans-serif;color:#999;padding:40px;text-align:center">Nessun contenuto da visualizzare</body></html>')
        doc.close()
      }
    }
  }, [mode, htmlContent, device])

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        handleModeChange('preview')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [name, subject, htmlContent, tags, scheduleDate, scheduleTime])

  // ── Save ──
  const handleSave = async (silent = false) => {
    if (saving) return
    setSaving(true)
    try {
      const body = {
        name,
        subject,
        html_content: htmlContent,
        editor_blocks: editorBlocks ? JSON.stringify(editorBlocks) : null,
        tags,
        scheduled_at: scheduleDate && scheduleTime
          ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
          : null,
      }
      await api(`/campaigns/${campaignId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
      setHasUnsaved(false)
      if (!silent) showToast('Campagna salvata', 'success')
    } catch {
      if (!silent) showToast('Errore nel salvataggio', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Send Test ──
  const sendTest = async () => {
    if (!testEmail || sendingTest) return
    setSendingTest(true)
    try {
      await api(`/campaigns/${campaignId}/test`, {
        method: 'POST',
        body: JSON.stringify({ email: testEmail }),
      })
      showToast(`Test inviato a ${testEmail}`, 'success')
      setTestHistory(prev => [testEmail, ...prev.slice(0, 4)])
      setShowTestModal(false)
    } catch {
      showToast('Errore nell\'invio del test', 'error')
    } finally {
      setSendingTest(false)
    }
  }

  // ── Send Campaign ──
  const handleSend = async () => {
    if (sending) return
    setSending(true)
    try {
      await handleSave(true)
      const res = await api(`/campaigns/${campaignId}/send`, { method: 'POST' })
      showToast(res.message || (scheduleDate && scheduleTime ? 'Campagna programmata!' : 'Campagna inviata!'), 'success')
      navigate('campaigns')
    } catch {
      showToast('Errore nell\'invio della campagna', 'error')
    } finally {
      setSending(false)
      setShowSendConfirm(false)
    }
  }

  // ── Insert placeholder ──
  const insertPlaceholder = (code) => {
    if (subjectRef.current) {
      const el = subjectRef.current
      const start = el.selectionStart
      const end = el.selectionEnd
      const newVal = subject.slice(0, start) + code + subject.slice(end)
      setSubject(newVal)
      markUnsaved()
      setTimeout(() => {
        el.focus()
        el.setSelectionRange(start + code.length, start + code.length)
      }, 0)
    }
    setShowPlaceholders(false)
  }

  // ── Insert HTML snippet ──
  const insertHtml = (snippet) => {
    if (codeRef.current) {
      const el = codeRef.current
      const start = el.selectionStart
      const end = el.selectionEnd
      const newVal = htmlContent.slice(0, start) + snippet + htmlContent.slice(end)
      setHtmlContent(newVal)
      markUnsaved()
      setTimeout(() => {
        el.focus()
        el.setSelectionRange(start + snippet.length, start + snippet.length)
      }, 0)
    }
  }

  // ── Tag toggle ──
  const toggleTag = (tag) => {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
    markUnsaved()
  }

  // ── Code line count ──
  const lineCount = htmlContent.split('\n').length

  // ── Loading ──
  if (loading) {
    return (
      <div className="ce-container">
        <div className="ce-loading">
          <div className="ce-spinner" />
          <span>Caricamento editor...</span>
        </div>
      </div>
    )
  }

  if (!campaign && campaignId) return null

  const isNew = !campaign?.sent_at && campaign?.status !== 'sending'

  // ── Render ──
  return (
    <div className="ce-container">

      {/* ═══ Page Header ═══ */}
      <div className="ce-page-header">
        <div className="ce-page-header-left">
          <h1 className="ce-page-title">
            {campaignId === 'new' ? 'Nuova campagna' : 'Modifica campagna'}
          </h1>
          <p className="ce-page-subtitle">
            {campaignId === 'new' ? 'Crea una nuova campagna' : `Modifica "${name || 'campagna'}"`}
          </p>
        </div>
      </div>

      {/* ═══ Editor Card ═══ */}
      <div className="ce-editor-card">

        {/* ── Toolbar ── */}
        <div className="ce-toolbar">
          <div className="ce-toolbar-left">
            <button className="ce-btn ce-btn-ghost" onClick={() => navigate('campaigns')}>
              <ArrowLeftIcon /> Campagne
            </button>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); markUnsaved() }}
              placeholder="Nome campagna..."
              className="ce-name-input"
            />
            {hasUnsaved && (
              <span className="ce-unsaved-badge">● Non salvato</span>
            )}
          </div>
          <div className="ce-toolbar-right">
            <button className="ce-btn ce-btn-ghost" onClick={() => setShowOptions(!showOptions)}>
              <SettingsIcon /> Opzioni
            </button>
            <button className="ce-btn ce-btn-ghost" onClick={() => setShowTestModal(true)}>
              <TestIcon /> Test
            </button>
            <button
              className="ce-btn ce-btn-secondary"
              onClick={() => handleSave()}
              disabled={saving}
            >
              <SaveIcon /> {saving ? 'Salvo...' : 'Salva'}
            </button>
            {isNew && (
              <button
                className="ce-btn ce-btn-primary"
                onClick={() => setShowSendConfirm(true)}
              >
                <SendIcon /> {scheduleDate && scheduleTime ? 'Programma' : 'Invia'}
              </button>
            )}
          </div>
        </div>

        {/* ── Subject bar ── */}
        <div className="ce-subject-bar">
          <span className="ce-subject-label">OGGETTO</span>
          <input
            ref={subjectRef}
            type="text"
            value={subject}
            onChange={(e) => { setSubject(e.target.value); markUnsaved() }}
            placeholder="Scrivi l'oggetto della email..."
            className="ce-subject-input"
          />
          <span className={`ce-char-count ${getCharClass(subject.length)}`}>
            {subject.length}/70
          </span>
          <div className="ce-placeholder-wrap">
            <button
              className="ce-btn-icon"
              onClick={() => setShowPlaceholders(!showPlaceholders)}
              title="Inserisci placeholder"
            >
              {'{{ ... }}'}
            </button>
            {showPlaceholders && (
              <div className="ce-placeholder-dropdown">
                {PLACEHOLDERS.map(p => (
                  <button
                    key={p.code}
                    className="ce-placeholder-item"
                    onClick={() => insertPlaceholder(p.code)}
                  >
                    <span className="ce-ph-code">{p.code}</span>
                    <span className="ce-ph-label">{p.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Mode Tabs ── */}
        <div className="ce-mode-bar">
          <div className="ce-mode-tabs">
            <button
              className={`ce-mode-tab${mode === 'code' ? ' active' : ''}`}
              onClick={() => handleModeChange('code')}
            >
              <CodeIcon /> Codice
            </button>
            <button
              className={`ce-mode-tab${mode === 'visual' ? ' active' : ''}`}
              onClick={() => handleModeChange('visual')}
            >
              <PencilIcon /> Editor
            </button>
            <button
              className={`ce-mode-tab${mode === 'preview' ? ' active' : ''}`}
              onClick={() => handleModeChange('preview')}
            >
              <EyeIcon /> Anteprima
            </button>
          </div>

          {/* Device toggle for preview */}
          {mode === 'preview' && (
            <div className="ce-device-bar">
              <span className="ce-preview-hint">Anteprima email come la vedranno i destinatari</span>
              <div className="ce-device-toggle">
                <button
                  className={`ce-device-btn${device === 'desktop' ? ' active' : ''}`}
                  onClick={() => setDevice('desktop')}
                >
                  <MonitorIcon /> Desktop
                </button>
                <button
                  className={`ce-device-btn${device === 'mobile' ? ' active' : ''}`}
                  onClick={() => setDevice('mobile')}
                >
                  <PhoneIcon /> Mobile
                </button>
                <button
                  className={`ce-device-btn${device === 'tablet' ? ' active' : ''}`}
                  onClick={() => setDevice('tablet')}
                >
                  <TabletIcon /> Tablet
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Editor Content ── */}
        <div className="ce-content">

          {/* Code Mode */}
          {mode === 'code' && (
            <div className="ce-code-wrap">
              <div className="ce-code-lines">
                {Array.from({ length: lineCount }, (_, i) => (
                  <span key={i}>{i + 1}</span>
                ))}
              </div>
              <textarea
                ref={codeRef}
                value={htmlContent}
                onChange={(e) => { setHtmlContent(e.target.value); markUnsaved() }}
                className="ce-code-editor"
                placeholder="Scrivi il tuo HTML qui..."
                spellCheck={false}
              />
            </div>
          )}

          {/* Visual Mode — VisualEmailEditor */}
          {mode === 'visual' && (
            <div className="ce-visual-wrap">
              <VisualEmailEditor
                initialBlocks={editorBlocks || []}
                onChange={handleBlocksChange}
                subject={subject}
              />
            </div>
          )}

          {/* Preview Mode */}
          {mode === 'preview' && (
            <div className="ce-preview-section">
              <div className="ce-preview-bar">
                <span className="ce-preview-bar-label">ANTEPRIMA</span>
                <div className="ce-device-toggle">
                  <button
                    className={`ce-device-btn${device === 'desktop' ? ' active' : ''}`}
                    onClick={() => setDevice('desktop')}
                  >
                    <MonitorIcon /> Desktop
                  </button>
                  <button
                    className={`ce-device-btn${device === 'mobile' ? ' active' : ''}`}
                    onClick={() => setDevice('mobile')}
                  >
                    <PhoneIcon /> Mobile
                  </button>
                  <button
                    className={`ce-device-btn${device === 'tablet' ? ' active' : ''}`}
                    onClick={() => setDevice('tablet')}
                  >
                    <TabletIcon /> Tablet
                  </button>
                </div>
              </div>

              <div className="ce-preview-frame-container">
                {device === 'desktop' && (
                  <iframe
                    ref={iframeRef}
                    className="ce-preview-iframe"
                    title="Preview Desktop"
                  />
                )}
                {device === 'mobile' && (
                  <div className="ce-device-phone">
                    <div className="ce-phone-notch">
                      <div className="ce-phone-notch-camera" />
                    </div>
                    <div className="ce-phone-screen">
                      <iframe
                        ref={iframeRef}
                        className="ce-preview-iframe"
                        title="Preview Mobile"
                      />
                    </div>
                    <div className="ce-phone-home-bar">
                      <div className="ce-phone-home-indicator" />
                    </div>
                  </div>
                )}
                {device === 'tablet' && (
                  <div className="ce-device-tablet">
                    <div className="ce-tablet-camera" />
                    <div className="ce-tablet-screen">
                      <iframe
                        ref={iframeRef}
                        className="ce-preview-iframe"
                        title="Preview Tablet"
                      />
                    </div>
                    <div className="ce-tablet-home" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Options Panel ═══ */}
      {showOptions && (
        <div className="ce-modal-overlay" onClick={() => setShowOptions(false)}>
          <div className="ce-modal" onClick={e => e.stopPropagation()}>
            <div className="ce-modal-header">
              <h2>Opzioni campagna</h2>
              <button className="ce-modal-close" onClick={() => setShowOptions(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="ce-modal-body">
              {/* Tags */}
              <div className="ce-option-section">
                <h3><TagIcon /> Tag destinatari</h3>
                <p className="ce-option-hint">
                  Seleziona i tag per filtrare i destinatari. Lascia vuoto per inviare a tutti.
                </p>
                <div className="ce-tag-list">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      className={`ce-tag-chip${tags.includes(tag) ? ' active' : ''}`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                  {availableTags.length === 0 && (
                    <span className="ce-option-empty">Nessun tag disponibile</span>
                  )}
                </div>
                {recipientCount !== null && (
                  <p className="ce-recipient-count">
                    📬 {recipientCount} destinatari{tags.length > 0 ? ` (filtrati per: ${tags.join(', ')})` : ''}
                  </p>
                )}
              </div>

              {/* Schedule */}
              <div className="ce-option-section">
                <h3>📅 Programmazione invio</h3>
                <p className="ce-option-hint">
                  Imposta data e ora per inviare automaticamente.
                </p>
                <div className="ce-schedule-row">
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => { setScheduleDate(e.target.value); markUnsaved() }}
                    className="ce-modal-input"
                  />
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => { setScheduleTime(e.target.value); markUnsaved() }}
                    className="ce-modal-input"
                  />
                </div>
                {scheduleDate && scheduleTime && (
                  <p className="ce-schedule-info">
                    Invio programmato: <strong>{new Date(`${scheduleDate}T${scheduleTime}`).toLocaleString('it-IT')}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Test Email Modal ═══ */}
      {showTestModal && (
        <div className="ce-modal-overlay" onClick={() => setShowTestModal(false)}>
          <div className="ce-modal" onClick={e => e.stopPropagation()}>
            <div className="ce-modal-header">
              <h2>Invia email di test</h2>
              <button className="ce-modal-close" onClick={() => setShowTestModal(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="ce-modal-body">
              <p className="ce-option-hint">
                Invia una copia per verificare come apparirà ai destinatari.
              </p>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@esempio.com"
                className="ce-modal-input"
                onKeyDown={e => { if (e.key === 'Enter') sendTest() }}
                autoFocus
              />
              {testHistory.length > 0 && (
                <div className="ce-test-history">
                  <span className="ce-test-history-label">Recenti:</span>
                  {testHistory.map((email, i) => (
                    <button
                      key={i}
                      className="ce-test-history-item"
                      onClick={() => setTestEmail(email)}
                    >
                      {email}
                    </button>
                  ))}
                </div>
              )}
              <p className="ce-option-hint" style={{ marginTop: 12 }}>
                💡 I placeholder come <code>{'{{nome}}'}</code> verranno mostrati con dati di esempio.
              </p>
            </div>
            <div className="ce-modal-footer">
              <button className="ce-btn ce-btn-ghost" onClick={() => setShowTestModal(false)}>
                Annulla
              </button>
              <button
                className="ce-btn ce-btn-primary"
                onClick={sendTest}
                disabled={!testEmail || sendingTest}
              >
                <TestIcon /> {sendingTest ? 'Invio...' : 'Invia test'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Send Confirmation Modal ═══ */}
      {showSendConfirm && (
        <div className="ce-modal-overlay" onClick={() => setShowSendConfirm(false)}>
          <div className="ce-modal" onClick={e => e.stopPropagation()}>
            <div className="ce-modal-header">
              <h2>Conferma invio</h2>
              <button className="ce-modal-close" onClick={() => setShowSendConfirm(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="ce-modal-body">
              <p>
                Stai per inviare <strong>"{name}"</strong> a{' '}
                <strong>{recipientCount !== null ? `${recipientCount} destinatari` : 'tutti gli iscritti'}</strong>.
              </p>
              {scheduleDate && scheduleTime && (
                <p>
                  L'invio è programmato per{' '}
                  <strong>{new Date(`${scheduleDate}T${scheduleTime}`).toLocaleString('it-IT')}</strong>.
                </p>
              )}
              <p className="ce-send-warning">
                ⚠️ L'invio è immediato e non può essere annullato.
              </p>
            </div>
            <div className="ce-modal-footer">
              <button className="ce-btn ce-btn-ghost" onClick={() => setShowSendConfirm(false)}>
                Annulla
              </button>
              <button
                className="ce-btn ce-btn-primary"
                onClick={handleSend}
                disabled={sending}
              >
                <SendIcon /> {sending ? 'Elaborazione...' : (scheduleDate && scheduleTime ? 'Conferma programmazione' : 'Conferma invio')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
