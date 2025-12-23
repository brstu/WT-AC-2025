import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

function Detail() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('https://fakestoreapi.com/products/' + id)
      .then(res => res.json())
      .then(json => {
        setItem(json)
        setLoading(false)
      })
  }, [id])

  if(loading) {
    return <div style={{padding: '20px'}}>Загрузка...</div>
  }

  if(!item) {
    return <div style={{padding: '20px'}}>Товар не найден</div>
  }

  return (
    <div style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
      <Link to="/list" style={{color: 'blue', textDecoration: 'none', marginBottom: '20px', display: 'inline-block'}}>← Назад к списку</Link>
      
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px'}}>
        <div>
          <img src={item.image} alt={item.title} style={{width: '100%', maxHeight: '400px', objectFit: 'contain', border: '1px solid #ddd', padding: '20px'}} />
        </div>
        
        <div>
          <h2 style={{marginTop: 0}}>{item.title}</h2>
          <p style={{fontSize: '24px', color: '#e74c3c', fontWeight: 'bold'}}>${item.price}</p>
          <p style={{background: '#f0f0f0', padding: '5px 10px', display: 'inline-block', borderRadius: '3px'}}>{item.category}</p>
          <p style={{marginTop: '20px', lineHeight: '1.6', color: '#555'}}>{item.description}</p>
          
          <div style={{marginTop: '30px'}}>
            <p><strong>Рейтинг:</strong> {item.rating.rate} ({item.rating.count} отзывов)</p>
          </div>
          
          <div style={{marginTop: '30px'}}>
            <Link to={'/edit/' + item.id}>
              <button style={{padding: '10px 20px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px'}}>
                Редактировать
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Detail
