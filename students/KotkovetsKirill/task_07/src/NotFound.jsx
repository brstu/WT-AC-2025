import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1 style={{ fontSize: '72px', color: '#666' }}>404</h1>
      <h2>Страница не найдена</h2>
      <p style={{ marginTop: '20px' }}>
        Извините, запрашиваемая страница не существует.
      </p>
      <Link to="/">
        <button style={{ marginTop: '30px' }}>
          Вернуться на главную
        </button>
      </Link>
    </div>
  )
}

export default NotFound
