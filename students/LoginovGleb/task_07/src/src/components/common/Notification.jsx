import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideNotification } from '../../store/notificationSlice';
import './Notification.css';

export const Notification = () => {
  const dispatch = useDispatch();
  const { message, type, isVisible } = useSelector((state) => state.notification);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        dispatch(hideNotification());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, dispatch]);

  if (!isVisible) return null;

  return (
    <div className={`notification notification-${type}`}>
      <span>{message}</span>
      <button 
        className="notification-close"
        onClick={() => dispatch(hideNotification())}
      >
        ×
      </button>
    </div>
  );
};
