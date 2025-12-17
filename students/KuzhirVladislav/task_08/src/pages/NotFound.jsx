import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';

function NotFound() {
  return (
    <div className="container">
      <div className="form-card empty-state">
        <div className="empty-icon">🔗</div>
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/">
          <Button>← Back to Museums</Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
