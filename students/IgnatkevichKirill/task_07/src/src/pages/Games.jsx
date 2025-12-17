import { useGetGamesQuery } from '../services/apiSlice'
import GamesList from '../features/games/GamesList'
import Loading from '../components/common/Loading'
import ErrorMessage from '../components/common/ErrorMessage'
import EmptyState from '../components/common/EmptyState'
import './Games.css'

const Games = () => {
  const { data: games = [], isLoading, error, refetch } = useGetGamesQuery()

  if (isLoading) return <Loading />

  if (error) {
    return (
      <ErrorMessage
        message={error?.data || 'Ошибка загрузки данных'}
        onRetry={refetch}
      />
    )
  }

  // ✅ Добавили состояние empty
  if (games.length === 0) {
    return (
      <EmptyState
        title="Нет игр"
        description="Каталог пока пуст. Добавьте первую игру!"
      />
    )
  }

  return (
    <div className="games-page">
      <div className="games-header">
        <h1>Каталог настольных игр</h1>
        <p>Найдено игр: {games.length}</p>
      </div>

      <GamesList games={games} />
    </div>
  )
}

export default Games
