import { useApp } from '../context/AppContext'

export default function ToastContainer() {
  const { toasts, removeToast } = useApp()
  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast toast-${t.type}`}
          onClick={() => removeToast(t.id)}
          role="alert"
        >
          <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span> {t.message}
        </div>
      ))}
    </div>
  )
}
