import { Link } from 'react-router-dom'
import './EventCard.css'

const EventCard = ({ event, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'cancelled': return 'danger'
      case 'completed': return 'secondary'
      default: return 'light'
    }
  }

  return (
    <div className="event-card">
      <div className="event-card-header">
        <h3 className="event-card-title">
          <Link to={`/events/${event.id}`}>{event.title}</Link>
        </h3>
        <span className={`event-status status-${getStatusColor(event.status)}`}>
          {event.status === 'active' ? 'Активно' : 
           event.status === 'cancelled' ? 'Отменено' : 'Завершено'}
        </span>
      </div>
      
      <div className="event-card-body">
        <p className="event-description">{event.description}</p>
        
        <div className="event-details">
          <div className="event-detail">
            <strong>Дата:</strong> {formatDate(event.date)}
          </div>
          <div className="event-detail">
            <strong>Место:</strong> {event.location}
          </div>
          <div className="event-detail">
            <strong>Категория:</strong> {event.category}
          </div>
          <div className="event-detail">
            <strong>Участники:</strong> {event.currentParticipants}/{event.maxParticipants}
          </div>
        </div>
      </div>
      
      <div className="event-card-footer">
        <Link to={`/events/${event.id}`} className="btn btn-outline">
          Подробнее
        </Link>
        <Link to={`/events/${event.id}/edit`} className="btn btn-outline">
          Редактировать
        </Link>
        {onDelete && (
          <button 
            onClick={() => onDelete(event.id)} 
            className="btn btn-danger"
          >
            Удалить
          </button>
        )}
      </div>
    </div>
  )
}

export default EventCard