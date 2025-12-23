import EventCard from '../common/EventCard'
import Spinner from '../common/Spinner'

const EventList = ({ events, loading, error, onDelete }) => {
  if (loading) {
    return <Spinner />
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        Ошибка загрузки мероприятий: {error}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="empty-state">
        <h3>Мероприятий пока нет</h3>
        <p>Создайте первое мероприятие!</p>
      </div>
    )
  }

  return (
    <div className="event-list">
      {events.map(event => (
        <EventCard
          key={event.id}
          event={event}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default EventList