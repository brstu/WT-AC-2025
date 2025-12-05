import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../shared/ui';
import type { Playlist } from '../../shared/types';
import { formatDate } from '../../shared/lib/utils';
import { usePrefetch } from '../../shared/api';
import { Eye, EyeOff, PlaySquare } from 'lucide-react';

interface PlaylistCardProps {
  playlist: Playlist;
  showActions?: boolean;
  onEdit?: (playlist: Playlist) => void;
  onDelete?: (playlist: Playlist) => void;
}

export const PlaylistCard = ({ 
  playlist, 
  showActions = true, 
  onEdit, 
  onDelete 
}: PlaylistCardProps) => {
  // Prefetch: предзагрузка данных плейлиста при наведении
  const prefetchPlaylist = usePrefetch('getPlaylist');

  const handleMouseEnter = () => {
    // Предзагружаем детальную информацию о плейлисте
    prefetchPlaylist(playlist.id, { ifOlderThan: 35 });
  };

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader className="p-0">
        <div className="relative">
          <img
            src={playlist.thumbnailUrl}
            alt={playlist.name}
            className="w-full h-48 object-cover rounded-t-lg"
            loading="lazy"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = `https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=250&fit=crop`;
            }}
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <span className="bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              {playlist.isPublic ? (
                <>
                  <Eye className="h-3 w-3" />
                  Public
                </>
              ) : (
                <>
                  <EyeOff className="h-3 w-3" />
                  Private
                </>
              )}
            </span>
          </div>
          <div className="absolute bottom-2 right-2">
            <span className="bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <PlaySquare className="h-3 w-3" />
              {playlist.videoCount} videos
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">
              <Link 
                to={`/playlists/${playlist.id}`}
                className="hover:text-primary transition-colors"
                onMouseEnter={handleMouseEnter}
              >
                {playlist.name}
              </Link>
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
              {playlist.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <Link
              to={`/channels/${playlist.channelId}`}
              className="text-primary hover:underline text-sm"
            >
              View Channel
            </Link>
            <span className="text-xs text-muted-foreground">
              {formatDate(playlist.updatedAt)}
            </span>
          </div>
          
          {showActions && (
            <div className="flex gap-2 pt-2 border-t">
              <button
                onClick={() => onEdit?.(playlist)}
                className="btn-outline flex-1 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete?.(playlist)}
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
