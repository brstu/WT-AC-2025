import { Link } from 'react-router-dom';
import { Pencil, Trash2, Star } from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
} from '../../shared/ui';
import type { Movie } from '../../shared/types';
import { formatDate } from '../../shared/lib/utils';
import { api } from '../../shared/api';

interface MovieCardProps {
  movie: Movie;
  showActions?: boolean;
  onEdit?: (movie: Movie) => void;
  onDelete?: (movie: Movie) => void;
}

export const MovieCard = ({
  movie,
  showActions = true,
  onEdit,
  onDelete,
}: MovieCardProps) => {
  const prefetchMovie = api.usePrefetch('getMovie');

  return (
    <Card className="group overflow-hidden flex flex-col h-full transition-all hover:shadow-lg">
      {/* Poster */}
      <div className="relative aspect-[2/3] bg-muted overflow-hidden">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          onMouseEnter={() =>
            prefetchMovie(movie.id, { ifOlderThan: 30 })
          }
          onError={(e) => {
            e.currentTarget.src =
              'https://via.placeholder.com/400x600?text=No+Image';
          }}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Rating badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          {movie.rating.toFixed(1)}
        </div>
      </div>

      {/* Content */}
      <CardContent className="flex flex-col flex-1 p-4">
        <div className="flex-1 space-y-2">
          <h3 className="text-base font-semibold leading-tight line-clamp-1">
            <Link
              to={`/movies/${movie.id}`}
              className="hover:text-primary transition-colors"
            >
              {movie.title}
            </Link>
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {movie.description}
          </p>
        </div>

        {/* Meta */}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{movie.year}</span>
          <span>Updated {formatDate(movie.updatedAt)}</span>
        </div>

        {/* Actions */}
        {showActions && (onEdit || onDelete) && (
          <div className="mt-4 flex gap-2 border-t pt-3">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onEdit(movie)}
              >
                <Pencil className="mr-1 h-4 w-4" />
                Edit
              </Button>
            )}

            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={() => onDelete(movie)}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
