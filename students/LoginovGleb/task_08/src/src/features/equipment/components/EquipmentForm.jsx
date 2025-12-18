import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import './EquipmentForm.css';

const equipmentSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(100, 'Название слишком длинное'),
  category: z.string().min(1, 'Категория обязательна'),
  status: z.enum(['available', 'in-use', 'maintenance', 'retired'], {
    errorMap: () => ({ message: 'Выберите корректный статус' }),
  }),
  location: z.string().min(1, 'Местоположение обязательно'),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  assignedTo: z.string().optional(),
  description: z.string().optional(),
});

export const EquipmentForm = ({ onSubmit, defaultValues, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(equipmentSchema),
    defaultValues: defaultValues || {
      name: '',
      category: '',
      status: 'available',
      location: '',
      serialNumber: '',
      purchaseDate: '',
      assignedTo: '',
      description: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="equipment-form">
      <Input
        label="Название *"
        {...register('name')}
        error={errors.name?.message}
        placeholder="Введите название оборудования"
      />

      <Input
        label="Категория *"
        {...register('category')}
        error={errors.category?.message}
        placeholder="Например: Компьютеры, Принтеры"
      />

      <div className="input-group">
        <label className="input-label">Статус *</label>
        <select {...register('status')} className={`input ${errors.status ? 'input-error' : ''}`}>
          <option value="available">Доступно</option>
          <option value="in-use">В использовании</option>
          <option value="maintenance">На обслуживании</option>
          <option value="retired">Списано</option>
        </select>
        {errors.status && <span className="error-message">{errors.status.message}</span>}
      </div>

      <Input
        label="Местоположение *"
        {...register('location')}
        error={errors.location?.message}
        placeholder="Например: Офис 301"
      />

      <Input
        label="Серийный номер"
        {...register('serialNumber')}
        error={errors.serialNumber?.message}
        placeholder="Необязательно"
      />

      <Input
        label="Дата покупки"
        type="date"
        {...register('purchaseDate')}
        error={errors.purchaseDate?.message}
      />

      <Input
        label="Назначено"
        {...register('assignedTo')}
        error={errors.assignedTo?.message}
        placeholder="Имя пользователя или отдел"
      />

      <div className="input-group">
        <label className="input-label">Описание</label>
        <textarea
          {...register('description')}
          className={`input ${errors.description ? 'input-error' : ''}`}
          rows="4"
          placeholder="Дополнительная информация"
        />
        {errors.description && <span className="error-message">{errors.description.message}</span>}
      </div>

      <Button type="submit" fullWidth disabled={isLoading}>
        {isLoading ? 'Сохранение...' : 'Сохранить'}
      </Button>
    </form>
  );
};
