import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navigation } from './Navigation';
import { NotificationProvider } from './NotificationProvider';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Outlet />
      </main>
      <NotificationProvider />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'bg-background text-foreground border border-border',
        }}
      />
    </div>
  );
};