import { useNavigate } from 'react-router-dom';
import { useAuth } from '../useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    login();
    navigate('/');
  };

  return (
    <div>
      <h1>Вход</h1>
      <p>Для создания и редактирования курсов нужно войти</p>
      <button onClick={handleLogin}>Войти (демо)</button>
    </div>
  );
}