import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEvents, deleteEvent } from './eventsSlice'
import EventList from '../../components/events/EventList'

const EventsPage = () => {
  const dispatch = useDispatch()
  const { items: events, loading, error } = useSelector(state => state.events)

  useEffect(() => {
    dispatch(fetchEvents())
  }, [dispatch])

  const handleDelete = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить это мероприятие?')) {
      dispatch(deleteEvent(id))
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Все мероприятия</h1>
        <p>Найдено мероприятий: {events.length}</p>
      </div>
      <EventList
        events={events}
        loading={loading}
        error={error}
        onDelete={handleDelete}
      />
    </div>
  )
}

export default EventsPage