import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import PetList from './pages/PetList'
import PetDetail from './pages/PetDetail'
import AddPet from './pages/AddPet'
import EditPet from './pages/EditPet'
import NotFound from './pages/NotFound'

function App() {
  var [user, setUser] = useState(null)

  useEffect(() => {
    var savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(savedUser)
    }
  }, [])

  var handleLogin = () => {
    var username = prompt('Введите имя пользователя:')
    if (username) {
      localStorage.setItem('user', username)
      setUser(username)
    }
  }

  var handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <BrowserRouter>
      <div style={{minHeight: '100vh'}}>
        <div style={{
          backgroundColor: '#333',
          color: 'white',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h1 style={{margin: 0}}>Приют для животных</h1>
            <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
              <Link to="/" style={{color: 'white', textDecoration: 'none'}}>Главная</Link>
              {user && <Link to="/add" style={{color: 'white', textDecoration: 'none'}}>Добавить питомца</Link>}
              {user ? (
                <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                  <span>Привет, {user}!</span>
                  <button onClick={handleLogout} style={{
                    padding: '5px 10px',
                    backgroundColor: '#555',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer'
                  }}>Выйти</button>
                </div>
              ) : (
                <button onClick={handleLogin} style={{
                  padding: '5px 10px',
                  backgroundColor: '#555',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}>Войти</button>
              )}
            </div>
          </div>
        </div>
        
        <Routes>
          <Route path="/" element={<PetList user={user} />} />
          <Route path="/pet/:id" element={<PetDetail user={user} />} />
          <Route path="/add" element={user ? <AddPet /> : <div style={{textAlign: 'center', marginTop: '50px'}}>Пожалуйста, войдите в систему</div>} />
          <Route path="/edit/:id" element={user ? <EditPet /> : <div style={{textAlign: 'center', marginTop: '50px'}}>Пожалуйста, войдите в систему</div>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
