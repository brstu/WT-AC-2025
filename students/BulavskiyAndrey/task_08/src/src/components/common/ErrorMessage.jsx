import './ErrorMessage.css'

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3>Произошла ошибка</h3>
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          Попробовать снова
        </button>
      )}
    </div>
  )
}

export default ErrorMessage