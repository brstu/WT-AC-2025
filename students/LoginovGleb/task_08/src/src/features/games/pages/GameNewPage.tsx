import { useNavigate } from 'react-router-dom';
import { useCreateGameMutation } from '../api/gamesApi';
import { GameForm, GameFormData } from '../components/GameForm';
import { showNotification } from '../../../store/notificationSlice';
import { useAppDispatch } from '../../../store/hooks';

export const GameNewPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [createGame, { isLoading }] = useCreateGameMutation();

  const handleSubmit = async (data: GameFormData) => {
    try {
      await createGame(data).unwrap();
      dispatch(showNotification({ message: 'Игра успешно добавлена', type: 'success' }));
      navigate('/games');
    } catch (err) {
      dispatch(showNotification({ message: 'Ошибка при добавлении игры', type: 'error' }));
    }
  };

  return (
    <div className="game-new-page">
      <h1>Добавить новую игру</h1>
      <GameForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
};
