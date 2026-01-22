import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { login } from '../app/auth/authSlice'
import { useToast } from '../app/toast/ToastProvider'

export function Login() {
  const [name, setName] = useState('Student')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  const from = location.state?.from || '/programs'

  const onSubmit = (e) => {
    e.preventDefault()
    dispatch(login({ name }))
    toast.push('Вход выполнен', 'success')
    navigate(from, { replace: true })
  }

  return (
    <div className="stack">
      <h1 style={{ margin: 0 }}>Вход</h1>
      <div className="card">
        <form className="stack" onSubmit={onSubmit}>
          <label className="field">
            <div className="label">Имя</div>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <button className="btn" type="submit">
            Войти
          </button>
          <div className="muted">
            Это учебный логин (без сервера): хранит флаг в localStorage, чтобы показать protected routes.
          </div>
        </form>
      </div>
    </div>
  )
}