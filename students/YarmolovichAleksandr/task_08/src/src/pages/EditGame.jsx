import { useParams } from 'react-router-dom'
import { useGetGameQuery } from '../services/apiSlice'
import GameForm from '../components/forms/GameForm'
import Loading from '../components/common/Loading'
import ErrorMessage from '../components/common/ErrorMessage'
import './FormPage.css'

const EditGame = () => {
  const { id } = useParams()
  const { data: currentGame, isLoading, error, refetch } = useGetGameQuery(id)

  if (isLoading) return <Loading />
  if (error) return <ErrorMessage message={error.data || 'Ошибка загрузки'} onRetry={refetch} />
  if (!currentGame) return <ErrorMessage message="Игра не найдена" />

  return (
    <div className="form-page">
      <GameForm game={currentGame} isEdit={true} />
    </div>
  )
}

export default EditGame