import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import './LoginForm.css';

const loginSchema = z.object({
  username: z.string().min(1, 'Имя пользователя обязательно'),
  password: z.string().min(1, 'Пароль обязателен'),
});

export const LoginForm = ({ onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="login-form">
      <h2>Вход в систему</h2>
      
      <Input
        label="Имя пользователя"
        {...register('username')}
        error={errors.username?.message}
        placeholder="Введите имя пользователя"
      />

      <Input
        label="Пароль"
        type="password"
        {...register('password')}
        error={errors.password?.message}
        placeholder="Введите пароль"
      />

      <Button type="submit" fullWidth disabled={isLoading}>
        {isLoading ? 'Вход...' : 'Войти'}
      </Button>
      
      <div className="login-hint">
        <p>Для демонстрации используйте любые учетные данные</p>
      </div>
    </form>
  );
};
