import { Link } from 'react-router-dom'

function Nav() {
  return (
    <div style={{background: '#333', color: 'white', padding: '20px'}}>
      <h1 style={{margin: '0 0 10px 0'}}>Галерея Артов</h1>
      <div>
        <Link to="/" style={{color: 'white', marginRight: '15px'}}>Главная</Link>
        <Link to="/new" style={{color: 'white'}}>Добавить арт</Link>
      </div>
    </div>
  )
}

export default Nav
