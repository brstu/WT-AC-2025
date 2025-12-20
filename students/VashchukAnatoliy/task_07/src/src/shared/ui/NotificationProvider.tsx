import { ReactNode, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { removeNotification } from '../../app/appSlice';

interface Props {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(
    (state) => state.app.notifications
  );

  useEffect(() => {
    notifications.forEach((n) => {
      if (n.duration) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(n.id));
        }, n.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, dispatch]);

  return (
    <>
      {children}

      <div className="fixed top-4 right-4 z-50 space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            role="alert"
            className={`px-4 py-3 rounded shadow text-white cursor-pointer
              transition-all duration-200 hover:opacity-90
              ${
                n.type === 'success'
                  ? 'bg-green-600'
                  : n.type === 'error'
                  ? 'bg-red-600'
                  : n.type === 'warning'
                  ? 'bg-yellow-500'
                  : 'bg-blue-600'
              }`}
            onClick={() => dispatch(removeNotification(n.id))}
          >
            <strong className="block">{n.title}</strong>
            {n.message && (
              <span className="text-sm">{n.message}</span>
            )}
          </div>
        ))}
      </div>
    </>
  );
};
