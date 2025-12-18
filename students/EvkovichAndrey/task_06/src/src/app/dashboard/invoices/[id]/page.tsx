'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  email?: string
}

interface Invoice {
  id: string
  number: string
  amount: string
  status: string
  dueDate?: string
  issuedAt: string
  client: Client
}

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const {id} = React.use(params);

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/invoices/${id}`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
      })
      .then((data) => {
        setInvoice(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  if (loading) return <div className="p-8 text-center">Загрузка...</div>
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>
  if (!invoice) return <div className="p-8 text-center">Счёт не найден</div>

  return (
    <div className="max-w-3xl mx-auto p-8 text-black">
      <h1 className="text-3xl font-bold mb-6">Счёт № {invoice.number}</h1>

      <div className="space-y-4 border rounded-lg p-6 shadow-sm">
        <p><span className="font-medium">Сумма:</span> {invoice.amount} ₽</p>
        <p><span className="font-medium">Статус:</span> {invoice.status}</p>
        <p><span className="font-medium">Выставлен:</span> {new Date(invoice.issuedAt).toLocaleDateString()}</p>
        {invoice.dueDate && (
          <p><span className="font-medium">Оплатить до:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
        )}
        <p>
          <span className="font-medium">Клиент:</span>{" "}
          <Link href={`/dashboard/clients/${invoice.client.id}`} className="text-blue-600 hover:underline">
            {invoice.client.name} ({invoice.client.email})
          </Link>
        </p>
      </div>

      <div className="mt-6">
        <Link
          href="/dashboard/invoices"
          className="inline-block bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          ← Назад к списку счетов
        </Link>
      </div>
    </div>
  )
}
