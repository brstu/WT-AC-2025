import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEventById, updateEvent, clearCurrentEvent } from '../features/events/eventsSlice'
import EventForm from '../components/events/EventForm'
import Spinner from '../components/common/Spinner'

const EventEditPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentEvent, loading } = useSelector(state => state.events)

  useEffect(() => {
    dispatch(fetchEventById(id))

    return () => {
      dispatch(clearCurrentEvent())
    }
  }, [dispatch, id])

  const handleSubmit = (data) => {
    dispatch(updateEvent({ id, eventData: data })).then(() => {
      navigate(`/events/${id}`)
    })
  }

  if (loading || !currentEvent) {
    return <Spinner />
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Редактирование мероприятия</h1>
        <p>Внесите необходимые изменения в информацию о мероприятии</p>
      </div>
      
      <div className="form-container">
        <EventForm
          onSubmit={handleSubmit}
          initialData={currentEvent}
          isSubmitting={loading}
        />
      </div>
    </div>
  )
}

export default EventEditPage