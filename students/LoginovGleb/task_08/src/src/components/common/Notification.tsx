import { useEffect } from 'react';
import { hideNotification } from '../../store/notificationSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import './Notification.css';

export const Notification = () => {
  const dispatch = useAppDispatch();
  const { message, type, isVisible } = useAppSelector((state) => state.notification);

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
      <button className="notification-close" onClick={() => dispatch(hideNotification())}>
        ×
      </button>
    </div>
  );
};
