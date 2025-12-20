import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGetGamesListQuery, usePrefetch } from '../api/gamesApi';
import { Spinner } from '../../../components/ui/Spinner';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import './GamesListPage.css';

export const GamesListPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, error, isLoading, isFetching } = useGetGamesListQuery({ 
    page, 
    limit: 10, 
    search 
  });
  
  const prefetchPage = usePrefetch('getGamesList');

  // Cancel ongoing requests when component unmounts
  useEffect(() => {
    return () => {
      // RTK Query automatically cancels ongoing requests on unmount
    };
  }, []);

  const handlePrefetch = (nextPage) => {
    prefetchPage({ page: nextPage, limit: 10, search });
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Ошибка загрузки</h2>
        <p>{error.message || 'Не удалось загрузить список игр'}</p>
      </div>
    );
  }

  const gamesList = data?.data || [];
  const isEmpty = gamesList.length === 0;

  return (
    <div className="games-list-page">
      <div className="page-header">
        <h1>Каталог игр</h1>
        <Link to="/games/new">
          <Button>Добавить игру</Button>
        </Link>
      </div>

      <div className="search-section">
        <Input
          type="search"
          placeholder="Поиск по названию..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isEmpty ? (
        <div className="empty-state">
          <p>Нет игр в каталоге</p>
          <Link to="/games/new">
            <Button>Добавить первую игру</Button>
          </Link>
        </div>
      ) : (
        <>
          {isFetching && <div className="loading-overlay">Загрузка...</div>}
          <div className="games-grid">
            {gamesList.map((game) => (
              <Card key={game.id}>
                <Link 
                  to={`/games/${game.id}`}
                  className="game-card-link"
                  onMouseEnter={() => prefetchPage({ page, limit: 10, search })}
                >
                  <h3>{game.name}</h3>
                  <p className="game-category">{game.category}</p>
                  <p className="game-status">
                    Статус: <span className={`status-${game.status}`}>
                      {game.status}
                    </span>
                  </p>
                  <p className="game-location">
                    Платформа: {game.location}
                  </p>
                </Link>
              </Card>
            ))}
          </div>

          <div className="pagination">
            <Button
              variant="outline"
              onClick={() => {
                setPage(page - 1);
                handlePrefetch(page - 1);
              }}
              disabled={page === 1}
            >
              Предыдущая
            </Button>
            <span className="page-info">Страница {page}</span>
            <Button
              variant="outline"
              onClick={() => {
                setPage(page + 1);
                handlePrefetch(page + 1);
              }}
              disabled={gamesList.length < 10}
              onMouseEnter={() => handlePrefetch(page + 1)}
            >
              Следующая
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
