import { useApp } from '../context/AppContext'

/* ============================================================
   Sidebar v2.0 — Modern Navigation
   - Logo header con branding
   - SVG icons coerenti (no emoji)
   - Active indicator a barra laterale con glow
   - Hover micro-interazioni
   - Glassmorphism mobile overlay
   - Tooltip-ready structure
   ============================================================ */

const NAV_ITEMS = [
  { section: 'Principale' },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: 'campaigns',
    label: 'Campagne',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 7l-10 7L2 7" />
      </svg>
    ),
  },
  {
    id: 'new-campaign',
    label: 'Nuova campagna',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    accent: true,
  },
  { section: 'Gestione' },
  {
    id: 'subscribers',
    label: 'Iscritti',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Impostazioni',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const { page, navigate, logout, sidebarOpen, setSidebarOpen } = useApp()

  return (
    <>
      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${sidebarOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Menu principale"
      >
        {/* ── Logo Header ── */}
        <div className="sidebar-header">
          <div className="sidebar-logo" onClick={() => navigate('dashboard')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">Y</div>
            <div>
              <div className="logo-text">YPAMAR</div>
              <div className="logo-sub">Newsletter</div>
            </div>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item, i) =>
            item.section ? (
              <div key={`s-${i}`} className="nav-section-title">
                {item.section}
              </div>
            ) : (
              <button
                key={item.id}
                className={`nav-item${page === item.id ? ' active' : ''}${item.accent ? ' nav-item-accent' : ''}`}
                onClick={() => {
                  navigate(item.id)
                  setSidebarOpen(false)
                }}
                aria-current={page === item.id ? 'page' : undefined}
              >
                {/* Active indicator bar */}
                {page === item.id && <span className="nav-active-indicator" aria-hidden="true" />}
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            )
          )}
        </nav>

        {/* ── Footer ── */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout} title="Esci dall'account">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Esci</span>
          </button>
        </div>
      </aside>
    </>
  )
}
