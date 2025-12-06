import React from 'react'

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-12" role="status" aria-label="Загрузка">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <span className="sr-only">Загрузка...</span>
    </div>
  )
}

export default LoadingSpinner