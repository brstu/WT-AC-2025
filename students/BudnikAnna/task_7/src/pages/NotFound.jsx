import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="card">
      <h1 style={{ marginTop: 0 }}>404</h1>
      <p className="muted">Страница не найдена.</p>
      <Link className="btn" to="/programs">
        На главную
      </Link>
    </div>
  )
}