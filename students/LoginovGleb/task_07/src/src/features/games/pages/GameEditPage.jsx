import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGetGameByIdQuery, useUpdateGameMutation } from '../api/gamesApi';
import { showNotification } from '../../../store/notificationSlice';
import { Spinner } from '../../../components/ui/Spinner';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { GameForm } from '../components/GameForm';

export const GameEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: game, error, isLoading } = useGetGameByIdQuery(id);
  const [updateGame, { isLoading: isUpdating }] = useUpdateGameMutation();

  const handleSubmit = async (data) => {
    try {
      await updateGame({ id, ...data }).unwrap();
      dispatch(showNotification({
        message: 'Игра успешно обновлена',
        type: 'success'
      }));
      navigate(`/games/${id}`);
    } catch (error) {
      dispatch(showNotification({
        message: error?.data?.message || 'Ошибка при обновлении игры',
        type: 'error'
      }));
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Ошибка загрузки</h2>
        <p>{error?.data?.message || 'Не удалось загрузить информацию об игре'}</p>
        <Link to="/games">
          <Button>Вернуться к списку</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="game-edit-page">
      <div className="page-header">
        <Link to={`/games/${id}`} className="back-link">
          ← Назад к деталям
        </Link>
      </div>

      <Card>
        <h1>Редактировать игру</h1>
        <GameForm 
          onSubmit={handleSubmit} 
          defaultValues={game}
          isLoading={isUpdating}
        />
      </Card>
    </div>
  );
};
