'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {Client} from "@/types/types";


export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/clients', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setClients(data); setLoading(false) })
  }, []);

  if (loading) return <div className="p-8 text-center">Загрузка...</div>

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-black text-3xl font-bold">Клиенты</h1>
        <Link href="/dashboard/clients/new" className="bg-black text-white px-5 py-3 rounded-md hover:bg-gray-800">
          + Новый клиент
        </Link>
      </div>

      {clients.length === 0 ? (
        <p className="text-center text-gray-500 py-12">У вас пока нет клиентов. Создайте первого!</p>
      ) : (
        <div className="grid text-black gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clients.map(client => (
            <Link href={`/dashboard/clients/${client.id}`} key={client.id} className="block border rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">{client.name}</h3>
              {client.email && <p className="text-gray-600">{client.email}</p>}
              {client.phone && <p className="text-gray-600">{client.phone}</p>}
              {client.comments.length > 0 && (
                <div className="mt-4 text-sm text-gray-500">
                  Последний комментарий: {client.comments[0].text.substring(0, 50)}...
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}