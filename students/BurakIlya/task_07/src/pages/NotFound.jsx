import { Link } from 'react-router-dom'

// Плохой код: простая страница 404 без особых изысков
function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h1 style={{ fontSize: '72px', margin: '0', color: '#333' }}>404</h1>
      <h2 style={{ fontSize: '32px', marginTop: '10px', color: '#666' }}>Страница не найдена</h2>
      <p style={{ fontSize: '18px', color: '#999', marginTop: '20px' }}>
        К сожалению, запрашиваемая страница не существует
      </p>
      <Link 
        to="/"
        style={{ display: 'inline-block', marginTop: '30px', backgroundColor: '#2196F3', color: 'white', padding: '12px 24px', borderRadius: '4px', textDecoration: 'none' }}
      >
        Вернуться на главную
      </Link>
    </div>
  )
}

export default NotFound
