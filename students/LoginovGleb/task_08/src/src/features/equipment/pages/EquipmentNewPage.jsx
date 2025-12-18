import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useCreateEquipmentMutation } from '../api/equipmentApi';
import { showNotification } from '../../../store/notificationSlice';
import { Card } from '../../../components/ui/Card';
import { EquipmentForm } from '../components/EquipmentForm';

export const EquipmentNewPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [createEquipment, { isLoading }] = useCreateEquipmentMutation();

  const handleSubmit = async (data) => {
    try {
      await createEquipment(data).unwrap();
      dispatch(
        showNotification({
          message: 'Оборудование успешно добавлено',
          type: 'success',
        })
      );
      navigate('/equipment');
    } catch (error) {
      dispatch(
        showNotification({
          message: error?.data?.message || 'Ошибка при создании оборудования',
          type: 'error',
        })
      );
    }
  };

  return (
    <div className="equipment-new-page">
      <div className="page-header">
        <Link to="/equipment" className="back-link">
          ← Назад к списку
        </Link>
      </div>

      <Card>
        <h1>Добавить новое оборудование</h1>
        <EquipmentForm onSubmit={handleSubmit} isLoading={isLoading} />
      </Card>
    </div>
  );
};
