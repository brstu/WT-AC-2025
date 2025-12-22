import { useMemo } from 'react';
import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import {
  Button,
  LoadingState,
  ErrorState,
  EmptyState,
} from '../shared/ui';
import { MovieCard } from '../features/movies/MovieCard';
import {
  useGetMoviesQuery,
  useDeleteMovieMutation,
} from '../shared/api';
import { useAppDispatch } from '../app/hooks';
import { addNotification } from '../app/appSlice';
import { debounce } from '../shared/lib/utils';
import toast from 'react-hot-toast';

const MoviesPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // 🔎 search из URL
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';

  const {
    data: moviesResponse,
    error,
    isLoading,
    refetch,
  } = useGetMoviesQuery({
    page: 1,
    limit: 50,
    search: search || undefined,
  });

  const [deleteMovie, { isLoading: isDeleting }] =
    useDeleteMovieMutation();

  const movies = moviesResponse?.data || [];

  // ⏱ debounce + запись в URL
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchParams(
          value ? { search: value } : {},
          { replace: true }
        );
      }, 300),
    [setSearchParams]
  );

  const handleSearch = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    debouncedSearch(e.target.value);
  };

  const handleEdit = (movie: { id: string }) => {
    navigate(`/movies/${movie.id}/edit`);
  };

  const handleDelete = async (movie: {
    id: string;
    title: string;
  }) => {
    if (!confirm(`Delete movie "${movie.title}"?`)) return;

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
    return <LoadingState>Loading movies...</LoadingState>;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load movies"
        message="An error occurred while loading the movie list."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">
            Movies Catalog
          </h1>
          <p className="text-muted-foreground">
            Browse, create and manage movies
          </p>
        </div>

        <Button asChild>
          <Link to="/movies/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Movie
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            placeholder="Search movies..."
            className="input pl-10"
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Result info */}
      <p className="text-sm text-muted-foreground mb-4">
        Found {movies.length} movie
        {movies.length !== 1 && 's'}
        {search && ` matching "${search}"`}
      </p>

      {/* List */}
      {movies.length === 0 ? (
        <EmptyState
          title="No movies found"
          message={
            search
              ? 'Try changing your search query'
              : 'Start by adding your first movie'
          }
          action={
            <Button asChild>
              <Link to="/movies/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Movie
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Deleting overlay */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg">
            <LoadingState>Deleting movie...</LoadingState>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
