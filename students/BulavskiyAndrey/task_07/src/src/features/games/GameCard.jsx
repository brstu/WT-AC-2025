import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './GameCard.css'

const GameCard = ({ game }) => {
  const { isAuthenticated } = useAuth()

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

  return (
    <Link to={`/games/${game.id}`} className="game-card-link">
      <div className="game-card">
        <div className="game-image">
          {game.image ? (
            <img src={game.image} alt={game.title} />
          ) : (
            <div className="image-placeholder">🎲</div>
          )}
        </div>
        
        <div className="game-info">
          <h3 className="game-title">{game.title}</h3>
          
          <p className="game-description">
            {game.description.length > 100 
              ? `${game.description.substring(0, 100)}...` 
              : game.description
            }
          </p>

          <div className="game-details">
            <div className="detail">
              <span className="label">Игроки:</span>
              <span>{game.minPlayers}-{game.maxPlayers}</span>
            </div>
            
            <div className="detail">
              <span className="label">Время:</span>
              <span>{game.playTime} мин</span>
            </div>
            
            <div className="detail">
              <span className="label">Сложность:</span>
              <span className="complexity">
                {'★'.repeat(game.complexity)}{'☆'.repeat(5 - game.complexity)}
              </span>
            </div>
          </div>

          <div className="game-rating">
            <div className="rating-stars">
              {renderRatingStars(game.rating)}
            </div>
            <span className="rating-value">{game.rating}/10</span>
          </div>

          {game.category && (
            <div className="game-category">
              <span className="category-tag">{game.category}</span>
            </div>
          )}

          {isAuthenticated && (
            <div className="game-actions">
              <span className="btn-edit">Редактировать</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default GameCard
