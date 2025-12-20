import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PropTypes from 'prop-types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import './GameForm.css';

const gameSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(100, 'Название слишком длинное'),
  category: z.string().min(1, 'Жанр обязателен'),
  status: z.enum(['released', 'upcoming', 'beta', 'discontinued'], {
    errorMap: () => ({ message: 'Выберите корректный статус' }),
  }),
  location: z.string().min(1, 'Платформа обязательна'),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  assignedTo: z.string().optional(),
  description: z.string().optional(),
});

export const GameForm = ({ onSubmit, defaultValues, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(gameSchema),
    defaultValues: defaultValues || {
      name: '',
      category: '',
      status: 'released',
      location: '',
      serialNumber: '',
      purchaseDate: '',
      assignedTo: '',
      description: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="game-form">
      <Input
        label="Название игры *"
        {...register('name')}
        error={errors.name?.message}
        placeholder="Введите название игры"
      />

      <Input
        label="Жанр *"
        {...register('category')}
        error={errors.category?.message}
        placeholder="Например: RPG, Action, Strategy"
      />

      <div className="input-group">
        <label className="input-label">Статус *</label>
        <select
          {...register('status')}
          className={`input ${errors.status ? 'input-error' : ''}`}
        >
          <option value="released">Вышла</option>
          <option value="upcoming">Ожидается</option>
          <option value="beta">Бета-тестирование</option>
          <option value="discontinued">Снята с продаж</option>
        </select>
        {errors.status && (
          <span className="error-message">{errors.status.message}</span>
        )}
      </div>

      <Input
        label="Платформа *"
        {...register('location')}
        error={errors.location?.message}
        placeholder="Например: PC, PlayStation 5, Xbox"
      />

      <Input
        label="Разработчик"
        {...register('serialNumber')}
        error={errors.serialNumber?.message}
        placeholder="Необязательно"
      />

      <Input
        label="Дата выхода"
        type="date"
        {...register('purchaseDate')}
        error={errors.purchaseDate?.message}
      />

      <Input
        label="Издатель"
        {...register('assignedTo')}
        error={errors.assignedTo?.message}
        placeholder="Название издателя"
      />

      <div className="input-group">
        <label className="input-label">Описание</label>
        <textarea
          {...register('description')}
          className={`input ${errors.description ? 'input-error' : ''}`}
          rows="4"
          placeholder="Дополнительная информация"
        />
        {errors.description && (
          <span className="error-message">{errors.description.message}</span>
        )}
      </div>

      <Button type="submit" fullWidth disabled={isLoading}>
        {isLoading ? 'Сохранение...' : 'Сохранить'}
      </Button>
    </form>
  );
};

GameForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  defaultValues: PropTypes.shape({
    name: PropTypes.string,
    category: PropTypes.string,
    status: PropTypes.oneOf(['released', 'upcoming', 'beta', 'discontinued']),
    location: PropTypes.string,
    serialNumber: PropTypes.string,
    purchaseDate: PropTypes.string,
    assignedTo: PropTypes.string,
    description: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
};
