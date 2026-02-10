import { useState } from 'react'
import { api } from '../utils/api'
import { useApp } from '../context/AppContext'

export default function SettingsPage() {
  const { showToast } = useApp()
  const [tab, setTab] = useState('smtp')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const testSMTP = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const data = await api('/test-smtp', { method: 'POST' })
      setTestResult({ success: true, message: data.message })
      showToast('Connessione SMTP riuscita!', 'success')
    } catch (e) {
      setTestResult({ success: false, message: e.message })
      showToast(e.message, 'error')
    }
    setTesting(false)
  }

  return (
    <div>
      <div className="tabs">
        {[['smtp', '📧 SMTP'], ['info', 'ℹ️ Info']].map(([key, label]) => (
          <button key={key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {tab === 'smtp' && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 20 }}>Configurazione SMTP</div>
          <p className="text-sm text-muted" style={{ marginBottom: 20 }}>
            Le impostazioni SMTP sono configurate nel file <code style={{ background: 'var(--bg-input)', padding: '2px 6px', borderRadius: 4 }}>.env</code> sul server. 
            Modifica le variabili SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS e riavvia il server.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 20, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
            <div className="flex justify-between"><span className="text-muted">Host</span><span className="font-mono">Configurato nel .env</span></div>
            <div className="flex justify-between"><span className="text-muted">Porta</span><span className="font-mono">Configurata nel .env</span></div>
            <div className="flex justify-between"><span className="text-muted">Mittente</span><span className="font-mono">Configurato nel .env</span></div>
          </div>

          <div style={{ marginTop: 24 }}>
            <button className="btn btn-primary" onClick={testSMTP} disabled={testing}>
              {testing ? <><span className="spinner"></span> Test in corso...</> : '📧 Testa connessione SMTP'}
            </button>
            {testResult && (
              <div style={{ marginTop: 16, padding: 12, borderRadius: 'var(--radius-sm)', background: testResult.success ? 'var(--success-bg)' : 'var(--danger-bg)', color: testResult.success ? 'var(--success)' : 'var(--danger)' }}>
                {testResult.success ? '✅' : '❌'} {testResult.message}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'info' && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 20 }}>Informazioni sistema</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="flex justify-between"><span className="text-muted">Versione</span><span className="font-mono">5.0.0</span></div>
            <div className="flex justify-between"><span className="text-muted">Frontend</span><span>React 18 + Vite</span></div>
            <div className="flex justify-between"><span className="text-muted">Backend</span><span>Node.js + Express + sql.js</span></div>
            <div className="flex justify-between"><span className="text-muted">Editor</span><span>Visual Editor Pro (integrato)</span></div>
            <div className="flex justify-between"><span className="text-muted">Sanitizzazione</span><span>DOMPurify</span></div>
            <div className="flex justify-between"><span className="text-muted">Sicurezza</span><span>Helmet, Rate Limiting, JWT</span></div>
            <div className="flex justify-between"><span className="text-muted">Invio email</span><span>Coda con throttling (da .env)</span></div>
          </div>
        </div>
      )}
    </div>
  )
}
