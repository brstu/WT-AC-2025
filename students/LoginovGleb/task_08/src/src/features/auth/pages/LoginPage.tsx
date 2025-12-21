import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { login } from '../authSlice';
import { showNotification } from '../../../store/notificationSlice';
import { Card } from '../../../components/ui/Card';
import { LoginForm, LoginFormData } from '../components/LoginForm';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import './LoginPage.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/games" replace />;
  }

  const handleSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    // Симуляция API запроса
    setTimeout(() => {
      // Для демонстрации принимаем любые учетные данные
      const mockUser = {
        id: '1',
        username: data.username,
        email: `${data.username}@example.com`,
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
      navigate('/games');
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
