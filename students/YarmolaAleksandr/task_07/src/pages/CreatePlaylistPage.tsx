import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, CardHeader, CardContent } from '../shared/ui';
import { PlaylistForm } from '../features/playlists';
import { useCreatePlaylistMutation } from '../shared/api';
import { useAppDispatch } from '../app/hooks';
import { addNotification } from '../app/appSlice';
import type { PlaylistFormData } from '../shared/lib/validations';
import toast from 'react-hot-toast';

const CreatePlaylistPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [createPlaylist, { isLoading }] = useCreatePlaylistMutation();

  // Get channelId from location state if coming from channel detail page
  const initialChannelId = location.state?.channelId || '';

  const handleSubmit = async (data: PlaylistFormData) => {
    try {
      await createPlaylist({
        ...data,
        videoCount: 0,
        thumbnailUrl: data.thumbnailUrl || `https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=250&fit=crop`,
      }).unwrap();

      toast.success('Playlist created successfully!');
      dispatch(addNotification({
        type: 'success',
        title: 'Playlist Created',
        message: `"${data.name}" has been added`,
      }));

      navigate('/playlists');
    } catch (err) {
      const error = err as { data?: { message?: string } };
      console.error('Error creating playlist:', error);
      toast.error('Failed to create playlist');
      dispatch(addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: error?.data?.message || 'Could not create the playlist. Please try again.',
      }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/playlists">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Playlists
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Create New Playlist</h1>
          <p className="text-muted-foreground">
            Organize your videos with a new playlist
          </p>
        </CardHeader>
        <CardContent>
          <PlaylistForm
            initialData={initialChannelId ? { channelId: initialChannelId } : undefined}
            onSubmit={handleSubmit}
            loading={isLoading}
            submitText="Create Playlist"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePlaylistPage;
