import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()

  const handleLogin = () => {
    localStorage.setItem('token', 'fake-token') // Симуляция
    navigate('/')
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Вход</h1>
      <button
        onClick={handleLogin}
        className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700"
      >
        Войти (симуляция)
      </button>
      <p className="mt-4 text-center text-gray-600">
        Для создания и редактирования плейлистов нужно войти
      </p>
    </div>
  )
}