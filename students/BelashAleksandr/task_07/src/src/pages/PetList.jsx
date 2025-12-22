import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function PetList(props) {
  var [pets, setPets] = useState([])
  var [loading, setLoading] = useState(true)
  var [error, setError] = useState('')
  var [filter, setFilter] = useState('all')

  useEffect(() => {
    loadPets()
  }, [])

  var loadPets = () => {
    setLoading(true)
    setTimeout(() => {
      var savedPets = localStorage.getItem('pets')
      if (savedPets) {
        setPets(JSON.parse(savedPets))
      } else {
        var initialPets = [
          {
            id: 1,
            name: 'Бобик',
            type: 'Собака',
            age: 3,
            breed: 'Лабрадор',
            description: 'Дружелюбная собака, любит играть',
            image: 'https://images.dog.ceo/breeds/labrador/n02099712_1234.jpg',
            adopted: false
          },
          {
            id: 2,
            name: 'Мурка',
            type: 'Кошка',
            age: 2,
            breed: 'Персидская',
            description: 'Спокойная кошка, любит спать',
            image: 'https://cdn2.thecatapi.com/images/0XYvRd7oD.jpg',
            adopted: false
          },
          {
            id: 3,
            name: 'Рекс',
            type: 'Собака',
            age: 5,
            breed: 'Немецкая овчарка',
            description: 'Умный и преданный пес',
            image: 'https://images.dog.ceo/breeds/germanshepherd/n02106662_10313.jpg',
            adopted: true
          }
        ]
        localStorage.setItem('pets', JSON.stringify(initialPets))
        setPets(initialPets)
      }
      setLoading(false)
    }, 500)
  }

  var deletePet = (id) => {
    if (confirm('Вы уверены?')) {
      var newPets = pets.filter(p => p.id !== id)
      setPets(newPets)
      localStorage.setItem('pets', JSON.stringify(newPets))
      alert('Питомец удален')
    }
  }

  var filteredPets = pets
  if (filter === 'dog') {
    filteredPets = pets.filter(p => p.type === 'Собака')
  } else if (filter === 'cat') {
    filteredPets = pets.filter(p => p.type === 'Кошка')
  } else if (filter === 'adopted') {
    filteredPets = pets.filter(p => p.adopted === true)
  } else if (filter === 'available') {
    filteredPets = pets.filter(p => p.adopted === false)
  }

  if (loading) {
    return <div style={{textAlign: 'center', marginTop: '50px', fontSize: '20px'}}>Загрузка...</div>
  }

  if (error) {
    return <div style={{textAlign: 'center', marginTop: '50px', color: 'red'}}>{error}</div>
  }

  return (
    <div style={{maxWidth: '1200px', margin: '0 auto', padding: '20px'}}>
      <h2>Каталог питомцев</h2>
      
      <div style={{marginBottom: '20px'}}>
        <label style={{marginRight: '10px'}}>Фильтр:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{
          padding: '5px 10px',
          fontSize: '16px'
        }}>
          <option value="all">Все</option>
          <option value="dog">Собаки</option>
          <option value="cat">Кошки</option>
          <option value="available">Доступны</option>
          <option value="adopted">Уже в семье</option>
        </select>
      </div>

      {filteredPets.length === 0 && (
        <div style={{textAlign: 'center', marginTop: '50px', fontSize: '18px'}}>
          Питомцы не найдены
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {filteredPets.map(pet => (
          <div key={pet.id} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            backgroundColor: 'white'
          }}>
            <img src={pet.image} alt={pet.name} style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '5px'
            }} />
            <h3 style={{marginTop: '10px', marginBottom: '5px'}}>{pet.name}</h3>
            <p style={{margin: '5px 0', color: '#666'}}>
              <strong>Тип:</strong> {pet.type}<br/>
              <strong>Возраст:</strong> {pet.age} лет<br/>
              <strong>Порода:</strong> {pet.breed}
            </p>
            <p style={{fontSize: '14px', color: '#888'}}>
              {pet.description.length > 50 ? pet.description.substring(0, 50) + '...' : pet.description}
            </p>
            {pet.adopted && (
              <div style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '3px',
                display: 'inline-block',
                fontSize: '12px',
                marginBottom: '10px'
              }}>
                Нашел дом
              </div>
            )}
            <div style={{marginTop: '10px', display: 'flex', gap: '10px'}}>
              <Link to={`/pet/${pet.id}`} style={{
                flex: 1,
                padding: '8px',
                backgroundColor: '#2196F3',
                color: 'white',
                textAlign: 'center',
                textDecoration: 'none',
                borderRadius: '4px'
              }}>
                Подробнее
              </Link>
              {props.user && (
                <>
                  <Link to={`/edit/${pet.id}`} style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#FF9800',
                    color: 'white',
                    textAlign: 'center',
                    textDecoration: 'none',
                    borderRadius: '4px'
                  }}>
                    Изменить
                  </Link>
                  <button onClick={() => deletePet(pet.id)} style={{
                    padding: '8px 12px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    Удалить
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PetList
