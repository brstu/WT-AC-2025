"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewInvoicePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    number: "",
    amount: "",
    dueDate: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          number: form.number,
          amount: form.amount,
          dueDate: form.dueDate ? new Date(form.dueDate) : null,
          clientEmail: form.email,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to create invoice");
        return;
      }

      router.push("/dashboard/invoices")
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="text-black max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Создать новый счёт</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Номер *</label>
          <input
            type="text"
            required
            value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value })}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Сумма *</label>
          <input
            type="number"
            step="0.01"
            required
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Дата оплаты</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email клиента *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
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
