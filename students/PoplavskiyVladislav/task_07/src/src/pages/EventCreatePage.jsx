import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { createEvent } from '../features/events/eventsSlice'
import EventForm from '../components/events/EventForm'
import Spinner from '../components/common/Spinner'

const EventCreatePage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading } = useSelector(state => state.events)

  const handleSubmit = (data) => {
    dispatch(createEvent(data)).then(() => {
      navigate('/events')
    })
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Создание нового мероприятия</h1>
        <p>Заполните все обязательные поля для создания мероприятия</p>
      </div>
      
      <div className="form-container">
        <EventForm
          onSubmit={handleSubmit}
          isSubmitting={loading}
        />
      </div>
    </div>
  )
}

export default EventCreatePage