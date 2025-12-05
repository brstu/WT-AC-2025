import { Link } from 'react-router-dom';
import { Plus, TrendingUp, Users, Video, ArrowRight } from 'lucide-react';
import { Button, Card, CardContent, LoadingState } from '../shared/ui';
import { ChannelCard } from '../features/channels/ChannelCard';
import { useGetChannelsQuery } from '../shared/api';
import type { Channel } from '../shared/types';

const HomePage = () => {
  const { data: channelsResponse, isLoading } = useGetChannelsQuery({ limit: 6 });
  const channels = channelsResponse?.data || [];

  const stats = {
    totalChannels: channels.length,
    totalSubscribers: channels.reduce((sum: number, channel: Channel) => sum + channel.subscriberCount, 0),
    totalVideos: channels.reduce((sum: number, channel: Channel) => sum + channel.videoCount, 0),
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center py-12 mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          YouTube Channels Catalog
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Discover, organize, and manage your favorite YouTube channels and playlists in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/channels">
              Browse Channels
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/channels/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Channel
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(stats.totalChannels)}</p>
                <p className="text-muted-foreground">Channels</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(stats.totalSubscribers)}</p>
                <p className="text-muted-foreground">Total Subscribers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                <Video className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(stats.totalVideos)}</p>
                <p className="text-muted-foreground">Total Videos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Channels */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Featured Channels</h2>
            <p className="text-muted-foreground">
              Discover popular channels in your catalog
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/channels">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <LoadingState>Loading featured channels...</LoadingState>
        ) : channels.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="bg-muted p-4 rounded-full w-fit mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No channels yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first YouTube channel
              </p>
              <Button asChild>
                <Link to="/channels/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Channel
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels.slice(0, 6).map((channel: Channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                showActions={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-muted/50 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Why Choose Our Catalog?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary/10 p-4 rounded-lg w-fit mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Easy Organization</h3>
            <p className="text-muted-foreground">
              Organize your favorite channels by categories and create custom playlists
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg w-fit mx-auto mb-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Track Statistics</h3>
            <p className="text-muted-foreground">
              Keep track of subscriber counts, video numbers, and channel growth
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900/20 p-4 rounded-lg w-fit mx-auto mb-4">
              <Video className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Playlist Management</h3>
            <p className="text-muted-foreground">
              Create and manage playlists for different channels and topics
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Start building your YouTube channels catalog today and never lose track of your favorite content creators.
        </p>
        <Button size="lg" asChild>
          <Link to="/channels/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Channel
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default HomePage;