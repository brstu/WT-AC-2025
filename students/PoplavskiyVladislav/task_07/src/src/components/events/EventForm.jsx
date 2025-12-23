import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import './EventForm.css'

const eventSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(100, 'Название слишком длинное'),
  description: z.string().min(10, 'Описание должно содержать минимум 10 символов').max(500),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Неверный формат даты'
  }),
  location: z.string().min(1, 'Место проведения обязательно'),
  category: z.string().min(1, 'Категория обязательна'),
  maxParticipants: z.number().min(1, 'Минимум 1 участник').max(1000, 'Максимум 1000 участников'),
  status: z.enum(['active', 'cancelled', 'completed'])
})

const EventForm = ({ onSubmit, initialData = {}, isSubmitting = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialData.title || '',
      description: initialData.description || '',
      date: initialData.date ? new Date(initialData.date).toISOString().slice(0, 16) : '',
      location: initialData.location || '',
      category: initialData.category || '',
      maxParticipants: initialData.maxParticipants || 10,
      status: initialData.status || 'active'
    }
  })

  const categories = [
    'Конференция',
    'Семинар',
    'Воркшоп',
    'Вебинар',
    'Выставка',
    'Фестиваль',
    'Концерт',
    'Спорт'
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="event-form">
      <div className="form-group">
        <label className="form-label">Название мероприятия</label>
        <input
          type="text"
          className={`form-control ${errors.title ? 'is-invalid' : ''}`}
          {...register('title')}
        />
        {errors.title && (
          <div className="error-message">{errors.title.message}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Описание</label>
        <textarea
          className={`form-control ${errors.description ? 'is-invalid' : ''}`}
          rows={4}
          {...register('description')}
        />
        {errors.description && (
          <div className="error-message">{errors.description.message}</div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Дата и время</label>
          <input
            type="datetime-local"
            className={`form-control ${errors.date ? 'is-invalid' : ''}`}
            {...register('date')}
          />
          {errors.date && (
            <div className="error-message">{errors.date.message}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Место проведения</label>
          <input
            type="text"
            className={`form-control ${errors.location ? 'is-invalid' : ''}`}
            {...register('location')}
          />
          {errors.location && (
            <div className="error-message">{errors.location.message}</div>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Категория</label>
          <select
            className={`form-control ${errors.category ? 'is-invalid' : ''}`}
            {...register('category')}
          >
            <option value="">Выберите категорию</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <div className="error-message">{errors.category.message}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Максимум участников</label>
          <input
            type="number"
            className={`form-control ${errors.maxParticipants ? 'is-invalid' : ''}`}
            {...register('maxParticipants', { valueAsNumber: true })}
            min="1"
            max="1000"
          />
          {errors.maxParticipants && (
            <div className="error-message">{errors.maxParticipants.message}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Статус</label>
          <select
            className="form-control"
            {...register('status')}
          >
            <option value="active">Активно</option>
            <option value="cancelled">Отменено</option>
            <option value="completed">Завершено</option>
          </select>
        </div>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Сохранение...' : initialData.id ? 'Обновить' : 'Создать'}
      </button>
    </form>
  )
}

export default EventForm