import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '100px 20px'
    }}>
      <h1 style={{fontSize: '72px', margin: '0 0 20px 0', color: '#dc3545'}}>404</h1>
      <h2 style={{marginBottom: '20px'}}>Страница не найдена</h2>
      <p style={{marginBottom: '30px', color: '#666'}}>
        К сожалению, запрашиваемая страница не существует
      </p>
      <Link to="/">
        <button style={{
          padding: '12px 24px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px'
        }}>
          Вернуться на главную
        </button>
      </Link>
    </div>
  )
}

export default NotFound
