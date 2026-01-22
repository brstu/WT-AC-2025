import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div style={{padding: '20px', textAlign: 'center', marginTop: '100px'}}>
      <h1 style={{fontSize: '72px', color: '#e74c3c', margin: '0'}}>404</h1>
      <h2 style={{fontSize: '32px', color: '#333'}}>Страница не найдена</h2>
      <p style={{fontSize: '18px', color: '#666', marginTop: '20px'}}>Упс! Страница, которую вы ищете, не существует.</p>
      <Link to="/" style={{display: 'inline-block', marginTop: '30px', padding: '10px 20px', background: '#3498db', color: 'white', textDecoration: 'none', borderRadius: '5px'}}>
        Вернуться на главную
      </Link>
    </div>
  )
}

export default NotFound
