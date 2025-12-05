import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, CardHeader, CardContent, LoadingState, ErrorState } from '../shared/ui';
import { PlaylistForm } from '../features/playlists';
import { useGetPlaylistQuery, useUpdatePlaylistMutation } from '../shared/api';
import { useAppDispatch } from '../app/hooks';
import { addNotification } from '../app/appSlice';
import type { PlaylistFormData } from '../shared/lib/validations';
import toast from 'react-hot-toast';

const EditPlaylistPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: playlist, error, isLoading: isFetching, refetch } = useGetPlaylistQuery(id!);
  const [updatePlaylist, { isLoading: isUpdating }] = useUpdatePlaylistMutation();

  const handleSubmit = async (data: PlaylistFormData) => {
    if (!playlist) return;

    try {
      await updatePlaylist({
        id: playlist.id,
        playlist: data,
      }).unwrap();

      toast.success('Playlist updated successfully!');
      dispatch(addNotification({
        type: 'success',
        title: 'Playlist Updated',
        message: `"${data.name}" has been updated`,
      }));

      navigate(`/playlists/${playlist.id}`);
    } catch (err) {
      const error = err as { data?: { message?: string } };
      console.error('Error updating playlist:', error);
      toast.error('Failed to update playlist');
      dispatch(addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error?.data?.message || 'Could not update the playlist. Please try again.',
      }));
    }
  };

  if (isFetching) {
    return <LoadingState>Loading playlist details...</LoadingState>;
  }

  if (error || !playlist) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <ErrorState
          title="Playlist not found"
          message="The requested playlist could not be found."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/playlists/${playlist.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Playlist
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Edit Playlist</h1>
          <p className="text-muted-foreground">
            Update the details for "{playlist.name}"
          </p>
        </CardHeader>
        <CardContent>
          <PlaylistForm
            initialData={playlist}
            onSubmit={handleSubmit}
            loading={isUpdating}
            submitText="Update Playlist"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditPlaylistPage;
