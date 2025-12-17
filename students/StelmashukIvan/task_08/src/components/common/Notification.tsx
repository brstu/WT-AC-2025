import React, { useEffect } from 'react'
import clsx from 'clsx'
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

interface NotificationProps {
  type: NotificationType
  title: string
  message?: string
  onClose: () => void
  duration?: number
}

const Notification: React.FC<NotificationProps> = ({ 
  type, 
  title, 
  message, 
  onClose, 
  duration = 5000 
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const typeConfig = {
    success: {
      icon: CheckCircleIcon,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
    },
    error: {
      icon: ExclamationCircleIcon,
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
    },
    info: {
      icon: InformationCircleIcon,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
    },
    warning: {
      icon: ExclamationCircleIcon,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
    },
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div className={clsx(
      'fixed top-4 right-4 z-50 max-w-md w-full rounded-lg border shadow-lg',
      config.bgColor,
      config.borderColor,
      'transform transition-all duration-300 ease-in-out'
    )}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={clsx('h-6 w-6', config.iconColor)} aria-hidden="true" />
          </div>
          
          <div className="ml-3 w-0 flex-1">
            <p className={clsx('text-sm font-medium', config.textColor)}>
              {title}
            </p>
            
            {message && (
              <p className={clsx('mt-1 text-sm', config.textColor)}>
                {message}
              </p>
            )}
          </div>
          
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className={clsx(
                'inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2',
                config.textColor,
                'focus:ring-offset-green-50 focus:ring-green-600'
              )}
              onClick={onClose}
            >
              <span className="sr-only">Закрыть</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notification