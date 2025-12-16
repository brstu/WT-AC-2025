import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Home.css'

const Home = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Добро пожаловать в мир настольных игр! 🎲</h1>
          <p>Откройте для себя лучшие настольные игры, оценивайте их и делитесь своими впечатлениями</p>
          <div className="hero-actions">
            <Link to="/games" className="btn-primary">
              Смотреть все игры
            </Link>
            {isAuthenticated && (
              <Link to="/games/new" className="btn-secondary">
                Добавить игру
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <h3>🎯 Большая коллекция</h3>
          <p>Найдите идеальную игру для любой компании и настроения</p>
        </div>
        <div className="feature">
          <h3>⭐ Честные рейтинги</h3>
          <p>Оценки от реальных игроков помогут сделать правильный выбор</p>
        </div>
        <div className="feature">
          <h3>👥 Сообщество</h3>
          <p>Присоединяйтесь к сообществу любителей настольных игр</p>
        </div>
      </section>
    </div>
  )
}

export default Home