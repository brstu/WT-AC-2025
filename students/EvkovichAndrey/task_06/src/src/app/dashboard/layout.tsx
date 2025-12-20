// app/dashboard/layout.tsx
'use client';

import Link from 'next/link'
import { LogOut } from 'lucide-react'

export default function DashboardLayout({
                                          children,
                                        }: {
  children: React.ReactNode
}) {
  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <nav className="flex space-x-8">
              <Link href="/dashboard/clients" className="text-gray-900 font-medium hover:text-black">Клиенты</Link>
              <Link href="/dashboard/invoices" className="text-gray-500 hover:text-black">Счета</Link>
            </nav>
            <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-black">
              <LogOut className="w-4 h-4" /> Выйти
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}