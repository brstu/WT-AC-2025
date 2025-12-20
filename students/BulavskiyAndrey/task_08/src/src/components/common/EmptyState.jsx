const EmptyState = ({ title = "Пусто", description = "" }) => {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <h2 style={{ marginBottom: "10px", opacity: 0.8 }}>{title}</h2>
      {description && (
        <p style={{ opacity: 0.6 }}>{description}</p>
      )}
    </div>
  )
}

export default EmptyState
