import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEventById, deleteEvent, clearCurrentEvent } from '../features/events/eventsSlice'
import Spinner from '../components/common/Spinner'

const EventDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentEvent, loading, error } = useSelector(state => state.events)

  useEffect(() => {
    dispatch(fetchEventById(id))

    return () => {
      dispatch(clearCurrentEvent())
    }
  }, [dispatch, id])

  const handleDelete = () => {
    if (window.confirm('Вы уверены, что хотите удалить это мероприятие?')) {
      dispatch(deleteEvent(id)).then(() => {
        navigate('/events')
      })
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <Spinner />
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Ошибка</h2>
        <p>{error}</p>
        <Link to="/events" className="btn btn-primary">
          Вернуться к списку
        </Link>
      </div>
    )
  }

  if (!currentEvent) {
    return (
      <div className="empty-container">
        <h2>Мероприятие не найдено</h2>
        <Link to="/events" className="btn btn-primary">
          Вернуться к списку
        </Link>
      </div>
    )
  }

  const participantsPercentage = Math.round(
    (currentEvent.currentParticipants / currentEvent.maxParticipants) * 100
  )

  return (
    <div className="event-detail">
      <div className="event-header">
        <div className="event-title-section">
          <h1>{currentEvent.title}</h1>
          <span className={`event-status status-${currentEvent.status}`}>
            {currentEvent.status === 'active' ? 'Активно' : 
             currentEvent.status === 'cancelled' ? 'Отменено' : 'Завершено'}
          </span>
        </div>
        
        <div className="event-actions">
          <Link to={`/events/${id}/edit`} className="btn btn-primary">
            Редактировать
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            Удалить
          </button>
          <Link to="/events" className="btn btn-outline">
            Назад
          </Link>
        </div>
      </div>

      <div className="event-content">
        <div className="event-main">
          <div className="event-description-section">
            <h3>Описание</h3>
            <p>{currentEvent.description}</p>
          </div>

          <div className="event-details-grid">
            <div className="detail-item">
              <h4>📅 Дата и время</h4>
              <p>{formatDate(currentEvent.date)}</p>
            </div>
            <div className="detail-item">
              <h4>📍 Место проведения</h4>
              <p>{currentEvent.location}</p>
            </div>
            <div className="detail-item">
              <h4>🏷️ Категория</h4>
              <p>{currentEvent.category}</p>
            </div>
            <div className="detail-item">
              <h4>👥 Участники</h4>
              <div className="participants-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${participantsPercentage}%` }}
                  ></div>
                </div>
                <span className="participants-count">
                  {currentEvent.currentParticipants}/{currentEvent.maxParticipants}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="event-sidebar">
          <div className="sidebar-card">
            <h3>Информация о мероприятии</h3>
            <ul className="info-list">
              <li>
                <strong>Создано:</strong>
                <span>{formatDate(currentEvent.createdAt)}</span>
              </li>
              <li>
                <strong>Обновлено:</strong>
                <span>{formatDate(currentEvent.updatedAt)}</span>
              </li>
              <li>
                <strong>ID:</strong>
                <span>{currentEvent.id}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetailPage