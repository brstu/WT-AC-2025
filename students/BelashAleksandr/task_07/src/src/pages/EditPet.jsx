import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

function EditPet() {
  var { id } = useParams()
  var [name, setName] = useState('')
  var [type, setType] = useState('Собака')
  var [age, setAge] = useState('')
  var [breed, setBreed] = useState('')
  var [description, setDescription] = useState('')
  var [image, setImage] = useState('')
  var [adopted, setAdopted] = useState(false)
  var [loading, setLoading] = useState(true)
  var navigate = useNavigate()

  useEffect(() => {
    var savedPets = localStorage.getItem('pets')
    if (savedPets) {
      var pets = JSON.parse(savedPets)
      var pet = pets.find(p => p.id === parseInt(id))
      if (pet) {
        setName(pet.name)
        setType(pet.type)
        setAge(pet.age.toString())
        setBreed(pet.breed)
        setDescription(pet.description)
        setImage(pet.image)
        setAdopted(pet.adopted)
      }
    }
    setLoading(false)
  }, [id])

  var handleSubmit = (e) => {
    e.preventDefault()
    
    if (!name || !age || !breed) {
      alert('Заполните обязательные поля!')
      return
    }

    var savedPets = localStorage.getItem('pets')
    if (savedPets) {
      var pets = JSON.parse(savedPets)
      var index = pets.findIndex(p => p.id === parseInt(id))
      
      if (index !== -1) {
        pets[index] = {
          ...pets[index],
          name: name,
          type: type,
          age: parseInt(age),
          breed: breed,
          description: description,
          image: image,
          adopted: adopted
        }
        
        localStorage.setItem('pets', JSON.stringify(pets))
        alert('Данные обновлены!')
        navigate(`/pet/${id}`)
      }
    }
  }

  if (loading) {
    return <div style={{textAlign: 'center', marginTop: '50px'}}>Загрузка...</div>
  }

  return (
    <div style={{maxWidth: '600px', margin: '0 auto', padding: '20px'}}>
      <Link to={`/pet/${id}`} style={{
        color: '#2196F3',
        textDecoration: 'none',
        marginBottom: '20px',
        display: 'inline-block'
      }}>← Назад</Link>

      <h2>Редактировать питомца</h2>

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

        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
            URL изображения
          </label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{marginBottom: '20px'}}>
          <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
            <input
              type="checkbox"
              checked={adopted}
              onChange={(e) => setAdopted(e.target.checked)}
              style={{marginRight: '10px', width: '20px', height: '20px'}}
            />
            <span style={{fontWeight: 'bold'}}>Питомец пристроен</span>
          </label>
        </div>

        <button type="submit" style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#FF9800',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontSize: '16px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}>
          Сохранить изменения
        </button>
      </form>
    </div>
  )
}

export default EditPet
