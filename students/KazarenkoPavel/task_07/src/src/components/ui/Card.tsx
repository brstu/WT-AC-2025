import React from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={clsx('bg-white rounded-lg shadow-md overflow-hidden', className)}>
    {children}
  </div>
)

export const CardHeader: React.FC<CardProps> = ({ children, className }) => (
  <div className={clsx('px-6 py-4 border-b', className)}>
    {children}
  </div>
)

export const CardBody: React.FC<CardProps> = ({ children, className }) => (
  <div className={clsx('p-6', className)}>
    {children}
  </div>
)

export const CardFooter: React.FC<CardProps> = ({ children, className }) => (
  <div className={clsx('px-6 py-4 border-t bg-gray-50', className)}>
    {children}
  </div>
)
