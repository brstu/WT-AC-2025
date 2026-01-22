import { Link } from 'react-router-dom'
import { useState } from 'react'

function VacanciesList({ vacancies, companies, responses, setResponses }) {
  const [filter, setFilter] = useState('')

  const filteredVacancies = filter 
    ? vacancies.filter(v => v.city.toLowerCase().includes(filter.toLowerCase()))
    : vacancies

  const handleResponse = (vacancyId) => {
    const name = prompt('Введите ваше имя:')
    const email = prompt('Введите email:')
    
    if (name && email) {
      const newResponse = {
        id: responses.length + 1,
        vacancyId: vacancyId,
        name: name,
        email: email,
        date: new Date().toLocaleDateString()
      }
      setResponses([...responses, newResponse])
      alert('Отклик отправлен!')
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>Вакансии</h1>
      
      <div style={{ marginTop: '20px', marginBottom: '30px' }}>
        <input 
          type="text"
          placeholder="Фильтр по городу..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '12px',
            width: '300px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredVacancies.map(vacancy => {
          const company = companies.find(c => c.id === vacancy.companyId)
          return (
            <div key={vacancy.id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '25px',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ marginBottom: '10px' }}>{vacancy.title}</h2>
                  <p style={{ color: '#666', fontSize: '16px' }}>
                    {company ? company.name : 'Компания не найдена'}
                  </p>
                  <p style={{ 
                    color: '#28a745', 
                    fontWeight: 'bold', 
                    fontSize: '18px',
                    marginTop: '10px'
                  }}>
                    {vacancy.salary}
                  </p>
                  <p style={{ marginTop: '10px' }}>
                    <strong>Город:</strong> {vacancy.city}
                  </p>
                  <p style={{ marginTop: '10px' }}>
                    <strong>Требования:</strong> {vacancy.requirements}
                  </p>
                  <p style={{ marginTop: '10px' }}>{vacancy.description}</p>
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '10px',
                  marginLeft: '20px'
                }}>
                  <Link to={`/vacancies/${vacancy.id}`} style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    textAlign: 'center'
                  }}>
                    Подробнее
                  </Link>
                  <button onClick={() => handleResponse(vacancy.id)} style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    Откликнуться
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredVacancies.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
          Вакансии не найдены
        </p>
      )}
    </div>
  )
}

export default VacanciesList
