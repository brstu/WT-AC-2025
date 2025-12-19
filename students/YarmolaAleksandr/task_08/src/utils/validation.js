export const validatePlaylist = playlist => {
  const errors = {};

  if (!playlist.title || playlist.title.trim().length === 0) {
    errors.title = 'Title is required';
  } else if (playlist.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  } else if (playlist.title.trim().length > 100) {
    errors.title = 'Title must not exceed 100 characters';
  }

  if (playlist.description && playlist.description.length > 500) {
    errors.description = 'Description must not exceed 500 characters';
  }

  if (!playlist.category || playlist.category === '') {
    errors.category = 'Category is required';
  }

  if (playlist.videoCount < 0) {
    errors.videoCount = 'Video count cannot be negative';
  } else if (playlist.videoCount > 5000) {
    errors.videoCount = 'Video count cannot exceed 5000';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
