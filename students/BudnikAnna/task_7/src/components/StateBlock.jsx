export function StateBlock({ title, text, action }) {
  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p className="muted">{text}</p>
      {action ? <div style={{ marginTop: 12 }}>{action}</div> : null}
    </div>
  )
}