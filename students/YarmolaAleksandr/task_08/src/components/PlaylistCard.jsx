import { formatDate } from '../utils/dateFormat';
import './PlaylistCard.css';

const PlaylistCard = ({ playlist, onEdit, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm(`Delete playlist "${playlist.title}"?`)) {
      onDelete(playlist.id);
    }
  };

  return (
    <div className="playlist-card" data-testid="playlist-card">
      <div className="card-header">
        <h3 data-testid="playlist-card-title">{playlist.title}</h3>
        <span className={`status ${playlist.isPublic ? 'public' : 'private'}`}>
          {playlist.isPublic ? '🌐 Public' : '🔒 Private'}
        </span>
      </div>

      {playlist.description && <p className="card-description">{playlist.description}</p>}

      <div className="card-meta">
        <span className="category" data-testid="playlist-card-category">
          📁 {playlist.category}
        </span>
        <span className="video-count">🎥 {playlist.videoCount} videos</span>
      </div>

      <div className="card-footer">
        <span className="date">Created: {formatDate(playlist.createdAt)}</span>
        <div className="card-actions">
          <button
            onClick={() => onEdit(playlist)}
            className="btn-icon btn-edit"
            aria-label="Edit playlist"
            data-testid="edit-button"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            className="btn-icon btn-delete"
            aria-label="Delete playlist"
            data-testid="delete-button"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaylistCard;
