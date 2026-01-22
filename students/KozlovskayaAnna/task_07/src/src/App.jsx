import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import PostsList from './pages/PostsList'
import PostDetail from './pages/PostDetail'
import CreatePost from './pages/CreatePost'
import EditPost from './pages/EditPost'
import NotFound from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
        <header style={{background: '#333', color: 'white', padding: '20px'}}>
          <div style={{maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h1 style={{margin: 0, fontSize: '24px'}}>Блог-платформа</h1>
            <nav>
              <Link to="/" style={{color: 'white', marginRight: '20px'}}>Главная</Link>
              <Link to="/create" style={{color: 'white'}}>Создать пост</Link>
            </nav>
          </div>
        </header>
        
        <main style={{flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '20px', width: '100%'}}>
          <Routes>
            <Route path="/" element={<PostsList />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/edit/:id" element={<EditPost />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        <footer style={{background: '#333', color: 'white', padding: '20px', textAlign: 'center'}}>
          <p style={{margin: 0}}>© 2025 Блог-платформа</p>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
