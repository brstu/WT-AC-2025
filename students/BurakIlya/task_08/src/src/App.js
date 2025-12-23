import React, { useState } from 'react';
import './App.css';

function App() {
  var a = [
    { id: 1, n: 'Отжимания', d: 'Классические отжимания от пола', img: 'https://via.placeholder.com/300x200/4a90e2/ffffff?text=%D0%9E%D1%82%D0%B6%D0%B8%D0%BC%D0%B0%D0%BD%D0%B8%D1%8F', c: 'Грудь', r: 15 },
    { id: 2, n: 'Приседания', d: 'Глубокие приседания без веса', img: 'https://via.placeholder.com/300x200/50c878/ffffff?text=%D0%9F%D1%80%D0%B8%D1%81%D0%B5%D0%B4%D0%B0%D0%BD%D0%B8%D1%8F', c: 'Ноги', r: 20 },
    { id: 3, n: 'Планка', d: 'Статическое упражнение на пресс', img: 'https://via.placeholder.com/300x200/ff6347/ffffff?text=%D0%9F%D0%BB%D0%B0%D0%BD%D0%BA%D0%B0', c: 'Пресс', r: 60 },
    { id: 4, n: 'Прыжки', d: 'Прыжки на месте с высоким подъемом коленей', img: 'https://via.placeholder.com/300x200/ffa500/ffffff?text=%D0%9F%D1%80%D1%8B%D0%B6%D0%BA%D0%B8', c: 'Кардио', r: 30 },
    { id: 5, n: 'Подтягивания', d: 'Подтягивания на турнике', img: 'https://via.placeholder.com/300x200/9370db/ffffff?text=%D0%9F%D0%BE%D0%B4%D1%82%D1%8F%D0%B3%D0%B8%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F', c: 'Спина', r: 10 },
    { id: 6, n: 'Бурпи', d: 'Комплексное упражнение на всё тело', img: 'https://via.placeholder.com/300x200/ff69b4/ffffff?text=%D0%91%D1%83%D1%80%D0%BF%D0%B8', c: 'Всё тело', r: 15 }
  ];

  const [b, setB] = useState(a);
  const [c, setC] = useState('');
  const [d, setD] = useState(null);

  function f1(e) {
    setC(e.target.value);
    if (e.target.value === '') {
      setB(a);
    } else {
      var x = [];
      for (var i = 0; i < a.length; i++) {
        if (a[i].c === e.target.value) {
          x.push(a[i]);
        }
      }
      setB(x);
    }
  }

  function f2(item) {
    setD(item);
  }

  function f3() {
    setD(null);
  }

  return (
    <div style={{ fontFamily: 'Arial', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#333', fontSize: '36px' }}>Фитнес Упражнения</h1>
        <p style={{ color: '#666', fontSize: '18px' }}>Выберите упражнение для просмотра деталей</p>
      </div>

      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <label style={{ marginRight: '10px', fontSize: '16px' }}>Фильтр по категории:</label>
        <select value={c} onChange={f1} style={{ padding: '8px', fontSize: '14px', borderRadius: '5px', border: '1px solid #ccc' }}>
          <option value="">Все</option>
          <option value="Грудь">Грудь</option>
          <option value="Ноги">Ноги</option>
          <option value="Пресс">Пресс</option>
          <option value="Кардио">Кардио</option>
          <option value="Спина">Спина</option>
          <option value="Всё тело">Всё тело</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
        {b.map((item) => (
          <div
            key={item.id}
            onClick={() => f2(item)}
            style={{
              border: '1px solid #ddd',
              borderRadius: '10px',
              padding: '15px',
              width: '280px',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <img src={item.img} alt={item.n} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px' }} />
            <h3 style={{ margin: '10px 0 5px', color: '#333' }}>{item.n}</h3>
            <p style={{ fontSize: '12px', color: '#888', margin: '5px 0' }}>{item.c}</p>
            <p style={{ fontSize: '14px', color: '#555' }}>{item.d}</p>
          </div>
        ))}
      </div>

      {d && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1000'
          }}
          onClick={f3}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '15px',
              maxWidth: '500px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={d.img} alt={d.n} style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '10px' }} />
            <h2 style={{ margin: '15px 0', color: '#333' }}>{d.n}</h2>
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>Категория: {d.c}</p>
            <p style={{ fontSize: '16px', color: '#555', marginBottom: '10px' }}>{d.d}</p>
            <p style={{ fontSize: '16px', color: '#333', fontWeight: 'bold' }}>Повторений: {d.r}</p>
            <button
              onClick={f3}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#4a90e2',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
