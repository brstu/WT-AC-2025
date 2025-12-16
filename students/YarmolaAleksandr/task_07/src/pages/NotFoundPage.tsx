import { Link } from 'react-router-dom';
import { Home, Frown } from 'lucide-react';
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
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
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
            <Link to="/channels">
              Browse Channels
            </Link>
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            Lost? Try searching for{' '}
            <Link to="/channels" className="text-primary hover:underline">
              channels
            </Link>{' '}
            or{' '}
            <Link to="/playlists" className="text-primary hover:underline">
              playlists
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;