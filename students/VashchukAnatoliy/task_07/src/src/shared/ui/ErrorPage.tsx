import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Button } from './Button';

const ErrorPage = () => {
  const error = useRouteError();

  let title = 'Something went wrong';
  let message = 'An unexpected error occurred';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = error.data?.message || 'Page not found';
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-3xl font-bold">{title}</h1>
      <p className="mb-6 text-muted-foreground">{message}</p>

      <Button onClick={() => window.location.href = '/'}>
        Go to Home
      </Button>
    </div>
  );
};

export { ErrorPage };
