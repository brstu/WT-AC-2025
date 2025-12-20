import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  movieSchema,
  type MovieFormData,
} from '../../shared/lib/validations';
import { Button, Input } from '../../shared/ui';
import type { Movie } from '../../shared/types';

interface MovieFormProps {
  initialData?: Partial<Movie>;
  onSubmit: (data: MovieFormData) => void;
  loading?: boolean;
  submitText?: string;
}

export const MovieForm = ({
  initialData,
  onSubmit,
  loading = false,
  submitText = 'Save Movie',
}: MovieFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MovieFormData>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      year: initialData?.year || new Date().getFullYear(),
      rating: initialData?.rating || 0,
      posterUrl: initialData?.posterUrl || '',
    },
  });

  const handleFormSubmit = (data: MovieFormData) => {
    // fallback для постера
    if (!data.posterUrl) {
      data.posterUrl =
        'https://via.placeholder.com/400x600?text=' +
        encodeURIComponent(data.title);
    }
    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
    >
      <Input
        label="Title"
        placeholder="Movie title"
        error={errors.title?.message}
        {...register('title')}
      />

      <div>
        <label className="block text-sm font-medium mb-2">
          Description
        </label>
        <textarea
          className="input min-h-[100px]"
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Year"
          type="number"
          error={errors.year?.message}
          {...register('year', { valueAsNumber: true })}
        />

        <Input
          label="Rating (0–10)"
          type="number"
          step="0.1"
          error={errors.rating?.message}
          {...register('rating', { valueAsNumber: true })}
        />
      </div>

      <Input
        label="Poster URL"
        placeholder="https://example.com/poster.jpg"
        error={errors.posterUrl?.message}
        {...register('posterUrl')}
      />

      <Button type="submit" loading={loading}>
        {submitText}
      </Button>
    </form>
  );
};
