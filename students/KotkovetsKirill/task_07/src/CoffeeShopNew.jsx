import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function CoffeeShopNew({ onAdd }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    rating: 5,
    description: '',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onAdd(formData)
    alert('Кофейня добавлена!')
    navigate('/')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  return (
    <div>
      <h1>Добавить новую кофейню</h1>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <label>Название:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />

          <label>Адрес:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />

          <label>Рейтинг:</label>
          <select 
            name="rating" 
            value={formData.rating} 
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', marginBottom: '15px' }}
          >
            <option value="5">5</option>
            <option value="4.5">4.5</option>
            <option value="4">4</option>
            <option value="3.5">3.5</option>
            <option value="3">3</option>
            <option value="2.5">2.5</option>
            <option value="2">2</option>
            <option value="1.5">1.5</option>
            <option value="1">1</option>
          </select>

          <label>Описание:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />

          <label>URL изображения:</label>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
          />

          <div style={{ marginTop: '20px' }}>
            <button type="submit">Сохранить</button>
            <button type="button" onClick={() => navigate('/')} style={{ background: '#666' }}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CoffeeShopNew
