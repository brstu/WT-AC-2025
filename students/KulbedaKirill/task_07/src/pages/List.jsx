import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function List() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter1, setFilter1] = useState('')
  const [filter2, setFilter2] = useState('')
  
  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then(res => res.json())
      .then(json => {
        setData(json)
        setLoading(false)
      })
  }, [])

  var d = data
  if(filter1) {
    d = d.filter(item => item.category == filter1)
  }
  if(filter2) {
    d = d.filter(item => item.price < parseFloat(filter2))
  }

  const deleteItem = (id) => {
    fetch('https://fakestoreapi.com/products/' + id, {
      method: 'DELETE'
    })
    setData(data.filter(item => item.id != id))
  }

  if(loading) {
    return <div style={{padding: '20px'}}>Загрузка...</div>
  }

  return (
    <div style={{padding: '20px'}}>
      <h2>Список гаджетов</h2>
      
      <div style={{marginBottom: '20px', background: '#f5f5f5', padding: '15px'}}>
        <label style={{marginRight: '10px'}}>
          Категория: 
          <select value={filter1} onChange={(e) => setFilter1(e.target.value)} style={{marginLeft: '5px', padding: '5px'}}>
            <option value="">Все</option>
            <option value="electronics">Electronics</option>
            <option value="jewelery">Jewelery</option>
            <option value="men's clothing">Men's clothing</option>
            <option value="women's clothing">Women's clothing</option>
          </select>
        </label>
        
        <label style={{marginLeft: '20px'}}>
          Цена до: 
          <input 
            type="number" 
            value={filter2} 
            onChange={(e) => setFilter2(e.target.value)} 
            style={{marginLeft: '5px', padding: '5px', width: '100px'}}
          />
        </label>
      </div>

      {d.length == 0 && <p>Нет товаров</p>}
      
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px'}}>
        {d.map(item => (
          <div key={item.id} style={{border: '1px solid #ddd', padding: '15px', borderRadius: '5px'}}>
            <img src={item.image} alt={item.title} style={{width: '100%', height: '200px', objectFit: 'contain'}} />
            <h3 style={{fontSize: '16px', marginTop: '10px'}}>{item.title}</h3>
            <p style={{color: '#666', fontSize: '14px'}}>{item.category}</p>
            <p style={{fontSize: '18px', fontWeight: 'bold', color: '#e74c3c'}}>${item.price}</p>
            <div style={{marginTop: '10px'}}>
              <Link to={'/detail/' + item.id} style={{marginRight: '10px', color: 'blue'}}>Просмотр</Link>
              <Link to={'/edit/' + item.id} style={{marginRight: '10px', color: 'green'}}>Редактировать</Link>
              <button onClick={() => deleteItem(item.id)} style={{color: 'red', background: 'none', border: 'none', cursor: 'pointer'}}>Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default List
