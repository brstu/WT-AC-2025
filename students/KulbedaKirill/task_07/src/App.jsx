import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import List from './pages/List'
import Detail from './pages/Detail'
import New from './pages/New'
import Edit from './pages/Edit'
import NotFound from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <div style={{fontFamily: 'Arial, sans-serif'}}>
        <div style={{background: '#333', color: 'white', padding: '15px'}}>
          <h1 style={{margin: 0, display: 'inline'}}>Каталог гаджетов</h1>
          <div style={{display: 'inline-block', marginLeft: '30px'}}>
            <Link to="/" style={{color: 'white', marginRight: '15px', textDecoration: 'none'}}>Главная</Link>
            <Link to="/list" style={{color: 'white', marginRight: '15px', textDecoration: 'none'}}>Список</Link>
            <Link to="/new" style={{color: 'white', textDecoration: 'none'}}>Добавить</Link>
          </div>
        </div>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/list" element={<List />} />
          <Route path="/detail/:id" element={<Detail />} />
          <Route path="/new" element={<New />} />
          <Route path="/edit/:id" element={<Edit />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
