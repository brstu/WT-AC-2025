import { describe, it, expect, beforeEach } from 'vitest';
import { loadPlaylists, savePlaylists } from '../src/utils/storage';

describe('storage', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: key => store[key] || null,
      setItem: (key, value) => {
        store[key] = value.toString();
      },
      removeItem: key => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    global.localStorage = localStorageMock;
    localStorage.clear();
  });

  describe('loadPlaylists', () => {
    it('should return empty array when no data in localStorage', () => {
      const playlists = loadPlaylists();
      expect(playlists).toEqual([]);
    });

    it('should return parsed playlists from localStorage', () => {
      const mockPlaylists = [
        {
          id: '1',
          title: 'Test Playlist',
          category: 'music',
          videoCount: 5,
        },
      ];
      localStorage.setItem('youtube_playlists', JSON.stringify(mockPlaylists));

      const playlists = loadPlaylists();
      expect(playlists).toEqual(mockPlaylists);
    });

    it('should return empty array on parse error', () => {
      localStorage.setItem('youtube_playlists', 'invalid json');
      const playlists = loadPlaylists();
      expect(playlists).toEqual([]);
    });
  });

  describe('savePlaylists', () => {
    it('should save playlists to localStorage', () => {
      const mockPlaylists = [
        {
          id: '1',
          title: 'Test Playlist',
          category: 'music',
          videoCount: 5,
        },
      ];

      const result = savePlaylists(mockPlaylists);
      expect(result).toBe(true);

      const saved = localStorage.getItem('youtube_playlists');
      expect(JSON.parse(saved)).toEqual(mockPlaylists);
    });

    it('should return false on save error', () => {
      const mockPlaylists = [{ id: '1' }];
      
      // Mock setItem to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('Storage quota exceeded');
      };

      const result = savePlaylists(mockPlaylists);
      expect(result).toBe(false);

      // Restore original method
      localStorage.setItem = originalSetItem;
    });
  });
});
