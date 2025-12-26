import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// Те же данные, что и в MemeDetail
const allMockMemes = [
  {
    id: '1',
    title: 'Программист и кофе',
    imageUrl: 'https://i.imgflip.com/1bij.jpg',
    description: 'Когда после 5 часов отладки находишь одну пропущенную точку с запятой',
    likes: 156,
    tags: ['программирование', 'юмор', 'кофе'],
    author: 'DevMaster',
    createdAt: '2024-01-15',
    canEdit: false
  },
  {
    id: '2',
    title: 'Понедельник у программиста',
    imageUrl: 'https://i.imgflip.com/1bgw.jpg',
    description: 'Начало недели и первая задача дня',
    likes: 89,
    tags: ['понедельник', 'работа', 'it'],
    author: 'CodeLover',
    createdAt: '2024-01-14',
    canEdit: false
  },
  {
    id: '3',
    title: 'React vs Angular',
    imageUrl: 'https://i.imgflip.com/345v97.jpg',
    description: 'Вечный спор фронтенд-разработчиков',
    likes: 234,
    tags: ['react', 'angular', 'javascript'],
    author: 'FrontendPro',
    createdAt: '2024-01-13',
    canEdit: false
  },
  {
    id: '4',
    title: 'Когда работает код',
    imageUrl: 'https://i.imgflip.com/30b1gx.jpg',
    description: 'Чувство, когда код заработал с первого раза',
    likes: 312,
    tags: ['успех', 'радость', 'код'],
    author: 'HappyCoder',
    createdAt: '2024-01-12',
    canEdit: false
  },
  {
    id: '5',
    title: 'Дедлайн близко',
    imageUrl: 'https://i.imgflip.com/1otk96.jpg',
    description: 'За день до сдачи проекта',
    likes: 187,
    tags: ['дедлайн', 'стресс', 'работа'],
    author: 'ProjectManager',
    createdAt: '2024-01-11',
    canEdit: false
  }
]

const MemeCard = ({ meme, isLoggedIn, onLike }) => {
  const [likes, setLikes] = useState(meme.likes)
  const [isLiked, setIsLiked] = useState(false)

  const handleLike = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isLoggedIn) {
      alert('Войдите, чтобы ставить лайки!')
      return
    }
    
    if (!isLiked) {
      const newLikes = likes + 1
      setLikes(newLikes)
      setIsLiked(true)
      onLike(meme.id, newLikes)
    }
  }

  return (
    <Link to={`/memes/${meme.id}`} className="card meme-card">
      <img 
        src={meme.imageUrl} 
        alt={meme.title}
        className="meme-image"
        loading="lazy"
      />
      <div className="meme-content">
        <h3 className="meme-title">{meme.title}</h3>
        <p className="meme-description">{meme.description}</p>
        
        <div className="meme-tags">
          {meme.tags.map(tag => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>
        
        <div className="meme-footer">
          <div className="author">👤 {meme.author}</div>
          <button 
            onClick={handleLike}
            className={`like-btn ${isLiked ? 'liked' : ''}`}
          >
            <span>❤️</span>
            <span className="like-count">{likes}</span>
          </button>
        </div>
      </div>
    </Link>
  )
}

const MemeList = ({ isLoggedIn }) => {
  const [memes, setMemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    // Имитация загрузки данных
    setTimeout(() => {
      setMemes(allMockMemes.map(meme => ({
        ...meme,
        canEdit: isLoggedIn
      })))
      setLoading(false)
    }, 800)
  }, [isLoggedIn])

  const handleLike = (memeId, newLikes) => {
    setMemes(prevMemes => 
      prevMemes.map(meme => 
        meme.id === memeId ? { ...meme, likes: newLikes } : meme
      )
    )
  }

  const filteredMemes = memes.filter(meme =>
    meme.title.toLowerCase().includes(search.toLowerCase()) ||
    meme.description.toLowerCase().includes(search.toLowerCase()) ||
    meme.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())) ||
    meme.author.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="loading">
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <p>Загружаем мемы...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="search-container">
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--dark)' }}>
          Каталог мемов
        </h1>
        <p style={{ color: 'var(--gray)', marginBottom: '1.5rem' }}>
          {!isLoggedIn ? 'Войдите, чтобы создавать мемы и ставить лайки' : 'Находите самые смешные мемы'}
        </p>
        
        <input
          type="text"
          placeholder="Поиск мемов по названию, описанию или тегам..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <div className="stats">
            Найдено мемов: {filteredMemes.length}
          </div>
          {isLoggedIn ? (
            <Link to="/memes/new" className="btn btn-primary">
              + Создать мем
            </Link>
          ) : (
            <Link to="/" className="btn btn-secondary">
              🔓 Войти для создания
            </Link>
          )}
        </div>
      </div>

      {filteredMemes.length === 0 ? (
        <div className="error">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😕</div>
          <h2>Мемы не найдены</h2>
          <p style={{ marginBottom: '2rem' }}>
            {search ? 'Попробуйте изменить поисковый запрос' : 'Пока нет мемов'}
          </p>
          {isLoggedIn && (
            <Link to="/memes/new" className="btn btn-primary">
              Создать первый мем
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-3">
          {filteredMemes.map(meme => (
            <MemeCard 
              key={meme.id} 
              meme={meme} 
              isLoggedIn={isLoggedIn}
              onLike={handleLike}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default MemeList