import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../authSlice';
import { showNotification } from '../../../store/notificationSlice';
import { Card } from '../../../components/ui/Card';
import { LoginForm } from '../components/LoginForm';
import './LoginPage.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/equipment" replace />;
  }

  const handleSubmit = async (data) => {
    setIsLoading(true);

    // Симуляция API запроса
    setTimeout(() => {
      // Для демонстрации принимаем любые учетные данные
      const mockUser = {
        id: 1,
        username: data.username,
        name: data.username,
        role: 'admin',
      };

      const mockToken = 'mock-jwt-token-' + Date.now();

      dispatch(login({ user: mockUser, token: mockToken }));
      dispatch(
        showNotification({
          message: 'Вы успешно вошли в систему',
          type: 'success',
        })
      );

      setIsLoading(false);
      navigate('/equipment');
    }, 500);
  };

  return (
    <div className="login-page">
      <Card>
        <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
      </Card>
    </div>
  );
};
