import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [x, setX] = useState([]);
  const [y, setY] = useState('');
  const [z, setZ] = useState('all');

  useEffect(() => {
    const temp = [
      {
        id: 1,
        name: 'React',
        desc: 'Библиотека для создания пользовательских интерфейсов',
        image: 'https://picsum.photos/seed/react/300/200',
        stars: 215000,
        category: 'frontend'
      },
      {
        id: 2,
        name: 'Vue.js',
        desc: 'Прогрессивный JavaScript фреймворк',
        image: 'https://picsum.photos/seed/vue/300/200',
        stars: 205000,
        category: 'frontend'
      },
      {
        id: 3,
        name: 'Node.js',
        desc: 'JavaScript среда выполнения на движке V8',
        image: 'https://picsum.photos/seed/nodejs/300/200',
        stars: 98000,
        category: 'backend'
      },
      {
        id: 4,
        name: 'Express',
        desc: 'Минималистичный веб-фреймворк для Node.js',
        image: 'https://picsum.photos/seed/express/300/200',
        stars: 62000,
        category: 'backend'
      },
      {
        id: 5,
        name: 'Webpack',
        desc: 'Сборщик модулей для JavaScript приложений',
        image: 'https://picsum.photos/seed/webpack/300/200',
        stars: 64000,
        category: 'tools'
      },
      {
        id: 6,
        name: 'Vite',
        desc: 'Инструмент сборки следующего поколения',
        image: 'https://picsum.photos/seed/vite/300/200',
        stars: 58000,
        category: 'tools'
      }
    ];
    setX(temp);
  }, []);

  let filtered;
  if (z === 'frontend') {
    filtered = x.filter(item => item.category === 'frontend');
  } else if (z === 'backend') {
    filtered = x.filter(item => item.category === 'backend');
  } else if (z === 'tools') {
    filtered = x.filter(item => item.category === 'tools');
  } else {
    filtered = x;
  }

  let result;
  if (y !== '') {
    result = filtered.filter(item => 
      item.name.toLowerCase().includes(y.toLowerCase())
    );
  } else {
    result = filtered;
  }

  return (
    <div className="app">
      <header style={{backgroundColor: '#282c34', padding: '20px', color: 'white'}}>
        <h1>Каталог Open Source проектов</h1>
        <p>Популярные проекты с открытым исходным кодом</p>
      </header>

      <div style={{padding: '20px'}}>
        <div style={{marginBottom: '20px'}}>
          <input 
            type="text"
            placeholder="Поиск проектов..."
            value={y}
            onChange={(e) => setY(e.target.value)}
            style={{
              padding: '10px',
              width: '300px',
              fontSize: '16px',
              marginRight: '10px'
            }}
          />
          
          <button 
            onClick={() => setZ('all')}
            style={{
              padding: '10px 20px',
              margin: '5px',
              backgroundColor: z === 'all' ? '#61dafb' : '#ccc',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Все
          </button>
          <button 
            onClick={() => setZ('frontend')}
            style={{
              padding: '10px 20px',
              margin: '5px',
              backgroundColor: z === 'frontend' ? '#61dafb' : '#ccc',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Frontend
          </button>
          <button 
            onClick={() => setZ('backend')}
            style={{
              padding: '10px 20px',
              margin: '5px',
              backgroundColor: z === 'backend' ? '#61dafb' : '#ccc',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Backend
          </button>
          <button 
            onClick={() => setZ('tools')}
            style={{
              padding: '10px 20px',
              margin: '5px',
              backgroundColor: z === 'tools' ? '#61dafb' : '#ccc',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Инструменты
          </button>
        </div>

        <div className="projects-grid">
          {result.length > 0 ? (
            result.map((item) => (
              <div key={item.id} className="project-card">
                <img 
                  src={item.image} 
                  alt={item.name}
                  style={{width: '100%', height: '200px', objectFit: 'cover'}}
                />
                <div style={{padding: '15px'}}>
                  <h3>{item.name}</h3>
                  <p>{item.desc}</p>
                  <div style={{marginTop: '10px'}}>
                    <span style={{fontSize: '14px', color: '#666'}}>
                      ⭐ {item.stars.toLocaleString('ru-RU')} звезд
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>Проекты не найдены</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
