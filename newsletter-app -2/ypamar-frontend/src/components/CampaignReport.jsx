import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { api, formatDate, calcRate } from '../utils/api'
import { sanitizePreview } from '../utils/sanitize'
import { useApp } from '../context/AppContext'
import './CampaignReport.css'

/* ============================================================
   CampaignReport v2.0 Final — Premium Analytics Dashboard
   SVG icons, memoized computations, aligned to design system v2.0
   ============================================================ */

/* ── SVG Icon Components ── */
const ArrowLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const ShareIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
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

const ExternalLinkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

/* ── Tab Icons ── */
const TabIcons = {
  overview: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  engagement: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  clicks: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  ),
  audience: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  preview: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
}

/* ── Constants ── */
const TABS = [
  { id: 'overview',   label: 'Overview' },
  { id: 'engagement', label: 'Engagement' },
  { id: 'clicks',     label: 'Click' },
  { id: 'audience',   label: 'Audience' },
  { id: 'preview',    label: 'Anteprima' },
]

const BENCHMARKS = { openRate: 21.3, clickRate: 2.6, bounceRate: 0.4 }

const PREVIEW_DEVICES = [
  { id: 'desktop', label: 'Desktop', icon: MonitorIcon, width: 660, frame: false },
  { id: 'tablet',  label: 'Tablet',  icon: TabletIcon,  width: 768, frame: 'tablet' },
  { id: 'mobile',  label: 'Mobile',  icon: PhoneIcon,   width: 375, frame: 'phone' },
]

const POLL_INTERVAL = 10000

/* ── Animated Counter Hook ── */
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    if (target === 0) { setValue(0); return }
    const startTime = performance.now()

    function animate(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setValue(Math.round(target * eased))
      if (progress < 1) ref.current = requestAnimationFrame(animate)
    }

    ref.current = requestAnimationFrame(animate)
    return () => { if (ref.current) cancelAnimationFrame(ref.current) }
  }, [target, duration])

  return value
}

/* ── Animated Number Display ── */
function AnimatedNum({ value, suffix = '', prefix = '', decimals = 0 }) {
  const animated = useCountUp(typeof value === 'number' ? value : 0)
  const display = decimals > 0 ? animated.toFixed(decimals) : animated.toLocaleString()
  return <>{prefix}{display}{suffix}</>
}

