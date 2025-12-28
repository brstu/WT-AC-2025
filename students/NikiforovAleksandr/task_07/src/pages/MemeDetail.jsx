import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

// Все моковые мемы в одном месте
const allMockMemes = [
  {
    id: '1',
    title: 'Программист и кофе',
    imageUrl: 'https://i.imgflip.com/1bij.jpg',
    description: 'Когда после 5 часов отладки находишь одну пропущенную точку с запятой. Это чувство не передать словами! Все эти часы поиска ошибки, десятки проверок кода, и вот она - та самая точка с запятой, которая стоила тебе полдня работы. Смех сквозь слёзы...',
    likes: 156,
    tags: ['программирование', 'юмор', 'кофе', 'отладка', 'ошибки'],
    author: 'DevMaster',
    createdAt: '15 января 2024',
    views: 1245,
    comments: 23
  },
  {
    id: '2',
    title: 'Понедельник у программиста',
    imageUrl: 'https://i.imgflip.com/1bgw.jpg',
    description: 'Начало недели и первая задача дня. Понедельник утро - время для новых свершений. Но иногда так тяжело начать, особенно после выходных. Кофе льётся рекой, код пишется медленно, а глаза всё ещё хотят спать.',
    likes: 89,
    tags: ['понедельник', 'работа', 'it', 'утро', 'кофе'],
    author: 'CodeLover',
    createdAt: '14 января 2024',
    views: 876,
    comments: 15
  },
  {
    id: '3',
    title: 'React vs Angular',
    imageUrl: 'https://i.imgflip.com/345v97.jpg',
    description: 'Вечный спор фронтенд-разработчиков. Что лучше: React или Angular? Каждый разработчик имеет своё мнение, но правда где-то посередине. Оба фреймворка имеют свои преимущества и недостатки.',
    likes: 234,
    tags: ['react', 'angular', 'javascript', 'фронтенд', 'спор'],
    author: 'FrontendPro',
    createdAt: '13 января 2024',
    views: 1567,
    comments: 47
  },
  {
    id: '4',
    title: 'Когда работает код',
    imageUrl: 'https://i.imgflip.com/30b1gx.jpg',
    description: 'Чувство, когда код заработал с первого раза. Такое редкое и прекрасное ощущение! Обычно приходится дебажить часами, но иногда всё идёт по плану. В такие моменты чувствуешь себя настоящим волшебником.',
    likes: 312,
    tags: ['успех', 'радость', 'код', 'работает', 'магия'],
    author: 'HappyCoder',
    createdAt: '12 января 2024',
    views: 2100,
    comments: 38
  },
  {
    id: '5',
    title: 'Дедлайн близко',
    imageUrl: 'https://i.imgflip.com/1otk96.jpg',
    description: 'За день до сдачи проекта. Адреналин зашкаливает, кофеина в крови больше, чем крови, а сроки горят ярким пламенем. Но именно в такие моменты рождаются самые гениальные решения!',
    likes: 187,
    tags: ['дедлайн', 'стресс', 'работа', 'проект', 'адреналин'],
    author: 'ProjectManager',
    createdAt: '11 января 2024',
    views: 1432,
    comments: 29
  }
]

