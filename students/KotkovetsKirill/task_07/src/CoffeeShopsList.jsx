import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

function CoffeeShopsList({ shops, loading, onDelete }) {
  const navigate = useNavigate()

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  return (
    <div>
      <h1>Справочник кофеен</h1>
      
      {shops.map(shop => (
        <div key={shop.id} className="card">
          <img src={shop.image} alt={shop.name} style={{ width: '100%', height: '200px', objectFit: 'cover', marginBottom: '15px' }} />
          <h2>{shop.name}</h2>
          <p>{shop.address}</p>
          <div className="rating">★ {shop.rating}</div>
          <p>{shop.description}</p>
          <div>
            <button onClick={() => navigate(`/shop/${shop.id}`)}>
              Подробнее
            </button>
            <button onClick={() => navigate(`/edit/${shop.id}`)}>
              Редактировать
            </button>
            <button onClick={() => {
              onDelete(shop.id)
            }} style={{ background: '#c62828' }}>
              Удалить
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CoffeeShopsList
