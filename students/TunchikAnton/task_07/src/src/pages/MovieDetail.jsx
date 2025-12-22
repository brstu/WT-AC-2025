import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom'
import { 
  useGetMovieQuery, 
  useDeleteMovieMutation 
} from '../api/moviesApi'

const MovieDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showNotification } = useOutletContext()
  
  const { 
    data: movie, 
    isLoading, 
    error, 
    isError 
  } = useGetMovieQuery(id, {
    skip: !id, // Не делаем запрос если нет id
  })
  
  const [deleteMovie, { isLoading: isDeleting }] = useDeleteMovieMutation()

  if (!id) {
    return (
      <div className="error">
        <p>ID фильма не указан</p>
        <Link to="/" className="btn btn-primary">
          Назад к списку
        </Link>
      </div>
    )
  }

  if (isLoading) return <div className="loading">Загрузка информации о фильме...</div>
  
  if (isError) {
    console.error('Error loading movie:', error)
    return (
      <div className="error">
        <p>Ошибка загрузки информации о фильме</p>
        <div className="movie-actions">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            Назад
          </button>
          <Link to="/" className="btn btn-primary">
            На главную
          </Link>
        </div>
      </div>
    )
  }
  
  if (!movie) {
    return (
      <div className="empty">
        <p>Фильм не найден</p>
        <Link to="/" className="btn btn-primary">
          Назад к списку
        </Link>
      </div>
    )
  }

  const handleDelete = async () => {
    if (!id || isDeleting) return
    
    if (window.confirm('Вы уверены, что хотите удалить этот фильм?')) {
      try {
        await deleteMovie(id).unwrap()
        showNotification('Фильм успешно удален', 'success')
        navigate('/')
      } catch (err) {
        console.error('Delete error:', err)
        showNotification('Ошибка при удалении фильма', 'error')
      }
    }
  }

  return (
    <div className="movie-detail">
      <div className="movie-header">
        <h1>{movie.title}</h1>
        <div className="movie-meta">
          <span className={`rating rating-${Math.floor(movie.rating)}`}>
            Рейтинг: {movie.rating}/10
          </span>
          <span className="year">{movie.year}</span>
          <span className="category">{movie.category}</span>
          <span className="duration">{movie.duration} мин</span>
        </div>
      </div>

      <div className="movie-content">
        <div className="movie-info">
          <h3>Режиссер</h3>
          <p>{movie.director}</p>
          
          <h3>Описание</h3>
          <p className="description-text">{movie.description}</p>
          
          {movie.country && (
            <>
              <h3>Страна</h3>
              <p>{movie.country}</p>
            </>
          )}
        </div>

        <div className="movie-actions">
          <Link to={`/movies/${id}/edit`} className="btn btn-primary">
            Редактировать
          </Link>
          <button 
            onClick={handleDelete} 
            className="btn btn-danger"
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаление...' : 'Удалить'}
          </button>
          <Link to="/" className="btn btn-secondary">
            Назад к списку
          </Link>
        </div>
      </div>
    </div>
  )
}

export default MovieDetail