import React from 'react'

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-blue-600 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
        <span className="block mt-4 text-gray-600">Loading...</span>
      </div>
    </div>
  )
}

export default LoadingSpinner