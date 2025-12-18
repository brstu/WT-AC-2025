import { useParams } from 'react-router-dom';
import { useGetMuseumQuery } from '../store/apiSlice.js';
import { useSelector, useDispatch } from 'react-redux';
import { addFavorite, removeFavorite } from '../store/favoritesSlice.js';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Button from '../components/Button.jsx';

function MuseumDetail() {
  const { id } = useParams();
  const { data: museum, isLoading, error } = useGetMuseumQuery(id);
  const favorites = useSelector((state) => state.favorites.items);
  const dispatch = useDispatch();
  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!museum)
    return (
      <div className="container">
        <div className="form-card">Not found</div>
      </div>
    );

  return (
    <div className="container">
      <div className="form-card">
        {museum.imageUrl && <img src={museum.imageUrl} alt={museum.title} className="card-image" />}
        <h1>{museum.title}</h1>
        {museum.address && <p style={{ color: '#6b7280', marginBottom: 8 }}>📍 {museum.address}</p>}
        {museum.date && (
          <p style={{ color: '#94a3b8', marginBottom: 12, fontSize: '14px' }}>
            📅 {new Date(museum.date).toLocaleDateString('ru-RU')}
          </p>
        )}
        <p>{museum.body}</p>
        <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
          <Button
            onClick={() =>
              favorites.includes(museum.id)
                ? dispatch(removeFavorite(museum.id))
                : dispatch(addFavorite(museum.id))
            }
            className="btn-large"
          >
            {favorites.includes(museum.id) ? '★ Remove from Favorites' : '☆ Add to Favorites'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MuseumDetail;
