import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Notification from './Notification'

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Notification />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout