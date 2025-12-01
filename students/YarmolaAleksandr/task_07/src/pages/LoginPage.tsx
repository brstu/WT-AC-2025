import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Lock } from 'lucide-react';
import { Button, Card, CardHeader, CardContent } from '../shared/ui';
import { loginSchema, type LoginFormData } from '../shared/lib/validations';
import { useAppDispatch } from '../app/hooks';
import { loginSuccess } from '../features/auth/authSlice';
import { addNotification } from '../app/appSlice';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful login
      const mockUser = {
        id: '1',
        email: data.email,
        name: data.email.split('@')[0],
        isAuthenticated: true,
      };

      const mockToken = 'mock-jwt-token';

      dispatch(loginSuccess({ user: mockUser, token: mockToken }));
      
      toast.success('Login successful!');
      dispatch(addNotification({
        type: 'success',
        title: 'Welcome back!',
        message: `You're now signed in as ${mockUser.name}`,
      }));

      navigate('/');
    } catch (error) {
      toast.error('Login failed');
      dispatch(addNotification({
        type: 'error',
        title: 'Login Failed',
        message: 'Invalid email or password. Please try again.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    handleLogin({ email: 'demo@example.com', password: 'password123' });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to your account to continue
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-center">Sign In</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="input pl-10"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-destructive" role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="input pl-10"
                    {...register('password')}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-destructive" role="alert">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                loading={isLoading}
                className="w-full"
              >
                Sign In
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleDemoLogin}
              loading={isLoading}
              className="w-full"
            >
              Try Demo Account
            </Button>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="text-sm font-medium mb-2">Demo Credentials</h3>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Email:</strong> demo@example.com</p>
                <p><strong>Password:</strong> password123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;