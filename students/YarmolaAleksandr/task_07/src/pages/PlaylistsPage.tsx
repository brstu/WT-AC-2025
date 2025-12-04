import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { Button, LoadingState, ErrorState, EmptyState } from '../shared/ui';
import { PlaylistCard } from '../features/playlists';
import { useGetPlaylistsQuery, useDeletePlaylistMutation, useGetChannelsQuery } from '../shared/api';
import { useAppDispatch } from '../app/hooks';
import { addNotification } from '../app/appSlice';
import { debounce } from '../shared/lib/utils';
import toast from 'react-hot-toast';

const PlaylistsPage = () => {
  const [searchParams] = useSearchParams();
  const channelIdFromUrl = searchParams.get('channelId');
  
  const [search, setSearch] = useState('');
  const [channelId, setChannelId] = useState(channelIdFromUrl || '');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { data: playlistsResponse, error, isLoading, refetch } = useGetPlaylistsQuery({
    channelId: channelId || undefined,
    page: 1,
    limit: 50,
  });

  const { data: channelsResponse } = useGetChannelsQuery({ limit: 100 });
  const channels = channelsResponse?.data || [];

  const [deletePlaylist, { isLoading: isDeleting }] = useDeletePlaylistMutation();

  const playlists = playlistsResponse?.data || [];

  const filteredPlaylists = useMemo(() => {
    if (!Array.isArray(playlists)) return [];
    if (!search) return playlists;
    
    const searchLower = search.toLowerCase();
    return playlists.filter(playlist => 
      playlist.name.toLowerCase().includes(searchLower) ||
      playlist.description?.toLowerCase().includes(searchLower)
    );
  }, [playlists, search]);

  const debouncedSearch = useMemo(
    () => debounce((value: string) => setSearch(value), 300),
    []
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleEdit = (playlist: { id: string }) => {
    navigate(`/playlists/${playlist.id}/edit`);
  };

  const handleDelete = async (playlist: { id: string; name: string }) => {
    if (!confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
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
    return <LoadingState>Loading playlists...</LoadingState>;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load playlists"
        message="There was an error loading the playlists. Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">YouTube Playlists</h1>
          <p className="text-muted-foreground">
            Browse and manage your playlists collection
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/playlists/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Playlist
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search playlists..."
              className="input pl-10"
              onChange={handleSearch}
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="input pl-10 min-w-[200px]"
            >
              <option value="">All Channels</option>
              {channels.map(channel => (
                <option key={channel.id} value={channel.id}>{channel.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredPlaylists.length} of {Array.isArray(playlists) ? playlists.length : 0} playlists
          {search && ` matching "${search}"`}
          {channelId && ` from selected channel`}
        </p>
      </div>

      {filteredPlaylists.length === 0 ? (
        <EmptyState
          title="No playlists found"
          message={
            search || channelId
              ? "Try adjusting your search or filter criteria"
              : "Get started by creating your first playlist"
          }
          action={
            <Button asChild>
              <Link to="/playlists/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Playlist
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlaylists.map(playlist => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {isDeleting && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg">
            <LoadingState>Deleting playlist...</LoadingState>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistsPage;
