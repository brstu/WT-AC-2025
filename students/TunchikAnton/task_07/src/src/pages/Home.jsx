import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { 
  useGetMoviesQuery, 
  useDeleteMovieMutation 
} from '../api/moviesApi'
import MovieCard from '../components/MovieCard'

const Home = () => {
  const { showNotification } = useOutletContext()
  const { data: movies = [], isLoading, error, refetch } = useGetMoviesQuery()
  const [deleteMovie] = useDeleteMovieMutation()
  const [filter, setFilter] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = async (id) => {
    if (!id || deletingId === id) return
    
    if (window.confirm('Удалить фильм?')) {
      setDeletingId(id)
      try {
        await deleteMovie(id).unwrap()
        showNotification('Фильм удален', 'success')
      } catch (err) {
        showNotification('Ошибка при удалении', 'error')
        // Перезагружаем данные при ошибке
        refetch()
      } finally {
        setDeletingId(null)
      }
    }
  }

  const filteredMovies = movies.filter(movie =>
    movie.title?.toLowerCase().includes(filter.toLowerCase()) ||
    movie.director?.toLowerCase().includes(filter.toLowerCase()) ||
    movie.category?.toLowerCase().includes(filter.toLowerCase())
  )

  if (isLoading) return <div className="loading">Загрузка фильмов...</div>
  
  if (error) {
    console.error('Error loading movies:', error)
    return (
      <div className="error">
        <p>Ошибка загрузки фильмов</p>
        <button onClick={refetch} className="btn btn-primary">
          Попробовать снова
        </button>
      </div>
    )
  }

  return (
    <div className="home">
      <div className="page-header">
        <h1>Коллекция фильмов кинофестиваля</h1>
        <input
          type="text"
          placeholder="Поиск по названию, режиссеру или категории..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="search-input"
        />
      </div>

      {movies.length === 0 ? (
        <div className="empty">
          <p>Нет фильмов в коллекции</p>
          <p>Добавьте первый фильм!</p>
        </div>
      ) : (
        <>
          <div className="movies-grid">
            {filteredMovies.map((movie) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                onDelete={handleDelete}
                isDeleting={deletingId === movie.id}
              />
            ))}
          </div>

          {filteredMovies.length === 0 && movies.length > 0 && (
            <div className="no-results">
              <p>Фильмы по запросу "{filter}" не найдены</p>
              <button 
                onClick={() => setFilter('')}
                className="btn btn-secondary"
              >
                Сбросить поиск
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Home