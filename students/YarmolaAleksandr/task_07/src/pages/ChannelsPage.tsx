import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { Button, LoadingState, ErrorState, EmptyState } from '../shared/ui';
import { ChannelCard } from '../features/channels/ChannelCard';
import { useGetChannelsQuery, useDeleteChannelMutation } from '../shared/api';
import { useAppDispatch } from '../app/hooks';
import { addNotification } from '../app/appSlice';
import { debounce } from '../shared/lib/utils';
import toast from 'react-hot-toast';

const ChannelsPage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { data: channelsResponse, error, isLoading, refetch } = useGetChannelsQuery({
    page: 1,
    limit: 50,
    search: search || undefined,
  });

  const [deleteChannel, { isLoading: isDeleting }] = useDeleteChannelMutation();

  const channels = channelsResponse?.data || [];

  const filteredChannels = useMemo(() => {
    if (!Array.isArray(channels)) return [];
    if (!category) return channels;
    return channels.filter(channel => channel.category === category);
  }, [channels, category]);

  const categories = useMemo(() => {
    if (!Array.isArray(channels)) return [];
    const cats = [...new Set(channels.map(channel => channel.category))];
    return cats.sort();
  }, [channels]);

  const debouncedSearch = useMemo(
    () => debounce((value: string) => setSearch(value), 300),
    []
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleEdit = (channel: any) => {
    navigate(`/channels/${channel.id}/edit`);
  };

  const handleDelete = async (channel: any) => {
    if (!confirm(`Are you sure you want to delete "${channel.name}"?`)) {
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
    } catch (error) {
      toast.error('Failed to delete channel');
      dispatch(addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Could not delete the channel. Please try again.',
      }));
    }
  };

  if (isLoading) {
    return <LoadingState>Loading channels...</LoadingState>;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load channels"
        message="There was an error loading the channels. Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">YouTube Channels</h1>
          <p className="text-muted-foreground">
            Discover and manage your favorite YouTube channels
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/channels/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Channel
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
              placeholder="Search channels..."
              className="input pl-10"
              onChange={handleSearch}
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input pl-10 min-w-[150px]"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredChannels.length} of {Array.isArray(channels) ? channels.length : 0} channels
          {search && ` matching "${search}"`}
          {category && ` in "${category}"`}
        </p>
      </div>

      {filteredChannels.length === 0 ? (
        <EmptyState
          title="No channels found"
          message={
            search || category
              ? "Try adjusting your search or filter criteria"
              : "Get started by adding your first YouTube channel"
          }
          action={
            <Button asChild>
              <Link to="/channels/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Channel
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredChannels.map(channel => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {isDeleting && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg">
            <LoadingState>Deleting channel...</LoadingState>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelsPage;