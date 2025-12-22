import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function AddPet() {
  var [name, setName] = useState('')
  var [type, setType] = useState('Собака')
  var [age, setAge] = useState('')
  var [breed, setBreed] = useState('')
  var [description, setDescription] = useState('')
  var [image, setImage] = useState('')
  var navigate = useNavigate()

  var handleSubmit = (e) => {
    e.preventDefault()
    
    if (!name || !age || !breed) {
      alert('Заполните все поля!')
      return
    }

    var savedPets = localStorage.getItem('pets')
    var pets = savedPets ? JSON.parse(savedPets) : []
    
    var newId = 1
    if (pets.length > 0) {
      newId = Math.max(...pets.map(p => p.id)) + 1
    }

    var defaultImage = type === 'Собака' 
      ? 'https://images.dog.ceo/breeds/retriever-golden/n02099601_1003.jpg'
      : 'https://cdn2.thecatapi.com/images/MTY3ODIyMQ.jpg'

    var newPet = {
      id: newId,
      name: name,
      type: type,
      age: parseInt(age),
      breed: breed,
      description: description,
      image: image || defaultImage,
      adopted: false
    }

    pets.push(newPet)
    localStorage.setItem('pets', JSON.stringify(pets))
    
    alert('Питомец добавлен!')
    navigate('/')
  }

  return (
    <div style={{maxWidth: '600px', margin: '0 auto', padding: '20px'}}>
      <Link to="/" style={{
        color: '#2196F3',
        textDecoration: 'none',
        marginBottom: '20px',
        display: 'inline-block'
      }}>← Назад</Link>

      <h2>Добавить нового питомца</h2>

      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
            Кличка *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
            Тип *
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          >
            <option value="Собака">Собака</option>
            <option value="Кошка">Кошка</option>
          </select>
        </div>

        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
            Возраст (лет) *
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
            Порода *
          </label>
          <input
            type="text"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
            Описание
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{marginBottom: '20px'}}>
          <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
            URL изображения
          </label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://..."
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <small style={{color: '#666'}}>Оставьте пустым для изображения по умолчанию</small>
        </div>

        <button type="submit" style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontSize: '16px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}>
          Добавить питомца
        </button>
      </form>
    </div>
  )
}

export default AddPet
