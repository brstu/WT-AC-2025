import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { router } from './app/router';
import { useAppSelector } from './app/hooks';

// Theme initializer component
const ThemeInitializer = () => {
  const theme = useAppSelector((state) => state.app.theme);

  useEffect(() => {
    // Initialize theme on app start
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return null;
};

// App wrapper with providers
const AppContent = () => {
  return (
    <>
      <ThemeInitializer />
      <RouterProvider router={router} />
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
