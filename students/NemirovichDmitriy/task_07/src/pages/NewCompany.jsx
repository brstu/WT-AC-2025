import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function NewCompany({ companies, setCompanies }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [employees, setEmployees] = useState('')
  const [logo, setLogo] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newCompany = {
      id: companies.length + 1,
      name: name,
      description: description,
      city: city,
      employees: parseInt(employees),
      logo: logo || 'https://via.placeholder.com/150/CCCCCC/000000?text=Компания'
    }
    
    setCompanies([...companies, newCompany])
    alert('Компания добавлена!')
    navigate('/companies')
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Добавить новую компанию</h1>
      
      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        marginTop: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Название компании:
          </label>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Описание:
          </label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Город:
          </label>
          <input 
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Количество сотрудников:
          </label>
          <input 
            type="number"
            value={employees}
            onChange={(e) => setEmployees(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            URL логотипа:
          </label>
          <input 
            type="text"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            placeholder="https://..."
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{
            padding: '12px 30px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
          }}>
            Сохранить
          </button>
          <button type="button" onClick={() => navigate('/companies')} style={{
            padding: '12px 30px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
          }}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  )
}

export default NewCompany
