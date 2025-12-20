const Notification = ({ message, type, onClose }) => {
  return (
    <div className={`notification notification-${type}`}>
      <span>{message}</span>
      <button onClick={onClose} className="notification-close">×</button>
    </div>
  )
}

export default Notification