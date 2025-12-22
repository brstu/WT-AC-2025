import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';

import { store } from './app/store';
import { router } from './app/router';
import { useAppSelector } from './app/hooks';

/* ======================
   Theme Initializer
====================== */

const ThemeInitializer = () => {
  const theme = useAppSelector((state) => state.app.theme);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return null;
};

/* ======================
   App
====================== */

function App() {
  return (
    <Provider store={store}>
      <ThemeInitializer />
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;
