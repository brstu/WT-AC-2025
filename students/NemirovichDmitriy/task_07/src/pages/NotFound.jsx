import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div style={{
      maxWidth: '600px',
      margin: '100px auto',
      padding: '40px',
      textAlign: 'center',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ fontSize: '72px', color: '#dc3545', marginBottom: '20px' }}>404</h1>
      <h2 style={{ marginBottom: '20px' }}>Страница не найдена</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        К сожалению, запрашиваемая вами страница не существует.
      </p>
      <Link to="/" style={{
        display: 'inline-block',
        padding: '12px 30px',
        backgroundColor: '#007bff',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px',
        fontSize: '16px'
      }}>
        Вернуться на главную
      </Link>
    </div>
  )
}

export default NotFound
