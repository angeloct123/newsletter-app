import { useApp } from './context/AppContext'
import LoginPage from './components/LoginPage'
import Sidebar from './components/Sidebar'
import ToastContainer from './components/ToastContainer'
import Dashboard from './components/Dashboard'
import CampaignsPage from './components/CampaignsPage'
import CampaignEditor from './components/CampaignEditor'
import CampaignReport from './components/CampaignReport'
import SubscribersPage from './components/SubscribersPage'
import SettingsPage from './components/SettingsPage'

const PAGE_TITLES = {
  dashboard: { title: 'Dashboard', sub: 'Panoramica newsletter' },
  campaigns: { title: 'Campagne', sub: 'Gestisci le tue campagne' },
  'new-campaign': { title: 'Nuova campagna', sub: 'Crea una nuova campagna' },
  'edit-campaign': { title: 'Modifica campagna', sub: 'Modifica campagna esistente' },
  'campaign-report': { title: 'Report campagna', sub: 'Analisi dettagliata' },
  subscribers: { title: 'Iscritti', sub: 'Gestisci la tua mailing list' },
  settings: { title: 'Impostazioni', sub: 'Configura il sistema' },
}

function PageContent() {
  const { page, pageData } = useApp()
  switch (page) {
    case 'dashboard': return <Dashboard />
    case 'campaigns': return <CampaignsPage />
    case 'new-campaign': return <CampaignEditor />
    case 'edit-campaign': return <CampaignEditor campaignId={pageData} />
    case 'campaign-report': return <CampaignReport campaignId={pageData} />
    case 'subscribers': return <SubscribersPage />
    case 'settings': return <SettingsPage />
    default: return <Dashboard />
  }
}

export default function App() {
  const { user, page, sidebarOpen, setSidebarOpen } = useApp()

  if (!user) return <><ToastContainer /><LoginPage /></>

  const pageInfo = PAGE_TITLES[page] || PAGE_TITLES.dashboard

  return (
    <>
      <ToastContainer />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content" id="main-content">
          <header className="top-bar">
            <div>
              <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">☰</button>
              <h1 className="page-title">{pageInfo.title}</h1>
              <p className="page-subtitle">{pageInfo.sub}</p>
            </div>
          </header>
          <div className="page-content">
            <PageContent />
          </div>
        </main>
      </div>
    </>
  )
}
