'use client'

import React, { useEffect, useState } from 'react'
import Link from "next/link";
import {Client, Comment} from "@/types/types";

export default function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const [client, setClient] = useState<Client | null>(null);
  const [comment, setComment] = useState('');
  const {id} = React.use(params);

  useEffect(() => {
    fetch(`/api/clients/${id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(setClient)
  }, [id])

  const addComment = async () => {
    await fetch(`/api/clients/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: comment }),
      credentials: 'include',
    })
    setComment('')
    // обновляем клиента
    fetch(`/api/clients/${id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(setClient)
  }

  if (!client) return <div>Загрузка...</div>

  return (
    <div className="text-black max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">{client.name}</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <p><strong>Email:</strong> {client.email || '—'}</p>
          <p><strong>Телефон:</strong> {client.phone || '—'}</p>
          <p><strong>Адрес:</strong> {client.address || '—'}</p>
        </div>
        <div>
          <h3 className="text-xl font-medium mb-4">Комментарии</h3>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Написать комментарий..."
            className="w-full border rounded-md p-3 mb-3"
          />
          <button onClick={addComment} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
            Добавить
          </button>

          <div className="mt-6 space-y-3">
            {client.comments && (
              client.comments.map((c: Comment) => (
                  <div key={c.id} className="border-l-4 border-gray-300 pl-4">
                    <p className="text-sm text-gray-600">{c.author.name} — {new Date(c.createdAt).toLocaleString()}</p>
                    <p>{c.text}</p>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/dashboard/clients"
          className="inline-block bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          ← Назад к списку клиентов
        </Link>
      </div>
    </div>
  )
}