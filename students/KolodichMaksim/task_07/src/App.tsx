import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Routes from './routes';
import { ThemeProvider } from './shared/hooks/useTheme';
import { AuthProvider } from './features/auth/useAuth';
import ThemeToggle from './shared/components/ThemeToggle';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <div style={{ padding: '20px' }}>
            <ThemeToggle />
            <Routes />
          </div>
          <ToastContainer position="top-right" autoClose={3000} />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;