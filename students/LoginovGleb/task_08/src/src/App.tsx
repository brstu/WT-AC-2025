import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { AppRouter } from './router';
import './App.css';
import type { RootState } from './store';

function App() {
  const { mode } = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  return <AppRouter />;
}

export default App;
