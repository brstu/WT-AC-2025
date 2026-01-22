import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAppSelector } from '../store/hooks';
import './HomePage.css';

export const HomePage = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Каталог игр Game Library</h1>
        <p className="hero-subtitle">
          Управляйте коллекцией игр с помощью современного веб-приложения
        </p>

        {isAuthenticated ? (
          <Link to="/games">
            <Button>Перейти к каталогу</Button>
          </Link>
        ) : (
          <Link to="/login">
            <Button>Войти в систему</Button>
          </Link>
        )}
      </div>

      <div className="features-section">
        <h2>Возможности системы</h2>
        <div className="features-grid">
          <Card>
            <h3>🎮 Каталог игр</h3>
            <p>Полная библиотека игр с детальной информацией</p>
          </Card>

          <Card>
            <h3>🔍 Поиск и фильтрация</h3>
            <p>Быстрый поиск игр по названию, жанру, платформе</p>
          </Card>

          <Card>
            <h3>⭐ Рейтинги и отзывы</h3>
            <p>Система оценок и рекомендаций</p>
          </Card>

          <Card>
            <h3>📊 Статистика</h3>
            <p>Отслеживание вашей игровой активности</p>
          </Card>

          <Card>
            <h3>🎯 Персонализация</h3>
            <p>Создайте свою уникальную коллекцию</p>
          </Card>

          <Card>
            <h3>🔐 Безопасность</h3>
            <p>Защищённый доступ с аутентификацией</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
