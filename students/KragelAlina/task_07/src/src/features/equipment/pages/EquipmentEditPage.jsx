import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGetEquipmentByIdQuery, useUpdateEquipmentMutation } from '../api/equipmentApi';
import { showNotification } from '../../../store/notificationSlice';
import { Spinner } from '../../../components/ui/Spinner';
import { Card } from '../../../components/ui/Card';
import { EquipmentForm } from '../components/EquipmentForm';

export const EquipmentEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: equipment, error, isLoading } = useGetEquipmentByIdQuery(id);
  const [updateEquipment, { isLoading: isUpdating }] = useUpdateEquipmentMutation();

  const handleSubmit = async (data) => {
    try {
      await updateEquipment({ id, ...data }).unwrap();
      dispatch(showNotification({
        message: 'Оборудование успешно обновлено',
        type: 'success'
      }));
      navigate(`/equipment/${id}`);
    } catch (error) {
      dispatch(showNotification({
        message: error?.data?.message || 'Ошибка при обновлении оборудования',
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
        <p>{error?.data?.message || 'Не удалось загрузить информацию об оборудовании'}</p>
        <Link to="/equipment">
          <button className="btn btn-primary">Вернуться к списку</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="equipment-edit-page">
      <div className="page-header">
        <Link to={`/equipment/${id}`} className="back-link">
          ← Назад к деталям
        </Link>
      </div>

      <Card>
        <h1>Редактировать оборудование</h1>
        <EquipmentForm 
          onSubmit={handleSubmit} 
          defaultValues={equipment}
          isLoading={isUpdating}
        />
      </Card>
    </div>
  );
};
