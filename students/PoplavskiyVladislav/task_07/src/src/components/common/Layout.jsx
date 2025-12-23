import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Notification from './Notification'
import { useSelector, useDispatch } from 'react-redux'
import { clearError, clearSuccessMessage } from '../../features/events/eventsSlice'

const Layout = () => {
  const dispatch = useDispatch()
  const { error, successMessage } = useSelector(state => state.events)

  const handleCloseError = () => {
    dispatch(clearError())
  }

  const handleCloseSuccess = () => {
    dispatch(clearSuccessMessage())
  }

  return (
    <div className="layout">
      <Navbar />
      <main className="container" style={{ paddingTop: '20px' }}>
        {error && (
          <Notification 
            type="error" 
            message={error} 
            onClose={handleCloseError}
          />
        )}
        {successMessage && (
          <Notification 
            type="success" 
            message={successMessage} 
            onClose={handleCloseSuccess}
          />
        )}
        <Outlet />
      </main>
    </div>
  )
}

export default Layout