import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div style={{padding: '20px', textAlign: 'center'}}>
      <h1>404</h1>
      <h2>Страница не найдена</h2>
      <p>К сожалению, запрашиваемая страница не существует.</p>
      <Link to="/">Вернуться на главную</Link>
    </div>
  )
}

export default NotFound
