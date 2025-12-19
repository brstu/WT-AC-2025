const STORAGE_KEY = 'youtube_playlists';

export const loadPlaylists = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load playlists:', error);
    return [];
  }
};

export const savePlaylists = playlists => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
    return true;
  } catch (error) {
    console.error('Failed to save playlists:', error);
    return false;
  }
};
