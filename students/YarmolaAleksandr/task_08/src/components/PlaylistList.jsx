import PlaylistCard from './PlaylistCard';
import './PlaylistList.css';

const PlaylistList = ({ playlists, onEdit, onDelete }) => {
  if (playlists.length === 0) {
    return (
      <div className="empty-state" data-testid="empty-state">
        <p>🎬 No playlists yet. Create your first one!</p>
      </div>
    );
  }

  return (
    <div className="playlist-list" data-testid="playlist-list">
      {playlists.map(playlist => (
        <PlaylistCard key={playlist.id} playlist={playlist} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default PlaylistList;
