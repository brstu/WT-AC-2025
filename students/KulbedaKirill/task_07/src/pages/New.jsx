import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function New() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: '',
    image: ''
  })
  const [msg, setMsg] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if(!formData.title || !formData.price) {
      setMsg('Заполните обязательные поля!')
      return
    }

    fetch('https://fakestoreapi.com/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: formData.title,
        price: formData.price,
        description: formData.description,
        category: formData.category,
        image: formData.image || 'https://via.placeholder.com/200'
      })
    })
      .then(res => res.json())
      .then(json => {
        setMsg('Товар добавлен! ID: ' + json.id)
        setTimeout(() => {
          navigate('/list')
        }, 2000)
      })
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
      <h2>Добавить новый товар</h2>
      
      {msg && <div style={{background: '#d4edda', padding: '10px', marginBottom: '20px', borderRadius: '5px', color: '#155724'}}>{msg}</div>}
      
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '5px'}}>Название *</label>
          <input 
            type="text" 
            name="title"
            value={formData.title} 
            onChange={handleChange}
            style={{width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px'}}
          />
        </div>

        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '5px'}}>Цена *</label>
          <input 
            type="number" 
            name="price"
            value={formData.price} 
            onChange={handleChange}
            step="0.01"
            style={{width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px'}}
          />
        </div>

        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '5px'}}>Описание</label>
          <textarea 
            name="description"
            value={formData.description} 
            onChange={handleChange}
            rows="4"
            style={{width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px'}}
          />
        </div>

        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '5px'}}>Категория</label>
          <select 
            name="category"
            value={formData.category} 
            onChange={handleChange}
            style={{width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px'}}
          >
            <option value="">Выберите категорию</option>
            <option value="electronics">Electronics</option>
            <option value="jewelery">Jewelery</option>
            <option value="men's clothing">Men's clothing</option>
            <option value="women's clothing">Women's clothing</option>
          </select>
        </div>

        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '5px'}}>URL изображения</label>
          <input 
            type="text" 
            name="image"
            value={formData.image} 
            onChange={handleChange}
            style={{width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px'}}
          />
        </div>

        <button type="submit" style={{padding: '10px 30px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px'}}>
          Добавить товар
        </button>
      </form>
    </div>
  )
}

export default New
