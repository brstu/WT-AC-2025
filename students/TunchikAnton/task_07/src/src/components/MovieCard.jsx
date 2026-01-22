import { Link } from 'react-router-dom'

const MovieCard = ({ movie, onDelete, isDeleting = false }) => {
  if (!movie) return null

  const handleDelete = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (movie.id && !isDeleting) {
      onDelete(movie.id)
    }
  }

  const ratingClass = `rating rating-${Math.floor(movie.rating || 0)}`

  return (
    <div className={`movie-card ${isDeleting ? 'deleting' : ''}`}>
      <div className="movie-card-header">
        <h3>{movie.title || 'Без названия'}</h3>
        {movie.rating !== undefined && (
          <span className={ratingClass}>
            {movie.rating}/10
          </span>
        )}
      </div>
      
      <div className="movie-card-body">
        <p className="director">
          <strong>Режиссер:</strong> {movie.director || 'Не указан'}
        </p>
        <p className="year">
          <strong>Год:</strong> {movie.year || 'Не указан'}
        </p>
        <p className="category">
          <strong>Категория:</strong> {movie.category || 'Не указана'}
        </p>
        <p className="description">
          {movie.description 
            ? (movie.description.length > 100 
                ? `${movie.description.substring(0, 100)}...` 
                : movie.description)
            : 'Описание отсутствует'}
        </p>
      </div>

      <div className="movie-card-footer">
        <Link to={`/movies/${movie.id}`} className="btn btn-primary">
          Подробнее
        </Link>
        <Link to={`/movies/${movie.id}/edit`} className="btn btn-secondary">
          Редактировать
        </Link>
        <button 
          onClick={handleDelete}
          className="btn btn-danger"
          disabled={isDeleting}
        >
          {isDeleting ? 'Удаление...' : 'Удалить'}
        </button>
      </div>
    </div>
  )
}

export default MovieCard