import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../components/Button.jsx';
import FormInput from '../components/FormInput.jsx';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please provide username and password');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find((u) => u.username === username)) {
      toast.error('User already exists');
      return;
    }

    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    toast.dismiss();
    toast.success('Registered successfully. You can now log in.');
    // After registering, prefill login username and navigate to login
    localStorage.setItem('prefillUsername', username);
    navigate('/login');
  };

  return (
    <div className="container">
      <div className="form-card">
        <h2>Register</h2>
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
          <Button type="submit">Register</Button>
        </form>
      </div>
    </div>
  );
}

export default Register;
