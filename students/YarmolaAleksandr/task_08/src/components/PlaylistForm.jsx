import { useState, useEffect } from 'react';
import { validatePlaylist } from '../utils/validation';
import './PlaylistForm.css';

const PlaylistForm = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    videoCount: 0,
    isPublic: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = e => {
    e.preventDefault();

    const validation = validatePlaylist(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSubmit(formData);
    if (!initialData) {
      // Reset form only if creating new
      setFormData({
        title: '',
        description: '',
        category: 'music',
        videoCount: 0,
        isPublic: true,
      });
    }
    setErrors({});
  };

  return (
    <form className="playlist-form" onSubmit={handleSubmit} data-testid="playlist-form">
      <div className="form-group">
        <label htmlFor="title">
          Title <span className="required">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter playlist title"
          className={errors.title ? 'error' : ''}
          data-testid="playlist-title"
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter playlist description"
          rows="4"
          data-testid="playlist-description"
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">
          Category <span className="required">*</span>
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={errors.category ? 'error' : ''}
          data-testid="playlist-category"
        >
          <option value="">Select a category</option>
          <option value="music">Music</option>
          <option value="education">Education</option>
          <option value="gaming">Gaming</option>
          <option value="entertainment">Entertainment</option>
          <option value="sports">Sports</option>
          <option value="tech">Technology</option>
        </select>
        {errors.category && <span className="error-message">{errors.category}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="videoCount">Video Count</label>
        <input
          type="number"
          id="videoCount"
          name="videoCount"
          value={formData.videoCount}
          onChange={handleChange}
          min="0"
          data-testid="playlist-videoCount"
        />
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            name="isPublic"
            checked={formData.isPublic}
            onChange={handleChange}
            data-testid="playlist-isPublic"
          />
          <span>Public Playlist</span>
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" data-testid="submit-button">
          {initialData ? 'Update Playlist' : 'Create Playlist'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            data-testid="cancel-button"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default PlaylistForm;
