import { useParams, useNavigate } from 'react-router-dom';
import { useGetGameByIdQuery, useUpdateGameMutation } from '../api/gamesApi';
import { Spinner } from '../../../components/ui/Spinner';
import { GameForm, GameFormData } from '../components/GameForm';
import { showNotification } from '../../../store/notificationSlice';
import { useAppDispatch } from '../../../store/hooks';

export const GameEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: game, isLoading } = useGetGameByIdQuery(id || '');
  const [updateGame, { isLoading: isUpdating }] = useUpdateGameMutation();

  const handleSubmit = async (data: GameFormData) => {
    try {
      await updateGame({ id: id || '', ...data }).unwrap();
      dispatch(showNotification({ message: 'Игра успешно обновлена', type: 'success' }));
      navigate(`/games/${id}`);
    } catch (err) {
      dispatch(showNotification({ message: 'Ошибка при обновлении игры', type: 'error' }));
    }
  };

  if (isLoading) return <Spinner />;
  if (!game) return <div>Игра не найдена</div>;

  return (
    <div className="game-edit-page">
      <h1>Редактировать игру</h1>
      <GameForm onSubmit={handleSubmit} isLoading={isUpdating} initialData={game} />
    </div>
  );
};
