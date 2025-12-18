import { useState, useEffect } from 'react';
import PlaylistForm from './components/PlaylistForm';
import PlaylistList from './components/PlaylistList';
import { loadPlaylists, savePlaylists } from './utils/storage';
import './App.css';

function App() {
  const [playlists, setPlaylists] = useState([]);
  const [editingPlaylist, setEditingPlaylist] = useState(null);

  useEffect(() => {
    const savedPlaylists = loadPlaylists();
    setPlaylists(savedPlaylists);
  }, []);

  useEffect(() => {
    savePlaylists(playlists);
  }, [playlists]);

  const addPlaylist = playlist => {
    const newPlaylist = {
      ...playlist,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setPlaylists([...playlists, newPlaylist]);
  };

  const updatePlaylist = updatedPlaylist => {
    setPlaylists(
      playlists.map(playlist => (playlist.id === updatedPlaylist.id ? updatedPlaylist : playlist))
    );
    setEditingPlaylist(null);
  };

  const deletePlaylist = id => {
    setPlaylists(playlists.filter(playlist => playlist.id !== id));
  };

  const handleEdit = playlist => {
    setEditingPlaylist(playlist);
  };

  const cancelEdit = () => {
    setEditingPlaylist(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎬 YouTube Playlist Manager</h1>
        <p>Create and manage your YouTube playlists</p>
      </header>

      <main className="app-main">
        <section className="form-section">
          <h2>{editingPlaylist ? 'Edit Playlist' : 'Create New Playlist'}</h2>
          <PlaylistForm
            onSubmit={editingPlaylist ? updatePlaylist : addPlaylist}
            initialData={editingPlaylist}
            onCancel={editingPlaylist ? cancelEdit : null}
          />
        </section>

        <section className="list-section">
          <h2>My Playlists ({playlists.length})</h2>
          <PlaylistList playlists={playlists} onEdit={handleEdit} onDelete={deletePlaylist} />
        </section>
      </main>

      <footer className="app-footer">
        <p>© 2025 YouTube Playlist Manager | Lab 08</p>
      </footer>
    </div>
  );
}

export default App;
