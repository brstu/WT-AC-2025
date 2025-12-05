import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../shared/ui';
import type { Channel } from '../../shared/types';
import { formatNumber, formatDate } from '../../shared/lib/utils';
import { usePrefetch } from '../../shared/api';

interface ChannelCardProps {
  channel: Channel;
  showActions?: boolean;
  onEdit?: (channel: Channel) => void;
  onDelete?: (channel: Channel) => void;
}

export const ChannelCard = ({ 
  channel, 
  showActions = true, 
  onEdit, 
  onDelete 
}: ChannelCardProps) => {
  // Prefetch: предзагрузка данных канала при наведении
  const prefetchChannel = usePrefetch('getChannel');
  const prefetchPlaylists = usePrefetch('getPlaylists');

  const handleMouseEnter = () => {
    // Предзагружаем детальную информацию о канале
    prefetchChannel(channel.id, { ifOlderThan: 35 });
    // Предзагружаем плейлисты канала
    prefetchPlaylists({ channelId: channel.id, page: 1, limit: 10 }, { ifOlderThan: 35 });
  };

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader className="p-0">
        <div className="relative">
          <img
            src={channel.thumbnailUrl}
            alt={channel.name}
            className="w-full h-48 object-cover rounded-t-lg"
            loading="lazy"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = `https://via.placeholder.com/300x200?text=${encodeURIComponent(channel.name)}`;
            }}
          />
          <div className="absolute top-2 right-2">
            <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
              {channel.category}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">
              <Link 
                to={`/channels/${channel.id}`}
                className="hover:text-primary transition-colors"
                onMouseEnter={handleMouseEnter}
              >
                {channel.name}
              </Link>
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
              {channel.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatNumber(channel.subscriberCount)} subscribers</span>
            <span>{channel.videoCount} videos</span>
          </div>
          
          <div className="flex items-center justify-between">
            <a
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm"
            >
              Visit Channel
            </a>
            <span className="text-xs text-muted-foreground">
              {formatDate(channel.updatedAt)}
            </span>
          </div>
          
          {showActions && (
            <div className="flex gap-2 pt-2 border-t">
              <button
                onClick={() => onEdit?.(channel)}
                className="btn-outline flex-1 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete?.(channel)}
                className="btn bg-destructive text-destructive-foreground hover:bg-destructive/90 flex-1 text-sm"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};