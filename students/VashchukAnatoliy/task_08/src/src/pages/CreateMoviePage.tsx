import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, CardHeader, CardContent } from '../shared/ui';
import { MovieForm } from '../features/movies/MovieForm';
import { useCreateMovieMutation } from '../shared/api';
import { useAppDispatch } from '../app/hooks';
import { addNotification } from '../app/appSlice';
import type { MovieFormData } from '../shared/lib/validations';
import toast from 'react-hot-toast';

const CreateMoviePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [createMovie, { isLoading }] = useCreateMovieMutation();

  const handleSubmit = async (data: MovieFormData) => {
    try {
        await createMovie({
        ...data,
        posterUrl: data.posterUrl ?? '',
        }).unwrap();

        toast.success('Movie created successfully');
        dispatch(
        addNotification({
            type: 'success',
            title: 'Movie created',
            message: `"${data.title}" has been added`,
        })
        );

        navigate('/movies');
    } catch (err) {
        const error = err as { data?: { message?: string } };
        toast.error('Failed to create movie');
        dispatch(
        addNotification({
            type: 'error',
            title: 'Creation failed',
            message:
            error?.data?.message ||
            'Could not create the movie. Please try again.',
        })
        );
    }
  };


  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link to="/movies">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Movies
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Add New Movie</h1>
          <p className="text-muted-foreground">
            Fill in the movie information
          </p>
        </CardHeader>

        <CardContent>
          <MovieForm
            onSubmit={handleSubmit}
            loading={isLoading}
            submitText="Create Movie"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateMoviePage;
