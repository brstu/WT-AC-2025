import React from 'react'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div style={{textAlign: 'center', marginTop: '50px'}}>
      <h1>404</h1>
      <p>Страница не найдена</p>
      <Link to="/">
        <button>На главную</button>
      </Link>
    </div>
  )
}

export default NotFound
