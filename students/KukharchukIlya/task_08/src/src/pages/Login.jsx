import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Login.css'

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const from = location.state?.from?.pathname || '/'

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
      login({
        id: 1,
        name: 'Администратор',
        email: credentials.email
      })
      navigate(from, { replace: true })
    } else {
      setError('Неверный email или пароль. Используйте admin@example.com / password')
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Вход в систему</h1>
        <p>Для управления играми требуется авторизация</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              className="form-control"
              placeholder="Введите ваш email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="form-control"
              placeholder="Введите ваш пароль"
              required
            />
          </div>

          {/*  ИЗМЕНЁННАЯ КНОПКА ВОЙТИ */}
          <button type="submit" className="btn-login login-btn">
            Войти
          </button>
        </form>

        <div className="demo-credentials">
          <h3>Демо доступ:</h3>
          <p><strong>Email:</strong> admin@example.com</p>
          <p><strong>Пароль:</strong> password</p>
        </div>
      </div>
    </div>
  )
}

export default Login
