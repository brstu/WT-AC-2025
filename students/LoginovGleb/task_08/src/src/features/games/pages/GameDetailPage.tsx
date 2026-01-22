import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetGameByIdQuery, useDeleteGameMutation } from '../api/gamesApi';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { showNotification } from '../../../store/notificationSlice';
import { useAppDispatch } from '../../../store/hooks';
import './GameDetailPage.css';

export const GameDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: game, isLoading, error } = useGetGameByIdQuery(id || '');
  const [deleteGame, { isLoading: isDeleting }] = useDeleteGameMutation();

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить эту игру?')) {
      try {
        await deleteGame(id || '').unwrap();
        dispatch(showNotification({ message: 'Игра успешно удалена', type: 'success' }));
        navigate('/games');
      } catch (err) {
        dispatch(showNotification({ message: 'Ошибка при удалении игры', type: 'error' }));
      }
    }
  };

  if (isLoading) return <Spinner />;
  if (error || !game) return <div className="error-container">Игра не найдена</div>;

  return (
    <div className="game-detail-page">
      <div className="detail-header">
        <h1>{game.title}</h1>
        <div className="detail-actions">
          <Link to={`/games/${id}/edit`}>
            <Button variant="secondary">Редактировать</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Удаление...' : 'Удалить'}
          </Button>
        </div>
      </div>

      <Card>
        {game.imageUrl && <img src={game.imageUrl} alt={game.title} className="detail-image" />}
        <div className="detail-info">
          <p><strong>Жанр:</strong> {game.genre}</p>
          <p><strong>Платформа:</strong> {game.platform}</p>
          <p><strong>Год выпуска:</strong> {game.releaseYear}</p>
          <p><strong>Разработчик:</strong> {game.developer}</p>
          <p><strong>Издатель:</strong> {game.publisher}</p>
          <p><strong>Рейтинг:</strong> ⭐ {game.rating}/10</p>
          <p><strong>Статус:</strong> <span className={`status-${game.status}`}>{game.status}</span></p>
          {game.price && <p><strong>Цена:</strong> ${game.price}</p>}
          <p><strong>Описание:</strong></p>
          <p className="description">{game.description}</p>
        </div>
      </Card>

      <div className="back-link">
        <Link to="/games">
          <Button variant="ghost">← Назад к каталогу</Button>
        </Link>
      </div>
    </div>
  );
};
