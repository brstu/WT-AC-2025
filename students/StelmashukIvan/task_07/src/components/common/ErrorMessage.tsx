import React from 'react'

interface ErrorMessageProps {
  message: string
  retry?: () => void
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, retry }) => {
  return (
    <div className="text-center py-12">
      <div className="text-red-600 mb-4">{message}</div>
      {retry && (
        <button
          onClick={retry}
          className="btn-primary"
        >
          Попробовать снова
        </button>
      )}
    </div>
  )
}

export default ErrorMessage