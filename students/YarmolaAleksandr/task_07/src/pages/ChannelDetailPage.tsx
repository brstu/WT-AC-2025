import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Users, Video, Calendar, Edit, Trash2 } from 'lucide-react';
import { Button, Card, CardHeader, CardContent, LoadingState, ErrorState } from '../shared/ui';
import type { Playlist } from '../shared/types';
import { useGetChannelQuery, useGetPlaylistsQuery, useDeleteChannelMutation } from '../shared/api';
import { useAppDispatch } from '../app/hooks';
import { addNotification } from '../app/appSlice';
import { formatNumber, formatDate } from '../shared/lib/utils';
import toast from 'react-hot-toast';

const ChannelDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: channelResponse, isLoading, refetch } = useGetChannelQuery(id!);
  const { data: playlistsResponse } = useGetPlaylistsQuery({ channelId: id });
  const [deleteChannel, { isLoading: isDeleting }] = useDeleteChannelMutation();

  const channel = channelResponse;
  const playlists = Array.isArray(playlistsResponse) ? playlistsResponse : [];

  const handleDelete = async () => {
    if (!channel || !confirm(`Are you sure you want to delete "${channel.name}"?`)) {
      return;
    }

    try {
      await deleteChannel(channel.id).unwrap();
      toast.success('Channel deleted successfully');
      dispatch(addNotification({
        type: 'success',
        title: 'Channel Deleted',
        message: `"${channel.name}" has been removed`,
      }));
      navigate('/channels');
    } catch (error) {
      toast.error('Failed to delete channel');
      console.log(error);
      dispatch(addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Could not delete the channel. Please try again.',
      }));
    }
  };

  if (isLoading) {
    return <LoadingState>Loading channel details...</LoadingState>;
  }

  if (!channel) {
    return (
      <ErrorState
        title="Channel not found"
        message="The requested channel could not be found."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/channels">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Channels
          </Link>
        </Button>
      </div>

      {/* Channel Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-6">
                <img
                  src={channel.thumbnailUrl}
                  alt={channel.name}
                  className="w-32 h-32 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = `https://via.placeholder.com/128x128?text=${encodeURIComponent(channel.name)}`;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold mb-2">{channel.name}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground mb-4">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {formatNumber(channel.subscriberCount)} subscribers
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      {channel.videoCount} videos
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Updated {formatDate(channel.updatedAt)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                      {channel.category}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{channel.description}</p>
              <div className="flex gap-3">
                <Button asChild>
                  <a
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Channel
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/channels/${channel.id}/edit`}>
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

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Channel Statistics</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subscribers</span>
                <span className="font-medium">{formatNumber(channel.subscriberCount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Videos</span>
                <span className="font-medium">{channel.videoCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Playlists</span>
                <span className="font-medium">{playlists.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{channel.category}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Playlists Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Playlists ({playlists.length})</h2>
            <Button size="sm" asChild>
              <Link to="/playlists/new" state={{ channelId: channel.id }}>
                Add Playlist
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {playlists.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No playlists found for this channel</p>
              <Button asChild>
                <Link to="/playlists/new" state={{ channelId: channel.id }}>
                  Create First Playlist
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.map((playlist: Playlist) => (
                <Card key={playlist.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="p-0">
                    <img
                      src={playlist.thumbnailUrl}
                      alt={playlist.name}
                      className="w-full h-32 object-cover rounded-t-lg"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = `https://via.placeholder.com/300x128?text=${encodeURIComponent(playlist.name)}`;
                      }}
                    />
                  </CardHeader>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2 line-clamp-1">
                      <Link
                        to={`/playlists/${playlist.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {playlist.name}
                      </Link>
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {playlist.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span>{playlist.videoCount} videos</span>
                      <span className={playlist.isPublic ? 'text-green-600' : 'text-yellow-600'}>
                        {playlist.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChannelDetailPage;