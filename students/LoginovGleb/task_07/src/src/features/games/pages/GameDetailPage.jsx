import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetGameByIdQuery, useDeleteGameMutation } from '../api/gamesApi';
import { useDispatch } from 'react-redux';
import { showNotification } from '../../../store/notificationSlice';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import './GameDetailPage.css';

export const GameDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: game, error, isLoading } = useGetGameByIdQuery(id);
  const [deleteGame, { isLoading: isDeleting }] = useDeleteGameMutation();

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить эту игру?')) {
      try {
        await deleteGame(id).unwrap();
        dispatch(showNotification({
          message: 'Игра успешно удалена',
          type: 'success'
        }));
        navigate('/games');
      } catch (error) {
        dispatch(showNotification({
          message: error?.data?.message || 'Ошибка при удалении игры',
          type: 'error'
        }));
      }
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

  if (!game) {
    return (
      <div className="error-container">
        <h2>Игра не найдена</h2>
        <Link to="/games">
          <Button>Вернуться к списку</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="game-detail-page">
      <div className="detail-header">
        <Link to="/games" className="back-link">
          ← Назад к списку
        </Link>
      </div>

      <Card>
        <div className="detail-content">
          <h1>{game.name}</h1>
          
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Жанр:</span>
              <span className="detail-value">{game.category}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Статус:</span>
              <span className={`detail-value status-${game.status}`}>
                {game.status}
              </span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Платформа:</span>
              <span className="detail-value">{game.location}</span>
            </div>
            
            {game.serialNumber && (
              <div className="detail-item">
                <span className="detail-label">Разработчик:</span>
                <span className="detail-value">{game.serialNumber}</span>
              </div>
            )}
            
            {game.purchaseDate && (
              <div className="detail-item">
                <span className="detail-label">Дата выхода:</span>
                <span className="detail-value">
                  {new Date(game.purchaseDate).toLocaleDateString('ru-RU')}
                </span>
              </div>
            )}
            
            {game.assignedTo && (
              <div className="detail-item">
                <span className="detail-label">Издатель:</span>
                <span className="detail-value">{game.assignedTo}</span>
              </div>
            )}
            
            {game.description && (
              <div className="detail-item full-width">
                <span className="detail-label">Описание:</span>
                <p className="detail-value">{game.description}</p>
              </div>
            )}
          </div>

          <div className="detail-actions">
            <Link to={`/games/${id}/edit`}>
              <Button>Редактировать</Button>
            </Link>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
