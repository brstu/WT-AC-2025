import React from 'react'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div style={{textAlign: 'center', padding: '50px'}}>
      <h1 style={{fontSize: '72px', color: '#999'}}>404</h1>
      <h2>Страница не найдена</h2>
      <p style={{color: '#666', marginTop: '20px'}}>
        Запрашиваемая страница не существует
      </p>
      <Link to="/" style={{display: 'inline-block', marginTop: '30px', padding: '10px 20px', backgroundColor: '#333', color: 'white', textDecoration: 'none', borderRadius: '4px'}}>
        Вернуться на главную
      </Link>
    </div>
  )
}

export default NotFound
