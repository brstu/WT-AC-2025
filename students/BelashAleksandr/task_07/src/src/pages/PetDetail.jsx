import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

function PetDetail(props) {
  var { id } = useParams()
  var [pet, setPet] = useState(null)
  var [loading, setLoading] = useState(true)
  var navigate = useNavigate()

  useEffect(() => {
    var savedPets = localStorage.getItem('pets')
    if (savedPets) {
      var pets = JSON.parse(savedPets)
      var foundPet = pets.find(p => p.id === parseInt(id))
      if (foundPet) {
        setPet(foundPet)
      }
    }
    setLoading(false)
  }, [id])

  var toggleAdopted = () => {
    var savedPets = localStorage.getItem('pets')
    if (savedPets) {
      var pets = JSON.parse(savedPets)
      var index = pets.findIndex(p => p.id === parseInt(id))
      if (index !== -1) {
        pets[index].adopted = !pets[index].adopted
        localStorage.setItem('pets', JSON.stringify(pets))
        setPet(pets[index])
        alert('Статус изменен!')
      }
    }
  }

  var deletePet = () => {
    if (confirm('Вы уверены, что хотите удалить этого питомца?')) {
      var savedPets = localStorage.getItem('pets')
      if (savedPets) {
        var pets = JSON.parse(savedPets)
        var newPets = pets.filter(p => p.id !== parseInt(id))
        localStorage.setItem('pets', JSON.stringify(newPets))
        alert('Питомец удален')
        navigate('/')
      }
    }
  }

  if (loading) {
    return <div style={{textAlign: 'center', marginTop: '50px'}}>Загрузка...</div>
  }

  if (!pet) {
    return <div style={{textAlign: 'center', marginTop: '50px'}}>Питомец не найден</div>
  }

  return (
    <div style={{maxWidth: '800px', margin: '0 auto', padding: '20px'}}>
      <Link to="/" style={{
        color: '#2196F3',
        textDecoration: 'none',
        marginBottom: '20px',
        display: 'inline-block'
      }}>← Назад к списку</Link>

      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{display: 'flex', gap: '30px', flexWrap: 'wrap'}}>
          <div style={{flex: '1', minWidth: '300px'}}>
            <img src={pet.image} alt={pet.name} style={{
              width: '100%',
              height: 'auto',
              borderRadius: '8px'
            }} />
          </div>
          
          <div style={{flex: '1', minWidth: '300px'}}>
            <h1 style={{marginTop: 0}}>{pet.name}</h1>
            
            {pet.adopted && (
              <div style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '10px 15px',
                borderRadius: '5px',
                display: 'inline-block',
                marginBottom: '20px'
              }}>
                ✓ Нашел дом
              </div>
            )}

            <div style={{marginBottom: '15px'}}>
              <p style={{margin: '10px 0'}}>
                <strong>Тип:</strong> {pet.type}
              </p>
              <p style={{margin: '10px 0'}}>
                <strong>Возраст:</strong> {pet.age} лет
              </p>
              <p style={{margin: '10px 0'}}>
                <strong>Порода:</strong> {pet.breed}
              </p>
            </div>

            <div style={{
              backgroundColor: '#f5f5f5',
              padding: '15px',
              borderRadius: '5px',
              marginBottom: '20px'
            }}>
              <h3 style={{marginTop: 0}}>Описание</h3>
              <p style={{lineHeight: '1.6'}}>{pet.description}</p>
            </div>

            {props.user && (
              <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                <button onClick={toggleAdopted} style={{
                  padding: '10px 20px',
                  backgroundColor: pet.adopted ? '#666' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}>
                  {pet.adopted ? 'Вернуть в приют' : 'Отметить как пристроенного'}
                </button>
                
                <Link to={`/edit/${pet.id}`} style={{
                  padding: '10px 20px',
                  backgroundColor: '#FF9800',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  display: 'inline-block',
                  fontSize: '16px'
                }}>
                  Редактировать
                </Link>

                <button onClick={deletePet} style={{
                  padding: '10px 20px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}>
                  Удалить
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PetDetail
