'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Client {
  id: string
  name: string
}

interface Invoice {
  id: string
  number: string
  amount: string // Prisma Decimal приходит как строка
  status: string
  dueDate?: string
  issuedAt: string
  client: Client
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/invoices', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
      })
      .then((data) => {
        setInvoices(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-8 text-center">Загрузка...</div>
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-black text-3xl font-bold">Счета</h1>
        <Link
          href="/dashboard/invoices/new"
          className="bg-black text-white px-5 py-3 rounded-md hover:bg-gray-800"
        >
          + Новый счёт
        </Link>
      </div>

      {invoices.length === 0 ? (
        <p className="text-center text-gray-500 py-12">
          У вас пока нет счетов. Создайте первый!
        </p>
      ) : (
        <div className="grid text-black gap-6 md:grid-cols-2 lg:grid-cols-3">
          {invoices.map((invoice) => (
            <Link
              href={`/dashboard/invoices/${invoice.id}`}
              key={invoice.id}
              className="block border rounded-lg p-6 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold mb-2">
                Счёт № {invoice.number}
              </h3>
              <p className="text-gray-600">
                Клиент: {invoice.client?.name || '—'}
              </p>
              <p className="text-gray-600">
                Сумма: {invoice.amount} ₽
              </p>
              <p className="text-gray-600">
                Статус: {invoice.status}
              </p>
              {invoice.dueDate && (
                <p className="text-gray-500 text-sm">
                  Оплатить до: {new Date(invoice.dueDate).toLocaleDateString()}
                </p>
              )}
              <p className="text-gray-500 text-sm">
                Выставлен: {new Date(invoice.issuedAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
