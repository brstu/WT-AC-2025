"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewClientPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create client");
        return
      }

      // после успешного создания — редирект на список клиентов
      router.push("/dashboard/clients");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg text-black mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Создать нового клиента</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Имя *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Телефон</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Адрес</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Создание..." : "Создать"}
        </button>
      </form>
    </div>
  )
}
