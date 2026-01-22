import React from 'react'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div style={{
      textAlign: 'center',
      marginTop: '100px',
      padding: '20px'
    }}>
      <h1 style={{
        fontSize: '72px',
        margin: '0',
        color: '#333'
      }}>404</h1>
      <h2 style={{
        fontSize: '32px',
        margin: '20px 0',
        color: '#666'
      }}>Страница не найдена</h2>
      <p style={{
        fontSize: '18px',
        color: '#888',
        marginBottom: '30px'
      }}>
        К сожалению, запрашиваемая страница не существует
      </p>
      <Link to="/" style={{
        display: 'inline-block',
        padding: '12px 30px',
        backgroundColor: '#2196F3',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px',
        fontSize: '16px'
      }}>
        Вернуться на главную
      </Link>
    </div>
  )
}

export default NotFound
