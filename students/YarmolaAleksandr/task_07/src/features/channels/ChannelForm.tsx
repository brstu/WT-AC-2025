import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { channelSchema, type ChannelFormData } from '../../shared/lib/validations';
import { Button, Input } from '../../shared/ui';
import type { Channel } from '../../shared/types';

interface ChannelFormProps {
  initialData?: Partial<Channel>;
  onSubmit: (data: ChannelFormData) => void;
  loading?: boolean;
  submitText?: string;
}

const categories = [
  'Technology',
  'Gaming',
  'Music',
  'Education',
  'Entertainment',
  'Sports',
  'News & Politics',
  'Science & Technology',
  'Travel & Events',
  'Food & Cooking',
  'Health & Fitness',
  'Fashion & Beauty',
  'Comedy',
  'Film & Animation',
];

export const ChannelForm = ({ 
  initialData, 
  onSubmit, 
  loading = false,
  submitText = 'Save Channel' 
}: ChannelFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ChannelFormData>({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      url: initialData?.url || '',
      category: initialData?.category || '',
      thumbnailUrl: initialData?.thumbnailUrl || '',
    },
  });

  const watchedUrl = watch('url');

  const handleFormSubmit = (data: ChannelFormData) => {
    // Auto-generate thumbnail URL if not provided
    if (!data.thumbnailUrl) {
      data.thumbnailUrl = 'https://via.placeholder.com/300x200?text=' + 
        encodeURIComponent(data.name);
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Channel Name"
          placeholder="Enter channel name"
          error={errors.name?.message}
          {...register('name')}
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Category
          </label>
          <select
            className="input"
            {...register('category')}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-destructive" role="alert">
              {errors.category.message}
            </p>
          )}
        </div>
      </div>

      <Input
        label="YouTube URL"
        placeholder="https://youtube.com/@channelname"
        error={errors.url?.message}
        {...register('url')}
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Description
        </label>
        <textarea
          className="input min-h-[100px] resize-y"
          placeholder="Enter channel description"
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-destructive" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      <Input
        label="Thumbnail URL (Optional)"
        placeholder="https://example.com/image.jpg"
        error={errors.thumbnailUrl?.message}
        {...register('thumbnailUrl')}
      />

      {watchedUrl && (
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">Preview</h4>
          <p className="text-sm text-muted-foreground">
            Channel URL: {watchedUrl}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button 
          type="submit" 
          loading={loading}
          className="flex-1 md:flex-none"
        >
          {submitText}
        </Button>
      </div>
    </form>
  );
};