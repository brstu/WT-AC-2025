'use client'
import Link from 'next/link'
import {useRouter} from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        password: form.get('password'),
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      router.push('/dashboard/clients');
    } else {
      alert('Ошибка регистрации')
    }
  }

  return (
    <div className="text-black min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-black max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">Создать аккаунт</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className=" space-y-4">
            <input name="name" placeholder="Имя" required className="w-full px-3 py-2 border rounded-md" />
            <input name="email" type="email" placeholder="Email" required className="w-full px-3 py-2 border rounded-md" />
            <input name="password" type="password" placeholder="Пароль" required minLength={6} className="w-full px-3 py-2 border rounded-md" />
          </div>
          <button type="submit" className="w-full py-3 bg-black text-white rounded-md hover:bg-gray-800">
            Зарегистрироваться
          </button>
          <p className="text-center text-sm">
            Уже есть аккаунт? <Link href="/login" className="text-blue-600 hover:underline">Войти</Link>
          </p>
        </form>
      </div>
    </div>
  )
}