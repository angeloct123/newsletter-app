import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts'
import { api, formatDate, calcRate } from '../utils/api'
import { useApp } from '../context/AppContext'

export default function Dashboard() {
  const { navigate, showToast } = useApp()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // FIX: Use ref to track interval, ensuring deterministic cleanup
  const intervalRef = useRef(null)

  const fetchStats = useCallback(() => {
    return api('/stats').then(setStats).catch(() => {})
  }, [])

  // Initial load
  useEffect(() => {
    api('/stats').then(setStats)
      .catch(e => showToast(e.message, 'error'))
      .finally(() => setLoading(false))
  }, [showToast])

  // FIX: Auto-refresh when campaigns are sending — deterministic cleanup
  useEffect(() => {
    // Always clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Only start polling if there are campaigns being sent
    if (stats?.sendingCampaigns?.length > 0) {
      intervalRef.current = setInterval(fetchStats, 10000)
    }

    // Cleanup on unmount or when deps change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [stats?.sendingCampaigns?.length, fetchStats])

  const chartData = useMemo(() => {
    if (!stats?.recentCampaigns) return []
    return stats.recentCampaigns.slice(0, 6).reverse()
  }, [stats])

  if (loading) return (
    <div className="loading-spinner">Caricamento dashboard...</div>
  )

  if (!stats) return (
    <div className="empty-state">Impossibile caricare le statistiche</div>
  )

  return (
    <div className="dashboard">
      {/* Stat cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">📧</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalCampaigns || 0}</div>
            <div className="stat-label">Campagne</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalSubscribers || 0}</div>
            <div className="stat-label">Iscritti</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📤</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalSent || 0}</div>
            <div className="stat-label">Email inviate</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-info">
            <div className="stat-value">{calcRate(stats.totalOpened, stats.totalSent)}%</div>
            <div className="stat-label">Tasso apertura</div>
          </div>
        </div>
      </div>

      {/* Sending campaigns (live) */}
      {stats.sendingCampaigns?.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3>🔄 Invio in corso</h3>
          </div>
          <div className="card-body">
            {stats.sendingCampaigns.map(sc => (
              <div key={sc.id} className="sending-campaign">
                <strong>{sc.name}</strong>
                <div className="progress-bar">
                  <div className="progress-fill"
                    style={{ width: `${sc.queue_total ? ((sc.queue_sent || 0) / sc.queue_total * 100) : 0}%` }}
                  />
                </div>
                <small>
                  ✅ {sc.queue_sent || 0} · ⏳ {sc.queue_pending || 0} · ❌ {sc.queue_failed || 0}
                </small>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3>📊 Campagne recenti</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  cursor={{ fill: 'var(--bg-elevated)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="total_sent" name="Inviate" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="total_opened" name="Aperte" fill="var(--success)" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="total_clicked" name="Click" fill="var(--warning)" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent campaigns table */}
      {stats.recentCampaigns?.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>📋 Ultime campagne</h3>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Campagna</th>
                    <th>Data</th>
                    <th>Inviate</th>
                    <th>Aperture</th>
                    <th>Tasso</th>
                    <th>Click</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentCampaigns.map(c => (
                    <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => navigate('campaign-report', { id: c.id })}>
                      <td><strong>{c.name}</strong></td>
                      <td>{formatDate(c.sent_at)}</td>
                      <td>{c.total_sent}</td>
                      <td>{c.total_opened}</td>
                      <td>{calcRate(c.total_opened, c.total_sent)}%</td>
                      <td>{c.total_clicked}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
