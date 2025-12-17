import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, PlaySquare, Eye, EyeOff, Calendar } from 'lucide-react';
import { Button, Card, CardHeader, CardContent, LoadingState, ErrorState } from '../shared/ui';
import { useGetPlaylistQuery, useGetChannelQuery, useDeletePlaylistMutation } from '../shared/api';
import { useAppDispatch } from '../app/hooks';
import { addNotification } from '../app/appSlice';
import { formatDate } from '../shared/lib/utils';
import toast from 'react-hot-toast';

const PlaylistDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: playlist, isLoading, refetch } = useGetPlaylistQuery(id!);
  const { data: channel } = useGetChannelQuery(playlist?.channelId || '', {
    skip: !playlist?.channelId,
  });
  const [deletePlaylist, { isLoading: isDeleting }] = useDeletePlaylistMutation();

  const handleDelete = async () => {
    if (!playlist || !confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      return;
    }

    try {
      await deletePlaylist(playlist.id).unwrap();
      toast.success('Playlist deleted successfully');
      dispatch(addNotification({
        type: 'success',
        title: 'Playlist Deleted',
        message: `"${playlist.name}" has been removed`,
      }));
      navigate('/playlists');
    } catch (error) {
      console.log(error);
      toast.error('Failed to delete playlist');
      dispatch(addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Could not delete the playlist. Please try again.',
      }));
    }
  };

  if (isLoading) {
    return <LoadingState>Loading playlist details...</LoadingState>;
  }

  if (!playlist) {
    return (
      <ErrorState
        title="Playlist not found"
        message="The requested playlist could not be found."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/playlists">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Playlists
          </Link>
        </Button>
      </div>

      {/* Playlist Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-6">
                <img
                  src={playlist.thumbnailUrl}
                  alt={playlist.name}
                  className="w-48 h-32 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = `https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=250&fit=crop`;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold mb-2">{playlist.name}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground mb-4">
                    <span className="inline-flex items-center gap-1">
                      <PlaySquare className="h-4 w-4" />
                      {playlist.videoCount} videos
                    </span>
                    <span className="inline-flex items-center gap-1">
                      {playlist.isPublic ? (
                        <>
                          <Eye className="h-4 w-4" />
                          Public
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Private
                        </>
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Updated {formatDate(playlist.updatedAt)}
                    </span>
                  </div>
                  {channel && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-sm text-muted-foreground">
                        From channel:{' '}
                        <Link
                          to={`/channels/${channel.id}`}
                          className="text-primary hover:underline"
                        >
                          {channel.name}
                        </Link>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{playlist.description}</p>
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <Link to={`/playlists/${playlist.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  loading={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Playlist Information</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Videos</span>
                <span className="font-medium">{playlist.videoCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Visibility</span>
                <span className="font-medium">
                  {playlist.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{formatDate(playlist.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">{formatDate(playlist.updatedAt)}</span>
              </div>
              {channel && (
                <div className="pt-3 border-t">
                  <span className="text-muted-foreground text-sm">Channel</span>
                  <div className="mt-2">
                    <Link
                      to={`/channels/${channel.id}`}
                      className="flex items-center gap-2 hover:bg-accent p-2 rounded-md transition-colors"
                    >
                      <img
                        src={channel.thumbnailUrl}
                        alt={channel.name}
                        className="w-10 h-10 rounded object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = `https://via.placeholder.com/40x40?text=${encodeURIComponent(channel.name.charAt(0))}`;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{channel.name}</p>
                        <p className="text-xs text-muted-foreground">{channel.category}</p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Videos Section */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Videos ({playlist.videoCount})</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <PlaySquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              {playlist.videoCount > 0
                ? `This playlist contains ${playlist.videoCount} videos`
                : 'No videos in this playlist yet'}
            </p>
            <p className="text-sm text-muted-foreground">
              Video management feature coming soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaylistDetailPage;
