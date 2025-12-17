import { useGetMuseumsQuery, useDeleteMuseumMutation } from '../store/apiSlice.js';
import { useSelector, useDispatch } from 'react-redux';
import { addFavorite, removeFavorite } from '../store/favoritesSlice.js';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Button from '../components/Button.jsx';
import { toast } from 'react-toastify';

function MuseumsList() {
  const { data: museums, isLoading, error } = useGetMuseumsQuery();
  const favorites = useSelector((state) => state.favorites.items);
  const dispatch = useDispatch();

  const [deleteMuseum] = useDeleteMuseumMutation();

  const handleDelete = async (id) => {
    try {
      await deleteMuseum(id).unwrap();
      toast.success('Deleted');
    } catch (err) {
      console.error('Delete error:', err);
      const msg =
        err?.data?.message || err?.message || (typeof err === 'string' ? err : 'Delete failed');
      toast.error(`Error: ${msg}`);
    }
  };

  const [filter, setFilter] = useState('all');
  const displayedMuseums = museums || [];
  const displayed =
    filter === 'favorites'
      ? displayedMuseums.filter((m) => favorites.includes(m.id))
      : displayedMuseums;

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!displayed?.length)
    return (
      <div className="container">
        <div className="museums-header">
          <div>
            <h1>🏛️ Museums</h1>
          </div>
          <div className="filter-buttons">
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'primary' : 'link'}
            >
              {filter === 'all' ? '✓ All' : 'All'}
            </Button>
            <Button
              onClick={() => setFilter('favorites')}
              variant={filter === 'favorites' ? 'primary' : 'link'}
            >
              {filter === 'favorites' ? '★ Favorites' : '☆ Favorites'}
            </Button>
          </div>
        </div>
        <div className="form-card empty-state">
          <div className="empty-icon">{filter === 'favorites' ? '😢' : '🔍'}</div>
          <h2>{filter === 'favorites' ? 'No favorite museums yet' : 'No museums found'}</h2>
          <p>
            {filter === 'favorites'
              ? 'Add some museums to your favorites to see them here.'
              : 'No museums available at the moment.'}
          </p>
          {filter === 'favorites' && (
            <Button onClick={() => setFilter('all')} style={{ marginTop: 20 }}>
              ← View All Museums
            </Button>
          )}
        </div>
      </div>
    );

  return (
    <div className="container">
      <div className="museums-header">
        <div>
          <h1>🏛️ Museums</h1>
        </div>
        <div className="filter-buttons">
          <Button onClick={() => setFilter('all')} variant={filter === 'all' ? 'primary' : 'link'}>
            {filter === 'all' ? '✓ All' : 'All'}
          </Button>
          <Button
            onClick={() => setFilter('favorites')}
            variant={filter === 'favorites' ? 'primary' : 'link'}
          >
            {filter === 'favorites' ? '★ Favorites' : '☆ Favorites'}
          </Button>
        </div>
      </div>

      <ul className="card-list">
        {displayed.map((museum) => (
          <li key={museum.id} className="card">
            <div className="card-wrapper">
              {!localStorage.getItem('token') && (
                <button
                  onClick={() =>
                    favorites.includes(museum.id)
                      ? dispatch(removeFavorite(museum.id))
                      : dispatch(addFavorite(museum.id))
                  }
                  className="action-icon star-icon star-icon-guest"
                  title={
                    favorites.includes(museum.id) ? 'Remove from favorites' : 'Add to favorites'
                  }
                >
                  {favorites.includes(museum.id) ? '★' : '☆'}
                </button>
              )}
              <div className="card-main">
                <div className="card-header">
                  {museum.imageUrl && (
                    <img src={museum.imageUrl} alt={museum.title} className="card-image-small" />
                  )}
                  <div className="card-content">
                    <Link to={`/museum/${museum.id}`} className="card-title">
                      {museum.title}
                    </Link>
                    <p className="muted">{museum.body?.slice(0, 100)}...</p>
                    {museum.date && (
                      <p className="card-date">
                        📅 {new Date(museum.date).toLocaleDateString('ru-RU')}
                      </p>
                    )}
                  </div>
                </div>
                {localStorage.getItem('token') && (
                  <div className="card-actions">
                    <Link to={`/edit/${museum.id}`} className="action-icon edit-icon" title="Edit">
                      ✏️
                    </Link>
                    <button
                      onClick={() =>
                        favorites.includes(museum.id)
                          ? dispatch(removeFavorite(museum.id))
                          : dispatch(addFavorite(museum.id))
                      }
                      className="action-icon star-icon"
                      title={
                        favorites.includes(museum.id) ? 'Remove from favorites' : 'Add to favorites'
                      }
                    >
                      {favorites.includes(museum.id) ? '★' : '☆'}
                    </button>
                    <button
                      onClick={() => handleDelete(museum.id)}
                      className="action-icon delete-icon"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MuseumsList;
