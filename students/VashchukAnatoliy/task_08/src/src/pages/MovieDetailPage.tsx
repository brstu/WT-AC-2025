import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Star, Edit, Trash2 } from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  LoadingState,
  ErrorState,
} from '../shared/ui';
import { useGetMovieQuery, useDeleteMovieMutation } from '../shared/api';
import { useAppDispatch } from '../app/hooks';
import { addNotification } from '../app/appSlice';
import { formatDate } from '../shared/lib/utils';
import toast from 'react-hot-toast';

const MovieDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    data: movie,
    isLoading,
    refetch,
  } = useGetMovieQuery(id!);

  const [deleteMovie, { isLoading: isDeleting }] =
    useDeleteMovieMutation();

  const handleDelete = async () => {
    if (!movie || !confirm(`Delete movie "${movie.title}"?`)) return;

    try {
      await deleteMovie(movie.id).unwrap();
      toast.success('Movie deleted');
      dispatch(
        addNotification({
          type: 'success',
          title: 'Movie deleted',
          message: `"${movie.title}" was removed`,
        })
      );
      navigate('/movies');
    } catch {
      toast.error('Failed to delete movie');
      dispatch(
        addNotification({
          type: 'error',
          title: 'Delete failed',
          message: 'Could not delete the movie',
        })
      );
    }
  };

  if (isLoading) {
    return <LoadingState>Loading movie details...</LoadingState>;
  }

  if (!movie) {
    return (
      <ErrorState
        title="Movie not found"
        message="The requested movie does not exist."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link to="/movies">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Movies
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Movie card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex gap-6">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-40 h-60 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://via.placeholder.com/160x240?text=No+Image';
                  }}
                />

                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">
                    {movie.title}
                  </h1>

                  <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {movie.year}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {movie.rating}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      Updated {formatDate(movie.updatedAt)}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" asChild>
                      <Link to={`/movies/${movie.id}/edit`}>
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
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-muted-foreground">
                {movie.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <div>
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Movie Info</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Year</span>
                <span>{movie.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rating</span>
                <span>{movie.rating}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(movie.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;
