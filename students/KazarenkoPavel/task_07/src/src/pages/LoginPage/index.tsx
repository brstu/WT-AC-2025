import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { loginSchema, LoginFormData } from '../../utils/validation'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import toast from 'react-hot-toast'
import { LogIn } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password)
      toast.success('Вход выполнен успешно!')
      navigate('/')
    } catch (error: any) {
      toast.error(error?.data?.message || 'Ошибка входа')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Вход в аккаунт</h1>
            <p className="text-gray-600 mt-2">
              Введите свои данные для входа
            </p>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardBody className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Пароль"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Забыли пароль?
              </Link>
            </div>
          </CardBody>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Войти
            </Button>

            <div className="text-center text-sm text-gray-600">
              Нет аккаунта?{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Зарегистрироваться
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
