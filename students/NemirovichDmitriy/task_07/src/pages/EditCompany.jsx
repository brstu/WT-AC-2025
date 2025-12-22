import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function EditCompany({ companies, setCompanies }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const company = companies.find(c => c.id === parseInt(id))
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [employees, setEmployees] = useState('')
  const [logo, setLogo] = useState('')

  useEffect(() => {
    if (company) {
      setName(company.name)
      setDescription(company.description)
      setCity(company.city)
      setEmployees(company.employees.toString())
      setLogo(company.logo)
    }
  }, [company])

  if (!company) {
    return <div style={{ padding: '20px' }}>Компания не найдена</div>
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const updatedCompanies = companies.map(c => {
      if (c.id === parseInt(id)) {
        return {
          ...c,
          name: name,
          description: description,
          city: city,
          employees: parseInt(employees),
          logo: logo
        }
      }
      return c
    })
    
    setCompanies(updatedCompanies)
    alert('Компания обновлена!')
    navigate(`/companies/${id}`)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Редактировать компанию</h1>
      
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
          <button type="button" onClick={() => navigate(`/companies/${id}`)} style={{
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

export default EditCompany
