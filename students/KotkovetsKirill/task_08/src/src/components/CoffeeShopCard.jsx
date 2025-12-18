import React from 'react'


function CoffeeShopCard({ shop }) {
  // Отсутствие проверки на undefined
  var n = shop.name
  var a = shop.address
  var r = shop.rating
  var d = shop.description
  var img = shop.image

  // Плохая логика со звездами рейтинга
  var stars = ''
  for (var i = 0; i < 5; i++) {
    if (i < r) {
      stars = stars + '⭐'
    } else {
      stars = stars + '☆'
    }
  }

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      cursor: 'pointer'
    }}
    onClick={() => {
      // Плохая практика: alert вместо модального окна
      alert('Кофейня: ' + n + '\nАдрес: ' + a)
    }}>
      <img 
        src={img} 
        style={{
          width: '100%',
          height: '200px',
          objectFit: 'cover',
          borderRadius: '4px',
          marginBottom: '10px'
        }}
      />
      <h3 style={{margin: '10px 0', color: '#333', fontSize: '20px'}}>{n}</h3>
      <p style={{color: '#666', fontSize: '14px', margin: '5px 0'}}>{a}</p>
      <div style={{margin: '10px 0', fontSize: '18px'}}>
        {stars}
      </div>
      <p style={{color: '#555', fontSize: '14px', lineHeight: '1.5'}}>{d}</p>
      <button style={{
        marginTop: '10px',
        padding: '8px 16px',
        backgroundColor: '#8B4513',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
      }}
      onClick={(e) => {
        e.stopPropagation()
        // Отсутствие реальной функциональности
        console.log('Кнопка нажата')
      }}>
        Подробнее
      </button>
    </div>
  )
}

export default CoffeeShopCard
