import { useNavigate, useOutletContext } from 'react-router-dom'
import { useCreateMovieMutation } from '../api/moviesApi'
import MovieForm from '../components/MovieForm'

const MovieCreate = () => {
  const navigate = useNavigate()
  const { showNotification } = useOutletContext()
  const [createMovie, { isLoading }] = useCreateMovieMutation()

  const handleSubmit = async (data) => {
    try {
      await createMovie(data).unwrap()
      showNotification('Фильм успешно создан', 'success')
      navigate('/')
    } catch (err) {
      showNotification('Ошибка при создании фильма', 'error')
    }
  }

  return (
    <div className="movie-create">
      <h1>Добавить новый фильм</h1>
      <MovieForm 
        onSubmit={handleSubmit} 
        isSubmitting={isLoading}
      />
    </div>
  )
}

export default MovieCreate