import { Link } from 'react-router-dom';
import { Home, Film, Frown } from 'lucide-react';
import { Button } from '../shared/ui';

const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-muted rounded-full p-6">
            <Frown className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link to="/movies">
              <Film className="h-4 w-4 mr-2" />
              Browse Movies
            </Link>
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            Try going back to the{' '}
            <Link to="/movies" className="text-primary hover:underline">
              movies catalog
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
