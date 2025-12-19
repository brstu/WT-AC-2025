import { useParams, useNavigate } from 'react-router-dom'
import { 
  useGetMovieQuery, 
  useUpdateMovieMutation 
} from '../api/moviesApi'
import MovieForm from '../components/MovieForm'
import { useNotification } from '../components/Layout'

const MovieEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  
  const { 
    data: movie, 
    isLoading, 
    error, 
    isError 
  } = useGetMovieQuery(id, {
    skip: !id,
  })
  
  const [updateMovie, { isLoading: isUpdating }] = useUpdateMovieMutation()

  if (!id) {
    return (
      <div className="error">
        <p>ID фильма не указан</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          На главную
        </button>
      </div>
    )
  }

  if (isLoading) return <div className="loading">Загрузка данных фильма...</div>
  
  if (isError) {
    console.error('Error loading movie for edit:', error)
    return (
      <div className="error">
        <p>Ошибка загрузки данных фильма</p>
        <div className="movie-actions">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            Назад
          </button>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            На главную
          </button>
        </div>
      </div>
    )
  }
  
  if (!movie) {
    return (
      <div className="empty">
        <p>Фильм не найден</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          На главную
        </button>
      </div>
    )
  }

  const handleSubmit = async (data) => {
    if (!id) return
    
    try {
      await updateMovie({ id, ...data }).unwrap()
      showNotification('Фильм успешно обновлен', 'success')
      navigate(`/movies/${id}`)
    } catch (err) {
      console.error('Update error:', err)
      showNotification('Ошибка при обновлении фильма', 'error')
    }
  }

  return (
    <div className="movie-edit">
      <h1>Редактировать фильм: {movie.title}</h1>
      <MovieForm 
        onSubmit={handleSubmit} 
        initialData={movie}
        isSubmitting={isUpdating}
      />
      <div className="form-navigation">
        <button 
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
        >
          Отмена
        </button>
        <button 
          onClick={() => navigate(`/movies/${id}`)}
          className="btn btn-primary"
        >
          Просмотр
        </button>
      </div>
    </div>
  )
}

export default MovieEdit