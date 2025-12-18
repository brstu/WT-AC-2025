import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetEquipmentByIdQuery, useDeleteEquipmentMutation } from '../api/equipmentApi';
import { useDispatch } from 'react-redux';
import { showNotification } from '../../../store/notificationSlice';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import './EquipmentDetailPage.css';

export const EquipmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: equipment, error, isLoading } = useGetEquipmentByIdQuery(id);
  const [deleteEquipment, { isLoading: isDeleting }] = useDeleteEquipmentMutation();

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить это оборудование?')) {
      try {
        await deleteEquipment(id).unwrap();
        dispatch(
          showNotification({
            message: 'Оборудование успешно удалено',
            type: 'success',
          })
        );
        navigate('/equipment');
      } catch (error) {
        dispatch(
          showNotification({
            message: error?.data?.message || 'Ошибка при удалении оборудования',
            type: 'error',
          })
        );
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
        <p>{error?.data?.message || 'Не удалось загрузить информацию об оборудовании'}</p>
        <Link to="/equipment">
          <Button>Вернуться к списку</Button>
        </Link>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="error-container">
        <h2>Оборудование не найдено</h2>
        <Link to="/equipment">
          <Button>Вернуться к списку</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="equipment-detail-page">
      <div className="detail-header">
        <Link to="/equipment" className="back-link">
          ← Назад к списку
        </Link>
      </div>

      <Card>
        <div className="detail-content">
          <h1>{equipment.name}</h1>

          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Категория:</span>
              <span className="detail-value">{equipment.category}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Статус:</span>
              <span className={`detail-value status-${equipment.status}`}>{equipment.status}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Местоположение:</span>
              <span className="detail-value">{equipment.location}</span>
            </div>

            {equipment.serialNumber && (
              <div className="detail-item">
                <span className="detail-label">Серийный номер:</span>
                <span className="detail-value">{equipment.serialNumber}</span>
              </div>
            )}

            {equipment.purchaseDate && (
              <div className="detail-item">
                <span className="detail-label">Дата покупки:</span>
                <span className="detail-value">
                  {new Date(equipment.purchaseDate).toLocaleDateString('ru-RU')}
                </span>
              </div>
            )}

            {equipment.assignedTo && (
              <div className="detail-item">
                <span className="detail-label">Назначено:</span>
                <span className="detail-value">{equipment.assignedTo}</span>
              </div>
            )}

            {equipment.description && (
              <div className="detail-item full-width">
                <span className="detail-label">Описание:</span>
                <p className="detail-value">{equipment.description}</p>
              </div>
            )}
          </div>

          <div className="detail-actions">
            <Link to={`/equipment/${id}/edit`}>
              <Button>Редактировать</Button>
            </Link>
            <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
