import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  LoadingState,
  ErrorState,
} from '../shared/ui';
import { MovieForm } from '../features/movies/MovieForm';
import {
  useGetMovieQuery,
  useUpdateMovieMutation,
} from '../shared/api';
import { useAppDispatch } from '../app/hooks';
import { addNotification } from '../app/appSlice';
import type { MovieFormData } from '../shared/lib/validations';
import toast from 'react-hot-toast';

const EditMoviePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    data: movie,
    error,
    isLoading: isFetching,
    refetch,
  } = useGetMovieQuery(id!);

  const [updateMovie, { isLoading: isUpdating }] =
    useUpdateMovieMutation();

  const handleSubmit = async (data: MovieFormData) => {
    if (!movie) return;

    try {
      await updateMovie({
        id: movie.id,
        movie: { ...data }, // ⬅️ всегда новая копия
      }).unwrap();

      toast.success('Movie updated');

      dispatch(
        addNotification({
          type: 'success',
          title: 'Movie updated',
          message: `"${data.title}" has been updated`,
        })
      );

      navigate(`/movies/${movie.id}`);
    } catch (err) {
      const error = err as { data?: { message?: string } };

      toast.error('Failed to update movie');

      dispatch(
        addNotification({
          type: 'error',
          title: 'Update failed',
          message:
            error?.data?.message ||
            'Could not update the movie. Please try again.',
        })
      );
    }
  };

  if (isFetching) {
    return <LoadingState>Loading movie...</LoadingState>;
  }

  if (error || !movie) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <ErrorState
          title="Movie not found"
          message="The requested movie could not be found."
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link to={`/movies/${movie.id}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Movie
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Edit Movie</h1>
          <p className="text-muted-foreground">
            Update details for "{movie.title}"
          </p>
        </CardHeader>

        <CardContent>
          <MovieForm
            initialData={{
              ...movie,
              // ⬇️ если есть массивы — ОБЯЗАТЕЛЬНО копировать
              genres: movie.genres ? [...movie.genres] : [],
            }}
            onSubmit={handleSubmit}
            loading={isUpdating}
            submitText="Update Movie"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditMoviePage;
