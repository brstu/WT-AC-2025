import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Схема валидации
const movieSchema = z.object({
  title: z.string()
    .min(1, 'Название обязательно')
    .max(100, 'Название слишком длинное'),
  director: z.string()
    .min(1, 'Режиссер обязателен')
    .max(100, 'Имя режиссера слишком длинное'),
  year: z.coerce.number()
    .int('Год должен быть целым числом')
    .min(1900, 'Год должен быть не меньше 1900')
    .max(new Date().getFullYear() + 1, 'Год не может быть в будущем'),
  rating: z.coerce.number()
    .min(0, 'Рейтинг не может быть меньше 0')
    .max(10, 'Рейтинг не может быть больше 10')
    .default(0),
  category: z.string()
    .min(1, 'Категория обязательна'),
  description: z.string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(1000, 'Описание слишком длинное'),
  duration: z.coerce.number()
    .int('Длительность должна быть целым числом')
    .min(1, 'Длительность должна быть положительной')
    .max(480, 'Длительность не может превышать 8 часов'),
})

const MovieForm = ({ onSubmit, initialData, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(movieSchema),
    defaultValues: initialData || {
      title: '',
      director: '',
      year: new Date().getFullYear(),
      rating: 0,
      category: '',
      description: '',
      duration: 90,
    },
  })

  const handleFormSubmit = (data) => {
    if (onSubmit) {
      onSubmit(data)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="movie-form">
      <div className="form-group">
        <label htmlFor="title">Название фильма *</label>
        <input 
          id="title"
          {...register('title')} 
          className={errors.title ? 'error' : ''}
          placeholder="Введите название фильма"
        />
        {errors.title && (
          <span className="error-message">{errors.title.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="director">Режиссер *</label>
        <input 
          id="director"
          {...register('director')} 
          className={errors.director ? 'error' : ''}
          placeholder="Введите имя режиссера"
        />
        {errors.director && (
          <span className="error-message">{errors.director.message}</span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="year">Год выпуска *</label>
          <input 
            id="year"
            type="number" 
            {...register('year')} 
            className={errors.year ? 'error' : ''}
            placeholder="2024"
          />
          {errors.year && (
            <span className="error-message">{errors.year.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="rating">Рейтинг (0-10) *</label>
          <input 
            id="rating"
            type="number" 
            step="0.1"
            {...register('rating')} 
            className={errors.rating ? 'error' : ''}
            placeholder="7.5"
          />
          {errors.rating && (
            <span className="error-message">{errors.rating.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="duration">Длительность (мин) *</label>
          <input 
            id="duration"
            type="number" 
            {...register('duration')} 
            className={errors.duration ? 'error' : ''}
            placeholder="120"
          />
          {errors.duration && (
            <span className="error-message">{errors.duration.message}</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="category">Категория *</label>
        <select 
          id="category"
          {...register('category')} 
          className={errors.category ? 'error' : ''}
        >
          <option value="">Выберите категорию</option>
          <option value="Полнометражный">Полнометражный</option>
          <option value="Короткометражный">Короткометражный</option>
          <option value="Документальный">Документальный</option>
          <option value="Анимационный">Анимационный</option>
          <option value="Экспериментальный">Экспериментальный</option>
          <option value="Студенческий">Студенческий</option>
        </select>
        {errors.category && (
          <span className="error-message">{errors.category.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="description">Описание *</label>
        <textarea 
          id="description"
          {...register('description')} 
          rows="4"
          className={errors.description ? 'error' : ''}
          placeholder="Опишите сюжет фильма, его особенности и значимость..."
        />
        {errors.description && (
          <span className="error-message">{errors.description.message}</span>
        )}
      </div>

      <div className="form-actions">
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting || (!isDirty && initialData)}
        >
          {isSubmitting ? 'Сохранение...' : initialData ? 'Обновить фильм' : 'Добавить фильм'}
        </button>
      </div>
    </form>
  )
}

export default MovieForm