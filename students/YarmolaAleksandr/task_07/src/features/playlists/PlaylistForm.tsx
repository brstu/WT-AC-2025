import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { playlistSchema, type PlaylistFormData } from '../../shared/lib/validations';
import { Button, Input } from '../../shared/ui';
import type { Playlist } from '../../shared/types';
import { useGetChannelsQuery } from '../../shared/api';

interface PlaylistFormProps {
  initialData?: Partial<Playlist>;
  onSubmit: (data: PlaylistFormData) => void;
  loading?: boolean;
  submitText?: string;
}

export const PlaylistForm = ({ 
  initialData, 
  onSubmit, 
  loading = false,
  submitText = 'Save Playlist' 
}: PlaylistFormProps) => {
  const { data: channelsResponse } = useGetChannelsQuery({ limit: 100 });
  const channels = channelsResponse?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PlaylistFormData>({
    resolver: zodResolver(playlistSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      channelId: initialData?.channelId || '',
      isPublic: initialData?.isPublic ?? true,
      thumbnailUrl: initialData?.thumbnailUrl || '',
    },
  });

  const handleFormSubmit = (data: PlaylistFormData) => {
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
          label="Playlist Name"
          placeholder="Enter playlist name"
          error={errors.name?.message}
          {...register('name')}
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Channel
          </label>
          <select
            className="input"
            {...register('channelId')}
          >
            <option value="">Select a channel</option>
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.name}
              </option>
            ))}
          </select>
          {errors.channelId && (
            <p className="mt-1 text-sm text-destructive" role="alert">
              {errors.channelId.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Description
        </label>
        <textarea
          className="input min-h-[100px] resize-y"
          placeholder="Enter playlist description"
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

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isPublic"
          className="h-4 w-4 rounded border-input"
          {...register('isPublic')}
        />
        <label htmlFor="isPublic" className="text-sm font-medium">
          Make playlist public
        </label>
      </div>

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