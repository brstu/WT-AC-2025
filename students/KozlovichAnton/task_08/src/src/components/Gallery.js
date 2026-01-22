import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Gallery() {
  const [data, setData] = useState([]);
  const [l, setL] = useState(true);
  
  useEffect(() => {
    console.log('Loading gallery...');
    // Использование открытого API для артов
    axios.get('https://api.artic.edu/api/v1/artworks?limit=12')
      .then(res => {
        console.log('Data loaded:', res.data);
        setData(res.data.data);
        setL(false);
      })
      .catch(err => {
        console.log(err);
        setL(false);
      });
  }, []);
  
  if (l) {
    return <div>Загрузка...</div>;
  }
  
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px'}}>
      {data.map((item, index) => {
        var img = '';
        if (item.image_id) {
          img = `https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`;
        } else {
          img = 'https://via.placeholder.com/300x400?text=Нет+изображения';
        }
        
        return (
          <div key={index} style={{border: '1px solid #ccc', padding: '10px'}}>
            <img src={img} alt={item.title || 'Арт'} style={{width: '100%', height: '300px', objectFit: 'cover'}} />
            <h3 style={{fontSize: '16px', marginTop: '10px'}}>{item.title || 'Без названия'}</h3>
            <p style={{fontSize: '14px', color: '#666'}}>{item.artist_display || 'Автор неизвестен'}</p>
          </div>
        );
      })}
    </div>
  );
}

export default Gallery;
