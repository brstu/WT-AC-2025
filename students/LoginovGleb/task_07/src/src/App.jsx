import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { AppRouter } from './router';
import './App.css';

function App() {
  const { mode } = useSelector((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  return <AppRouter />;
}

export default App;
