import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import type { Game } from '../api/gamesApi';
import './GameForm.css';

const gameSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  genre: z.string().min(1, 'Жанр обязателен'),
  platform: z.string().min(1, 'Платформа обязательна'),
  releaseYear: z.preprocess((val) => Number(val), z.number().int().min(1970).max(2030)),
  developer: z.string().min(1, 'Разработчик обязателен'),
  publisher: z.string().min(1, 'Издатель обязателен'),
  rating: z.preprocess((val) => Number(val), z.number().min(0).max(10)),
  description: z.string().min(10, 'Описание должно содержать минимум 10 символов'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  price: z.preprocess((val) => (val === '' ? undefined : Number(val)), z.number().min(0).optional()),
  status: z.enum(['available', 'coming-soon', 'discontinued']),
});

export type GameFormData = {
  title: string;
  genre: string;
  platform: string;
  releaseYear: number;
  developer: string;
  publisher: string;
  rating: number;
  description: string;
  status: 'available' | 'coming-soon' | 'discontinued';
  imageUrl?: string;
  price?: number;
};

export interface GameFormProps {
  onSubmit: (data: GameFormData) => void;
  isLoading: boolean;
  initialData?: Partial<Game>;
}

export const GameForm = ({ onSubmit, isLoading, initialData }: GameFormProps) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GameFormData>({
    resolver: zodResolver(gameSchema) as any,
    defaultValues: initialData || {
      title: '',
      genre: '',
      platform: '',
      releaseYear: new Date().getFullYear(),
      developer: '',
      publisher: '',
      rating: 7,
      description: '',
      imageUrl: '',
      price: 0,
      status: 'available',
    },
  });

  return (
    <Card className="game-form-card">
      <form onSubmit={handleSubmit(onSubmit)} className="game-form">
        <Input
          label="Название игры *"
          {...register('title')}
          error={errors.title?.message}
          placeholder="Введите название игры"
        />

        <Input
          label="Жанр *"
          {...register('genre')}
          error={errors.genre?.message}
          placeholder="Например: RPG, Action, Strategy"
        />

        <Input
          label="Платформа *"
          {...register('platform')}
          error={errors.platform?.message}
          placeholder="Например: PC, PlayStation, Xbox"
        />

        <Input
          label="Год выпуска *"
          type="number"
          {...register('releaseYear')}
          error={errors.releaseYear?.message}
        />

        <Input
          label="Разработчик *"
          {...register('developer')}
          error={errors.developer?.message}
          placeholder="Студия-разработчик"
        />

        <Input
          label="Издатель *"
          {...register('publisher')}
          error={errors.publisher?.message}
          placeholder="Издатель игры"
        />

        <Input
          label="Рейтинг (0-10) *"
          type="number"
          step="0.1"
          {...register('rating')}
          error={errors.rating?.message}
        />

        <div className="input-group">
          <label className="input-label">Описание *</label>
          <textarea
            {...register('description')}
            className={`input ${errors.description ? 'input-error' : ''}`}
            placeholder="Подробное описание игры"
            rows={5}
          />
          {errors.description && <span className="error-message">{errors.description.message}</span>}
        </div>

        <Input
          label="URL изображения"
          {...register('imageUrl')}
          error={errors.imageUrl?.message}
          placeholder="https://example.com/image.jpg"
        />

        <Input
          label="Цена ($)"
          type="number"
          step="0.01"
          {...register('price')}
          error={errors.price?.message}
        />

        <div className="input-group">
          <label className="input-label">Статус *</label>
          <select {...register('status')} className="input">
            <option value="available">Доступна</option>
            <option value="coming-soon">Скоро выйдет</option>
            <option value="discontinued">Снята с производства</option>
          </select>
        </div>

        <div className="form-actions">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Отмена
          </Button>
        </div>
      </form>
    </Card>
  );
};
