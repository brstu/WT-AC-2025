import React, { useState, useEffect } from 'react'
import CoffeeShopCard from './CoffeeShopCard'

function CoffeeShopList() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Захардкоженные данные вместо API
    const temp = [
      {
        id: 1,
        name: 'Кофейня "Утро"',
        address: 'ул. Ленина, 10',
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
        rating: 4.5,
        description: 'Уютная кофейня с атмосферой'
      },
      {
        id: 2,
        name: 'Coffee Time',
        address: 'пр. Машерова, 25',
        image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=300&fit=crop',
        rating: 4.2,
        description: 'Лучший кофе в городе'
      },
      {
        id: 3,
        name: 'Эспрессо Бар',
        address: 'ул. Советская, 5',
        image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
        rating: 4.8,
        description: 'Профессиональные бариста'
      },
      {
        id: 4,
        name: 'Кофе & Книги',
        address: 'ул. Гоголя, 15',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
        rating: 4.3,
        description: 'Читальный зал с кофе'
      }
    ]
    
    setTimeout(() => {
      setData(temp)
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return <div style={{textAlign: 'center', padding: '40px', fontSize: '18px'}}>Загрузка...</div>
  }

  if (data.length === 0) {
    return <div style={{textAlign: 'center', padding: '40px', fontSize: '18px'}}>Нет данных</div>
  }

  return (
    <div>
      <div style={{marginBottom: '20px', fontSize: '18px', fontWeight: 'bold'}}>
        Найдено кофеен: {data.length}
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px'}}>
        {data.map((item) => (
          <CoffeeShopCard key={item.id} shop={item} />
        ))}
      </div>
    </div>
  )
}

export default CoffeeShopList
