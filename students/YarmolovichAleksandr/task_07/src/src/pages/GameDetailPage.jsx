import { useParams, Link, useNavigate } from 'react-router-dom'
import { useGetGameQuery, useDeleteGameMutation } from '../services/apiSlice'
import { useAuth } from '../hooks/useAuth'
import Loading from '../components/common/Loading'
import ErrorMessage from '../components/common/ErrorMessage'
import './GameDetailPage.css'

const GameDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  
  const { data: currentGame, isLoading, error, refetch } = useGetGameQuery(id)
  const [deleteGame, { isLoading: isDeleting }] = useDeleteGameMutation()

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить эту игру?')) {
      try {
        await deleteGame(id).unwrap()
        navigate('/games')
      } catch (error) {
        console.error('Ошибка при удалении:', error)
      }
    }
  }

  const renderRatingStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating / 2)
    const halfStar = rating % 2 >= 1

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star full">★</span>)
    }
    
    if (halfStar) {
      stars.push(<span key="half" className="star half">★</span>)
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>)
    }

    return stars
  }

  if (isLoading) return <Loading />
  if (error) return <ErrorMessage message={error.data || 'Ошибка загрузки'} onRetry={refetch} />
  if (!currentGame) return <ErrorMessage message="Игра не найдена" />

  return (
    <div className="game-detail">
      <div className="game-detail-header">
        <Link to="/games" className="back-link">← Назад к списку</Link>
        
        {isAuthenticated && (
          <div className="game-actions">
            <Link to={`/games/${id}/edit`} className="btn-edit">
              Редактировать
            </Link>
            <button 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="btn-delete"
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </button>
          </div>
        )}
      </div>

      <div className="game-detail-content">
        <div className="game-image-section">
          {currentGame.image ? (
            <img src={currentGame.image} alt={currentGame.title} className="game-image" />
          ) : (
            <div className="image-placeholder-large">🎲</div>
          )}
        </div>

        <div className="game-info-section">
          <h1 className="game-title">{currentGame.title}</h1>
          
          {currentGame.category && (
            <div className="game-category">
              <span className="category-tag">{currentGame.category}</span>
            </div>
          )}

          <div className="game-rating-large">
            <div className="rating-stars">
              {renderRatingStars(currentGame.rating)}
            </div>
            <span className="rating-value">{currentGame.rating}/10</span>
          </div>

          <div className="game-stats">
            <div className="stat">
              <span className="stat-label">Игроки:</span>
              <span className="stat-value">{currentGame.minPlayers}-{currentGame.maxPlayers}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Время игры:</span>
              <span className="stat-value">{currentGame.playTime} минут</span>
            </div>
            <div className="stat">
              <span className="stat-label">Сложность:</span>
              <span className="stat-value complexity">
                {'★'.repeat(currentGame.complexity)}{'☆'.repeat(5 - currentGame.complexity)}
              </span>
            </div>
          </div>

          <div className="game-description">
            <h3>Описание</h3>
            <p>{currentGame.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameDetailPage
