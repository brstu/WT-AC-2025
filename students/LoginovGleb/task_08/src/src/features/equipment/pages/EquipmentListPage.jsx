import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetEquipmentListQuery, usePrefetch } from '../api/equipmentApi';
import { Spinner } from '../../../components/ui/Spinner';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import './EquipmentListPage.css';

export const EquipmentListPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, error, isLoading, isFetching } = useGetEquipmentListQuery({
    page,
    limit: 10,
    search,
  });

  const prefetchPage = usePrefetch('getEquipmentList');

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
        <p>{error.message || 'Не удалось загрузить список оборудования'}</p>
      </div>
    );
  }

  const equipmentList = data?.data || [];
  const isEmpty = equipmentList.length === 0;

  return (
    <div className="equipment-list-page">
      <div className="page-header">
        <h1>Список оборудования</h1>
        <Link to="/equipment/new">
          <Button>Добавить оборудование</Button>
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
          <p>Нет оборудования в базе данных</p>
          <Link to="/equipment/new">
            <Button>Добавить первое оборудование</Button>
          </Link>
        </div>
      ) : (
        <>
          {isFetching && <div className="loading-overlay">Загрузка...</div>}
          <div className="equipment-grid">
            {equipmentList.map((equipment) => (
              <Card key={equipment.id}>
                <Link
                  to={`/equipment/${equipment.id}`}
                  className="equipment-card-link"
                  onMouseEnter={() => prefetchPage({ page, limit: 10, search })}
                >
                  <h3>{equipment.name}</h3>
                  <p className="equipment-category">{equipment.category}</p>
                  <p className="equipment-status">
                    Статус: <span className={`status-${equipment.status}`}>{equipment.status}</span>
                  </p>
                  <p className="equipment-location">Местоположение: {equipment.location}</p>
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
              disabled={equipmentList.length < 10}
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