/* ── Mini Bar Chart ── */
function MiniBar({ items, maxValue, colorFn }) {
  if (!items || items.length === 0) {
    return <div className="cr-empty-mini">Nessun dato</div>
  }
  const max = maxValue || Math.max(...items.map(i => i.value), 1)
  return (
    <div className="cr-minibar-list">
      {items.map((item, i) => (
        <div key={i} className="cr-minibar-row">
          <span className="cr-minibar-label">{item.label}</span>
          <div className="cr-minibar-track">
            <div
              className="cr-minibar-fill"
              style={{
                width: `${max > 0 ? (item.value / max) * 100 : 0}%`,
                background: colorFn ? colorFn(i) : 'var(--ce-primary)',
                animationDelay: `${i * 0.05}s`,
              }}
            />
          </div>
          <span className="cr-minibar-value">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Vs Benchmark Badge ── */
function VsBenchmark({ value, benchmark, suffix = '%' }) {
  if (typeof value !== 'number' || typeof benchmark !== 'number') return null
  const diff = value - benchmark
  const absDiff = Math.abs(diff).toFixed(1)

  if (diff > 1) return <span className="cr-vs-badge cr-vs-good">▲ +{absDiff}{suffix} vs media</span>
  if (diff < -1) return <span className="cr-vs-badge cr-vs-bad">▼ -{absDiff}{suffix} vs media</span>
  return <span className="cr-vs-badge cr-vs-neutral">≈ nella media</span>
}

/* ── Funnel Component ── */
function Funnel({ steps }) {
  const maxVal = Math.max(...steps.map(s => s.value), 1)
  return (
    <div className="cr-funnel">
      {steps.map((step, i) => {
        const prev = i > 0 ? steps[i - 1].value : null
        const dropoff = prev ? (((prev - step.value) / prev) * 100).toFixed(1) : null
        return (
          <div key={i} className="cr-funnel-step" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="cr-funnel-info">
              <span className="cr-funnel-icon">{step.icon}</span>
              <span className="cr-funnel-label">{step.label}</span>
              <span className="cr-funnel-num">{step.value.toLocaleString()}</span>
              {dropoff && <span className="cr-funnel-dropoff">-{dropoff}%</span>}
            </div>
            <div className="cr-funnel-bar-track">
              <div
                className="cr-funnel-bar"
                style={{
                  width: `${(step.value / maxVal) * 100}%`,
                  background: step.color,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Stat Bar (Performance) ── */
function StatBar({ label, value, total, color }) {
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0
  return (
    <div className="cr-perf-item">
      <div className="cr-perf-header">
        <span style={{ color: 'var(--ce-text-muted)' }}>{label}</span>
        <span style={{ color: 'var(--ce-text-bright)', fontWeight: 700 }}>
          {value.toLocaleString()} <span style={{ color: 'var(--ce-text-dim)', fontWeight: 400 }}>({pct}%)</span>
        </span>
      </div>
      <div className="cr-perf-track">
        <div className="cr-perf-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

/* ── Device Frame ── */
function DeviceFrame({ type, children }) {
  if (type === 'phone') {
    return (
      <div className="ce-device-phone">
        <div className="ce-phone-notch">
          <div className="ce-phone-notch-camera" />
        </div>
        <div className="ce-phone-screen">{children}</div>
        <div className="ce-phone-home-bar">
          <div className="ce-phone-home-indicator" />
        </div>
      </div>
    )
  }
  if (type === 'tablet') {
    return (
      <div className="ce-device-tablet">
        <div className="ce-tablet-camera" />
        <div className="ce-tablet-screen">{children}</div>
        <div className="ce-tablet-home" />
      </div>
    )
  }
  return <>{children}</>
}

/* ── Skeleton ── */
function ReportSkeleton() {
  return (
    <div className="cr-skeleton-wrap">
      <div className="cr-header-skel">
        <div className="cr-skel cr-skel-title" />
        <div className="cr-skel cr-skel-subtitle" />
      </div>
      <div className="cr-stats-grid">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="cr-stat-card cr-skeleton" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="cr-skel cr-skel-badge" />
            <div className="cr-skel cr-skel-number" />
            <div className="cr-skel cr-skel-label-s" />
          </div>
        ))}
      </div>
      <div className="cr-skel cr-skel-block" style={{ borderRadius: 12 }} />
    </div>
  )
}

/* ============================================================
   Main Component
   ============================================================ */
export default function CampaignReport({ campaignId }) {
  const { navigate, addToast } = useApp()

  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState(null)
  const [tab, setTab] = useState('overview')
  const [previewDevice, setPreviewDevice] = useState('desktop')

  const iframeRef = useRef(null)
  const pollRef = useRef(null)

  // ── Load report ──
  const loadReport = useCallback(async () => {
    try {
      const data = await api(`/campaigns/${campaignId}/report`)
      setReport(data)
    } catch (err) {
      addToast(err?.message || 'Errore nel caricamento del report', 'error')
      navigate('campaigns')
    } finally {
      setLoading(false)
    }
  }, [campaignId, addToast, navigate])

  useEffect(() => { loadReport() }, [loadReport])

  // ── Auto-refresh for sending campaigns ──
  useEffect(() => {
    if (report?.status === 'sending') {
      pollRef.current = setInterval(loadReport, POLL_INTERVAL)
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [report?.status, loadReport])

  // ── Update preview iframe ──
  useEffect(() => {
    if (tab === 'preview' && iframeRef.current && report?.html_content) {
      const doc = iframeRef.current.contentDocument
      if (doc) {
        doc.open()
        doc.write(sanitizePreview(report.html_content))
        doc.close()
      }
    }
  }, [tab, previewDevice, report?.html_content])

  // ── Computed stats ──
  const stats = useMemo(() => {
    if (!report) return null
    const sent = report.sent_count || 0
    const opened = report.opened_count || 0
    const clicked = report.clicked_count || 0
    const bounced = report.bounced_count || 0
    const total = report.total_count || sent
    return {
      sent, opened, clicked, bounced, total,
      openRate: calcRate(opened, sent),
      clickRate: calcRate(clicked, sent),
      ctoRate: calcRate(clicked, opened),
      bounceRate: calcRate(bounced, total),
      deliveredRate: calcRate(sent - bounced, total),
    }
  }, [report])

  // ── FIX: Memoized max values for charts ──
  const maxTimeline = useMemo(() => {
    if (!report?.timeline || report.timeline.length === 0) return 1
    return Math.max(...report.timeline.map(x => Math.max(x.opens || 0, x.clicks || 0)), 1)
  }, [report?.timeline])

  const maxClicks = useMemo(() => {
    if (!report?.clicks || report.clicks.length === 0) return 1
    return Math.max(...report.clicks.map(c => c.count), 1)
  }, [report?.clicks])

  const maxDevices = useMemo(() => {
    if (!report?.devices || report.devices.length === 0) return 1
    return Math.max(...report.devices.map(x => x.count), 1)
  }, [report?.devices])

  // ── Export CSV ──
  const exportCSV = useCallback(() => {
    if (!report || !stats) return
    const rows = [
      ['Metrica', 'Valore'],
      ['Inviate', stats.sent],
      ['Aperte', stats.opened],
      ['Cliccate', stats.clicked],
      ['Bounce', stats.bounced],
      ['Tasso apertura', `${stats.openRate}%`],
      ['Tasso click', `${stats.clickRate}%`],
      ['CTO', `${stats.ctoRate}%`],
    ]

    if (report.opens_by_subscriber) {
      rows.push([], ['Email', 'Nome', 'Aperture', 'Prima apertura', 'Ultima apertura'])
      report.opens_by_subscriber.forEach(s => {
        rows.push([s.email, s.name || '', s.open_count, s.first_open || '', s.last_open || ''])
      })
    }

    if (report.clicks) {
      rows.push([], ['URL', 'Click', 'Click unici'])
      report.clicks.forEach(c => {
        rows.push([c.url, c.count, c.unique_count || c.count])
      })
    }

    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${report.name || campaignId}.csv`
    a.click()
    URL.revokeObjectURL(url)
    addToast('Report CSV esportato', 'success')
  }, [report, stats, campaignId, addToast])

  // ── Share link ──
  const shareReport = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
    addToast('Link report copiato!', 'success')
  }, [addToast])

  // ── Status helpers ──
  const getStatusClass = (status) => {
    const map = { sent: 'cr-status-sent', sending: 'cr-status-sending', scheduled: 'cr-status-scheduled', draft: 'cr-status-draft' }
    return map[status] || 'cr-status-draft'
  }

  const getStatusLabel = (status) => {
    const map = { sent: '✓ Inviata', sending: '◉ In invio', scheduled: '◉ Programmata', draft: '○ Bozza' }
    return map[status] || status
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div className="cr-container">
        <ReportSkeleton />
      </div>
    )
  }

  if (!report) return null

  const isSending = report.status === 'sending'
  const sendingPct = isSending && report.total_count > 0
    ? Math.round((report.sent_count / report.total_count) * 100)
    : 0

  // ── Render ──
  return (
    <div className="cr-container">

      {/* ═══ Header ═══ */}
      <div className="cr-header">
        <div className="cr-header-left">
          <button className="cr-back-btn" onClick={() => navigate('campaigns')}>
            <ArrowLeftIcon /> Campagne
          </button>
          <div className="cr-header-info">
            <h1 className="cr-title">{report.name || 'Report Campagna'}</h1>
            <div className="cr-subtitle">
              <span className={`cr-status-badge ${getStatusClass(report.status)}`}>
                {getStatusLabel(report.status)}
              </span>
              {report.subject && <span className="cr-subject">📨 {report.subject}</span>}
              {report.sent_at && <span className="cr-date">📅 {formatDate(report.sent_at)}</span>}
              {isSending && <span className="cr-refreshing">Aggiornamento automatico</span>}
            </div>
          </div>
        </div>
        <div className="cr-header-actions">
          <button className="cr-btn cr-btn-outline" onClick={shareReport}>
            <ShareIcon /> Condividi
          </button>
          <button className="cr-btn cr-btn-primary" onClick={exportCSV}>
            <DownloadIcon /> Esporta CSV
          </button>
        </div>
      </div>

      {/* ═══ Sending Banner ═══ */}
      {isSending && (
        <div className="cr-sending-banner">
          <div className="cr-sending-info">
            <span className="cr-sending-icon">📤</span>
            <span>
              <strong>{report.sent_count?.toLocaleString()}</strong> / {report.total_count?.toLocaleString()} email
            </span>
            {report.failed_count > 0 && (
              <span className="cr-sending-failed">({report.failed_count} fallite)</span>
            )}
          </div>
          <div className="cr-sending-bar">
            <div className="cr-sending-fill" style={{ width: `${sendingPct}%` }} />
          </div>
          <span className="cr-sending-pct">{sendingPct}%</span>
        </div>
      )}

      {/* ═══ Stats Grid ═══ */}
      {stats && (
        <div className="cr-stats-grid">
          <div className="cr-stat-card cr-stat-success">
            <span className="cr-stat-icon">📨</span>
            <div className="cr-stat-number"><AnimatedNum value={stats.sent} /></div>
            <div className="cr-stat-label">Inviate</div>
            <div className="cr-stat-sub">{stats.deliveredRate}% consegnate</div>
          </div>
          <div className="cr-stat-card cr-stat-info">
            <span className="cr-stat-icon">👁️</span>
            <div className="cr-stat-number"><AnimatedNum value={stats.opened} /></div>
            <div className="cr-stat-label">Aperte</div>
            <div className="cr-stat-sub">{stats.openRate}%</div>
            <VsBenchmark value={parseFloat(stats.openRate)} benchmark={BENCHMARKS.openRate} />
          </div>
          <div className="cr-stat-card cr-stat-accent">
            <span className="cr-stat-icon">🔗</span>
            <div className="cr-stat-number"><AnimatedNum value={stats.clicked} /></div>
            <div className="cr-stat-label">Click</div>
            <div className="cr-stat-sub">{stats.clickRate}%</div>
            <VsBenchmark value={parseFloat(stats.clickRate)} benchmark={BENCHMARKS.clickRate} />
          </div>
          <div className="cr-stat-card">
            <span className="cr-stat-icon">🎯</span>
            <div className="cr-stat-number">{stats.ctoRate}%</div>
            <div className="cr-stat-label">CTO</div>
            <div className="cr-stat-sub">click / aperture</div>
          </div>
          <div className="cr-stat-card cr-stat-danger">
            <span className="cr-stat-icon">↩️</span>
            <div className="cr-stat-number"><AnimatedNum value={stats.bounced} /></div>
            <div className="cr-stat-label">Bounce</div>
            <div className="cr-stat-sub">{stats.bounceRate}%</div>
            <VsBenchmark value={parseFloat(stats.bounceRate)} benchmark={BENCHMARKS.bounceRate} />
          </div>
        </div>
      )}

      {/* ═══ Tabs ═══ */}
      <div className="cr-tabs">
        {TABS.map(t => {
          const Icon = TabIcons[t.id]
          return (
            <button
              key={t.id}
              className={`cr-tab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span className="cr-tab-icon"><Icon /></span>
              <span className="cr-tab-label">{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* ═══ Tab Content ═══ */}
      <div className="cr-tab-content" key={tab}>

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div className="cr-grid-2">
            <div className="cr-card">
              <div className="cr-card-header">
                <h3>Dettagli campagna</h3>
              </div>
              <div className="cr-detail-list">
                <div className="cr-detail-row">
                  <span className="cr-detail-label">Nome</span>
                  <span className="cr-detail-value">{report.name}</span>
                </div>
                <div className="cr-detail-row">
                  <span className="cr-detail-label">Oggetto</span>
                  <span className="cr-detail-value">{report.subject}</span>
                </div>
                <div className="cr-detail-row">
                  <span className="cr-detail-label">Stato</span>
                  <span className="cr-detail-value">
                    <span className={`cr-status-badge ${getStatusClass(report.status)}`}>
                      {getStatusLabel(report.status)}
                    </span>
                  </span>
                </div>
                {report.sent_at && (
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">Inviata il</span>
                    <span className="cr-detail-value cr-mono">{formatDate(report.sent_at)}</span>
                  </div>
                )}
                <div className="cr-detail-row">
                  <span className="cr-detail-label">Destinatari</span>
                  <span className="cr-detail-value cr-mono">{stats.total.toLocaleString()}</span>
                </div>
                {report.tags && report.tags.length > 0 && (
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">Tag</span>
                    <span className="cr-detail-value">{report.tags.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="cr-card">
              <div className="cr-card-header">
                <h3>Funnel conversione</h3>
                <span className="cr-card-badge">3 step</span>
              </div>
              <Funnel steps={[
                { icon: '📨', label: 'Inviate', value: stats.sent, color: 'var(--ce-success)' },
                { icon: '👁️', label: 'Aperte', value: stats.opened, color: 'var(--ce-info)' },
                { icon: '🔗', label: 'Cliccate', value: stats.clicked, color: 'var(--ce-primary)' },
              ]} />
            </div>

            <div className="cr-card cr-card-full">
              <div className="cr-card-header">
                <h3>Performance</h3>
              </div>
              <div className="cr-perf-list">
                <StatBar label="Consegnate" value={stats.sent - stats.bounced} total={stats.total} color="var(--ce-success)" />
                <StatBar label="Aperture" value={stats.opened} total={stats.sent} color="var(--ce-info)" />
                <StatBar label="Click" value={stats.clicked} total={stats.sent} color="var(--ce-primary)" />
                <StatBar label="CTO (click/aperture)" value={stats.clicked} total={stats.opened} color="var(--ce-warning)" />
                <StatBar label="Bounce" value={stats.bounced} total={stats.total} color="var(--ce-danger)" />
              </div>
            </div>
          </div>
        )}

        {/* ── Engagement ── */}
        {tab === 'engagement' && (
          <div className="cr-grid-2">
            <div className="cr-card cr-card-full">
              <div className="cr-card-header">
                <h3>Timeline aperture e click</h3>
                <span className="cr-card-badge">
                  {report.timeline ? `${report.timeline.length} periodi` : 'N/D'}
                </span>
              </div>
              {report.timeline && report.timeline.length > 0 ? (
                <div className="cr-timeline">
                  <div className="cr-timeline-legend">
                    <div className="cr-legend-item">
                      <span className="cr-legend-dot" style={{ background: 'var(--ce-success)' }} />
                      <span>Aperture</span>
                    </div>
                    <div className="cr-legend-item">
                      <span className="cr-legend-dot" style={{ background: 'var(--ce-primary)' }} />
                      <span>Click</span>
                    </div>
                  </div>
                  <div className="cr-timeline-chart">
                    {report.timeline.map((t, i) => (
                      <div
                        key={i}
                        className="cr-timeline-col"
                        data-tooltip={`${t.label}: ${t.opens || 0} aperture, ${t.clicks || 0} click`}
                      >
                        <div className="cr-timeline-bars">
                          <div
                            className="cr-timeline-bar cr-tl-opens"
                            style={{ height: `${((t.opens || 0) / maxTimeline) * 100}%` }}
                          />
                          <div
                            className="cr-timeline-bar cr-tl-clicks"
                            style={{ height: `${((t.clicks || 0) / maxTimeline) * 100}%` }}
                          />
                        </div>
                        <span className="cr-timeline-label">{t.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="cr-empty">
                  <span className="cr-empty-icon">📊</span>
                  <p>Nessun dato temporale disponibile</p>
                </div>
              )}
            </div>

            <div className="cr-card">
              <div className="cr-card-header">
                <h3>Dispositivi</h3>
              </div>
              {report.devices && report.devices.length > 0 ? (
                <div className="cr-device-list">
                  {report.devices.map((d, i) => {
                    const pct = stats.opened > 0 ? ((d.count / stats.opened) * 100).toFixed(1) : 0
                    return (
                      <div key={i} className="cr-device-item">
                        <span className="cr-device-icon">{d.icon || '📱'}</span>
                        <div className="cr-device-info">
                          <div className="cr-device-name">{d.name}</div>
                          <div className="cr-device-bar-track">
                            <div
                              className="cr-device-bar-fill"
                              style={{ width: `${(d.count / maxDevices) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="cr-device-stats">
                          <span className="cr-device-pct">{pct}%</span>
                          <span className="cr-device-count">{d.count}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="cr-empty">
                  <span className="cr-empty-icon">📱</span>
                  <p>Nessun dato dispositivi</p>
                </div>
              )}
            </div>

            <div className="cr-card">
              <div className="cr-card-header">
                <h3>Aperture per città</h3>
                <span className="cr-card-badge">
                  {report.geo_stats ? `Top ${Math.min(report.geo_stats.length, 15)}` : 'N/D'}
                </span>
              </div>
              <MiniBar
                items={(report.geo_stats || []).slice(0, 15).map(g => ({
                  label: g.city || g.name,
                  value: g.count,
                }))}
                colorFn={() => 'var(--ce-success)'}
              />
            </div>

            <div className="cr-card cr-card-full">
              <div className="cr-card-header">
                <h3>Browser / Client email</h3>
              </div>
              <MiniBar
                items={(report.browser_stats || []).map(b => ({
                  label: b.name,
                  value: b.count,
                }))}
                colorFn={(i) => {
                  const colors = ['var(--ce-primary)', 'var(--ce-info)', 'var(--ce-success)', 'var(--ce-warning)', '#e74c3c', '#9b59b6']
                  return colors[i % colors.length]
                }}
              />
            </div>
          </div>
        )}

        {/* ── Clicks ── */}
        {tab === 'clicks' && (
          <div className="cr-card">
            <div className="cr-card-header">
              <h3>Click per URL</h3>
              <span className="cr-card-badge">
                {report.clicks ? `${report.clicks.length} link` : '0 link'}
              </span>
            </div>
            {report.clicks && report.clicks.length > 0 ? (
              <div className="cr-click-list">
                {report.clicks.map((click, i) => {
                  const pct = stats.clicked > 0 ? ((click.count / stats.clicked) * 100).toFixed(1) : 0
                  const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''
                  const rankLabel = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1

                  return (
                    <div key={i} className="cr-click-row" style={{ animationDelay: `${i * 0.03}s` }}>
                      <span className={`cr-click-rank ${rankClass}`}>{rankLabel}</span>
                      <div className="cr-click-url">
                        <a href={click.url} target="_blank" rel="noopener noreferrer">
                          {click.url} <ExternalLinkIcon />
                        </a>
                      </div>
                      <div className="cr-click-bar-track">
                        <div
                          className="cr-click-bar-fill"
                          style={{ width: `${(click.count / maxClicks) * 100}%` }}
                        />
                      </div>
                      <div className="cr-click-stats">
                        <span className="cr-click-count">{click.count}</span>
                        <span className="cr-click-pct">{pct}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="cr-empty">
                <span className="cr-empty-icon">🔗</span>
                <p>Nessun click registrato</p>
              </div>
            )}
          </div>
        )}

        {/* ── Audience ── */}
        {tab === 'audience' && (
          <div className="cr-card">
            <div className="cr-card-header">
              <h3>Aperture per iscritto</h3>
              <span className="cr-card-badge">
                {report.opens_by_subscriber
                  ? `${report.opens_by_subscriber.length} iscritti`
                  : '0 iscritti'}
              </span>
            </div>
            {report.opens_by_subscriber && report.opens_by_subscriber.length > 0 ? (
              <>
                <div className="cr-audience-header">
                  <span>Email</span>
                  <span>Nome</span>
                  <span>Aperture</span>
                  <span>Prima apertura</span>
                  <span>Ultima apertura</span>
                </div>
                <div className="cr-audience-list">
                  {report.opens_by_subscriber.slice(0, 100).map((sub, i) => (
                    <div key={i} className="cr-audience-row" style={{ animationDelay: `${i * 0.02}s` }}>
                      <span className="cr-audience-email">{sub.email}</span>
                      <span className="cr-audience-name">{sub.name || '—'}</span>
                      <span className="cr-audience-count">
                        <span className="cr-count-badge">{sub.open_count}</span>
                      </span>
                      <span className="cr-audience-date">
                        {sub.first_open ? formatDate(sub.first_open) : '—'}
                      </span>
                      <span className="cr-audience-date">
                        {sub.last_open ? formatDate(sub.last_open) : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="cr-empty">
                <span className="cr-empty-icon">👥</span>
                <p>Nessuna apertura registrata</p>
              </div>
            )}
          </div>
        )}

        {/* ── Preview ── */}
        {tab === 'preview' && (
          <div>
            <div className="cr-preview-toolbar">
              <span className="cr-preview-label">Anteprima email</span>
              <div className="ce-device-toggle">
                {PREVIEW_DEVICES.map(d => {
                  const Icon = d.icon
                  return (
                    <button
                      key={d.id}
                      className={`ce-device-btn${previewDevice === d.id ? ' active' : ''}`}
                      onClick={() => setPreviewDevice(d.id)}
                    >
                      <Icon /> {d.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="ce-preview-frame-container" style={{ borderRadius: '0 0 12px 12px', border: '1px solid var(--ce-border)', borderTop: 'none' }}>
              {previewDevice === 'desktop' && (
                <iframe ref={iframeRef} className="ce-preview-iframe" title="Preview Desktop" />
              )}
              {previewDevice === 'mobile' && (
                <DeviceFrame type="phone">
                  <iframe ref={iframeRef} className="ce-preview-iframe" title="Preview Mobile" />
                </DeviceFrame>
              )}
              {previewDevice === 'tablet' && (
                <DeviceFrame type="tablet">
                  <iframe ref={iframeRef} className="ce-preview-iframe" title="Preview Tablet" />
                </DeviceFrame>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
