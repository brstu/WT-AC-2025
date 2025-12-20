'use client'

import Link from 'next/link'
import {useRouter} from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: form.get('email'),
        password: form.get('password'),
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      router.push('/dashboard/clients');
    } else {
      alert('Неверный логин или пароль')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-black max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">Вход в CRM</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input name="email" type="email" placeholder="Email" required className="w-full px-3 py-2 border rounded-md" />
            <input name="password" type="password" placeholder="Пароль" required className="w-full px-3 py-2 border rounded-md" />
          </div>
          <button type="submit" className="w-full py-3 bg-black text-white rounded-md hover:bg-gray-800">
            Войти
          </button>
          <p className="text-center text-sm">
            Нет аккаунта? <Link href="/register" className="text-blue-600 hover:underline">Зарегистрироваться</Link>
          </p>
        </form>
      </div>
    </div>
  )
}