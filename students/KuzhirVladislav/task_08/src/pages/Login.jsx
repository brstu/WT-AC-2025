import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../components/Button.jsx';
import FormInput from '../components/FormInput.jsx';

function Login() {
  const [username, setUsername] = useState(() => {
    const p = localStorage.getItem('prefillUsername');
    if (p) {
      localStorage.removeItem('prefillUsername');
      return p;
    }
    return '';
  });
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const found = users.find((u) => u.username === username && u.password === password);

    // fallback to built-in admin account for compatibility
    if (found || (username === 'admin' && password === 'password')) {
      localStorage.setItem('token', 'fake-token');
      localStorage.setItem('currentUser', username);
      toast.success('Logged in!');
      navigate('/');
    } else {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="container">
      <div className="form-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <FormInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Button type="submit">Login</Button>
            <Link to="/register" className="link">
              Create account
            </Link>
          </div>
        </form>
        <div style={{ marginTop: 8 }}>
          <small>
            Don't have an account? <Link to="/register">Register</Link>
          </small>
        </div>
      </div>
    </div>
  );
}

export default Login;
