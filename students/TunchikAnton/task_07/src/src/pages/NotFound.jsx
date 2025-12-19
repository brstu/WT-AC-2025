import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="not-found">
      <h1>404 - Страница не найдена</h1>
      <p>Извините, запрашиваемая страница не существует.</p>
      <Link to="/" className="btn btn-primary">
        Вернуться на главную
      </Link>
    </div>
  )
}

export default NotFound