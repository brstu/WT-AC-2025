import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useCreateGameMutation } from '../api/gamesApi';
import { showNotification } from '../../../store/notificationSlice';
import { Card } from '../../../components/ui/Card';
import { GameForm } from '../components/GameForm';

export const GameNewPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [createGame, { isLoading }] = useCreateGameMutation();

  const handleSubmit = async (data) => {
    try {
      await createGame(data).unwrap();
      dispatch(showNotification({
        message: 'Игра успешно добавлена',
        type: 'success'
      }));
      navigate('/games');
    } catch (error) {
      dispatch(showNotification({
        message: error?.data?.message || 'Ошибка при создании игры',
        type: 'error'
      }));
    }
  };

  return (
    <div className="game-new-page">
      <div className="page-header">
        <Link to="/games" className="back-link">
          ← Назад к списку
        </Link>
      </div>

      <Card>
        <h1>Добавить новую игру</h1>
        <GameForm onSubmit={handleSubmit} isLoading={isLoading} />
      </Card>
    </div>
  );
};