const MemeDetail = ({ isLoggedIn }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [meme, setMeme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    // Имитация загрузки
    setTimeout(() => {
      // Находим мем по ID
      const foundMeme = allMockMemes.find(m => m.id === id)
      
      if (foundMeme) {
        setMeme(foundMeme)
        setLikes(foundMeme.likes)
      }
      
      setLoading(false)
    }, 500)
  }, [id])

  const handleLike = () => {
    if (!isLoggedIn) {
      alert('Войдите, чтобы ставить лайки!')
      return
    }
    
    if (!isLiked) {
      setLikes(likes + 1)
      setIsLiked(true)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Ссылка скопирована в буфер обмена!')
  }

  const handleDelete = () => {
    if (window.confirm('Вы уверены, что хотите удалить этот мем?')) {
      alert('Мем удалён!')
      navigate('/memes')
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <p>Загружаем мем...</p>
      </div>
    )
  }

  if (!meme) {
    return (
      <div className="error">
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😕</div>
        <h2>Мем не найден</h2>
        <p style={{ marginBottom: '2rem' }}>Извините, запрашиваемый мем не существует</p>
        <Link to="/memes" className="btn btn-primary">
          Вернуться к мемам
        </Link>
      </div>
    )
  }

  return (
    <div className="meme-detail-container">
      <div style={{ padding: '1rem 0', marginBottom: '1rem' }}>
        <Link to="/memes" className="btn btn-secondary btn-sm">
          ← Назад к мемам
        </Link>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ position: 'relative' }}>
          <img
            src={meme.imageUrl}
            alt={meme.title}
            className="meme-detail-image"
          />
          {isLoggedIn && (
            <div style={{ 
              position: 'absolute', 
              top: '1rem', 
              right: '1rem', 
              display: 'flex', 
              gap: '0.5rem' 
            }}>
              <Link to={`/memes/${id}/edit`} className="btn btn-secondary btn-sm">
                ✏️ Редактировать
              </Link>
              <button onClick={handleDelete} className="btn btn-danger btn-sm">
                🗑️ Удалить
              </button>
            </div>
          )}
        </div>
        
        <div className="meme-detail-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                {meme.title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--gray)', flexWrap: 'wrap' }}>
                <span>👤 {meme.author}</span>
                <span>📅 {meme.createdAt}</span>
                <span>👁️ {meme.views} просмотров</span>
                <span>💬 {meme.comments} комментариев</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button 
                onClick={handleLike}
                className={`btn ${isLiked ? 'btn-danger' : 'btn-secondary'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                ❤️ {isLiked ? 'Понравилось' : 'Нравится'}
                <span style={{ 
                  background: 'white', 
                  color: isLiked ? 'var(--danger)' : 'var(--dark)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontWeight: 'bold'
                }}>
                  {likes}
                </span>
              </button>
              
              <button 
                onClick={handleShare}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                🔗 Поделиться
              </button>
            </div>
          </div>

          <div style={{ 
            background: 'var(--light)', 
            padding: '1.5rem', 
            borderRadius: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--dark)' }}>Описание:</h3>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--dark)' }}>
              {meme.description}
            </p>
          </div>

          <div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--dark)' }}>Теги:</h3>
            <div className="meme-tags" style={{ marginBottom: '2rem' }}>
              {meme.tags.map(tag => (
                <span key={tag} className="tag" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {!isLoggedIn && (
            <div style={{ 
              background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              marginTop: '2rem',
              textAlign: 'center'
            }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Хотите ставить лайки и создавать мемы?</h3>
              <p style={{ marginBottom: '1rem' }}>Войдите в систему, чтобы получить полный доступ</p>
              <Link to="/" className="btn" style={{ 
                background: 'white', 
                color: 'var(--primary)',
                fontWeight: 'bold'
              }}>
                🔓 Войти в систему
              </Link>
            </div>
          )}

          {/* Комментарии */}
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid var(--gray-light)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--dark)' }}>
              💬 Комментарии ({meme.comments})
            </h3>
            
            {!isLoggedIn ? (
              <div style={{ 
                background: 'var(--light)', 
                padding: '1.5rem', 
                borderRadius: '0.75rem',
                textAlign: 'center'
              }}>
                <p style={{ marginBottom: '1rem' }}>Войдите, чтобы оставлять комментарии</p>
                <Link to="/" className="btn btn-primary btn-sm">
                  🔓 Войти
                </Link>
              </div>
            ) : (
              <div>
                <textarea 
                  placeholder="Напишите ваш комментарий..."
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '2px solid var(--gray-light)',
                    borderRadius: '0.75rem',
                    marginBottom: '1rem',
                    fontFamily: 'inherit',
                    fontSize: '1rem',
                    minHeight: '100px'
                  }}
                />
                <button className="btn btn-primary">
                  Отправить комментарий
                </button>
                
                <div style={{ marginTop: '2rem' }}>
                  <div style={{ 
                    background: 'var(--light)', 
                    padding: '1rem', 
                    borderRadius: '0.75rem',
                    textAlign: 'center',
                    color: 'var(--gray)'
                  }}>
                    Пока нет комментариев. Будьте первым!
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemeDetail