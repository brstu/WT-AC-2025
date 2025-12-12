import { describe, it, expect } from 'vitest';
import { validatePlaylist } from '../src/utils/validation';

describe('validatePlaylist', () => {
  it('should validate a correct playlist', () => {
    const playlist = {
      title: 'My Playlist',
      description: 'Test description',
      category: 'music',
      videoCount: 10,
      isPublic: true,
    };

    const result = validatePlaylist(playlist);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('should reject empty title', () => {
    const playlist = {
      title: '',
      description: 'Test',
      category: 'music',
      videoCount: 5,
    };

    const result = validatePlaylist(playlist);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe('Title is required');
  });

  it('should reject title shorter than 3 characters', () => {
    const playlist = {
      title: 'AB',
      description: 'Test',
      category: 'music',
      videoCount: 5,
    };

    const result = validatePlaylist(playlist);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe('Title must be at least 3 characters');
  });

  it('should reject title longer than 100 characters', () => {
    const playlist = {
      title: 'A'.repeat(101),
      description: 'Test',
      category: 'music',
      videoCount: 5,
    };

    const result = validatePlaylist(playlist);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe('Title must not exceed 100 characters');
  });

  it('should reject description longer than 500 characters', () => {
    const playlist = {
      title: 'Valid Title',
      description: 'A'.repeat(501),
      category: 'music',
      videoCount: 5,
    };

    const result = validatePlaylist(playlist);
    expect(result.isValid).toBe(false);
    expect(result.errors.description).toBe(
      'Description must not exceed 500 characters'
    );
  });

  it('should reject missing category', () => {
    const playlist = {
      title: 'Valid Title',
      description: 'Test',
      category: '',
      videoCount: 5,
    };

    const result = validatePlaylist(playlist);
    expect(result.isValid).toBe(false);
    expect(result.errors.category).toBe('Category is required');
  });

  it('should reject negative video count', () => {
    const playlist = {
      title: 'Valid Title',
      description: 'Test',
      category: 'music',
      videoCount: -1,
    };

    const result = validatePlaylist(playlist);
    expect(result.isValid).toBe(false);
    expect(result.errors.videoCount).toBe('Video count cannot be negative');
  });

  it('should reject video count exceeding 5000', () => {
    const playlist = {
      title: 'Valid Title',
      description: 'Test',
      category: 'music',
      videoCount: 5001,
    };

    const result = validatePlaylist(playlist);
    expect(result.isValid).toBe(false);
    expect(result.errors.videoCount).toBe('Video count cannot exceed 5000');
  });
});
