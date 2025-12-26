export function Spinner({ label = 'Загрузка…' }) {
  return (
    <div className="center">
      <div className="spinner" />
      <div className="muted">{label}</div>
    </div>
  )
}