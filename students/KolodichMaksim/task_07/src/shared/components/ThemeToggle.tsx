import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      Тема: {theme === 'dark' ? 'Светлая' : 'Тёмная'}
    </button>
  );
}