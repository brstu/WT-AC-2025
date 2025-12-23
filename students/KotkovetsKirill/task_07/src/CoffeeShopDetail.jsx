import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'

function CoffeeShopDetail({ shops, loading }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [newReview, setNewReview] = useState({ author: '', text: '', rating: 5 })
  const [reviews, setReviews] = useState([])

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  const shop = shops.find(s => s.id === parseInt(id))
  
  if (!shop) {
    return <div>Кофейня не найдена</div>
  }

  const allReviews = [...(shop.reviews || []), ...reviews]

  const handleSubmitReview = (e) => {
    e.preventDefault()
    setReviews([...reviews, { ...newReview, id: Date.now() }])
    setNewReview({ author: '', text: '', rating: 5 })
  }

  return (
    <div>
      <button onClick={() => navigate(-1)}>← Назад</button>
      
      <div className="card" style={{ marginTop: '20px' }}>
        <img src={shop.image} alt={shop.name} style={{ width: '100%', height: '300px', objectFit: 'cover', marginBottom: '20px' }} />
        <h1>{shop.name}</h1>
        <p><strong>Адрес:</strong> {shop.address}</p>
        <div className="rating">★ {shop.rating}</div>
        <p style={{ marginTop: '15px' }}>{shop.description}</p>
        
        <div style={{ marginTop: '20px' }}>
          <Link to={`/edit/${shop.id}`}>
            <button>Редактировать</button>
          </Link>
        </div>

        <div className="reviews">
          <h2>Отзывы ({allReviews.length})</h2>
          
          {allReviews.map(review => (
            <div key={review.id} className="review-item">
              <strong>{review.author}</strong>
              <div className="rating">★ {review.rating}</div>
              <p>{review.text}</p>
            </div>
          ))}

          <h3 style={{ marginTop: '20px' }}>Добавить отзыв</h3>
          <form onSubmit={handleSubmitReview}>
            <input
              type="text"
              placeholder="Ваше имя"
              value={newReview.author}
              onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
            />
            <textarea
              placeholder="Ваш отзыв"
              value={newReview.text}
              onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
              rows="4"
            />
            <select 
              value={newReview.rating}
              onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
              style={{ width: '100%', padding: '10px', marginBottom: '15px' }}
            >
              <option value="5">5 звезд</option>
              <option value="4">4 звезды</option>
              <option value="3">3 звезды</option>
              <option value="2">2 звезды</option>
              <option value="1">1 звезда</option>
            </select>
            <button type="submit">Отправить отзыв</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CoffeeShopDetail
