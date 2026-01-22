import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

function CompanyDetail({ companies, vacancies, responses, setResponses }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const company = companies.find(c => c.id === parseInt(id))
  const companyVacancies = vacancies.filter(v => v.companyId === parseInt(id))
  
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')

  if (!company) {
    return <div style={{ padding: '20px' }}>Компания не найдена</div>
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newResponse = {
      id: responses.length + 1,
      companyId: company.id,
      name: name,
      email: email,
      phone: phone,
      message: message,
      date: new Date().toLocaleDateString()
    }
    setResponses([...responses, newResponse])
    alert('Отклик отправлен!')
    setShowForm(false)
    setName('')
    setEmail('')
    setPhone('')
    setMessage('')
  }

  const deleteCompany = () => {
    if (window.confirm('Удалить компанию?')) {
      alert('Функция удаления не реализована')
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <button onClick={() => navigate(-1)} style={{
        padding: '10px 20px',
        marginBottom: '20px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}>
        Назад
      </button>

      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: '30px' }}>
          <img src={company.logo} alt={company.name} style={{ 
            width: '200px', 
            height: '200px', 
            objectFit: 'cover',
            borderRadius: '8px' 
          }} />
          <div style={{ flex: 1 }}>
            <h1>{company.name}</h1>
            <p style={{ fontSize: '18px', color: '#666', marginTop: '10px' }}>
              <strong>Город:</strong> {company.city}
            </p>
            <p style={{ fontSize: '18px', color: '#666' }}>
              <strong>Сотрудников:</strong> {company.employees}
            </p>
            <p style={{ marginTop: '20px', lineHeight: '1.6' }}>
              {company.description}
            </p>
            
            <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
              <Link to={`/companies/${company.id}/edit`} style={{
                padding: '10px 20px',
                backgroundColor: '#ffc107',
                color: 'black',
                textDecoration: 'none',
                borderRadius: '4px'
              }}>
                Редактировать
              </Link>
              <button onClick={deleteCompany} style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Удалить
              </button>
              <button onClick={() => setShowForm(!showForm)} style={{
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

        {showForm && (
          <div style={{ 
            marginTop: '30px', 
            padding: '20px', 
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <h3>Отправить отклик</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Имя:</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }} 
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }} 
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Телефон:</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }} 
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Сообщение:</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="4"
                  style={{ 
                    width: '100%', 
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }} 
                />
              </div>
              <button type="submit" style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Отправить
              </button>
            </form>
          </div>
        )}

        <div style={{ marginTop: '40px' }}>
          <h2>Вакансии компании ({companyVacancies.length})</h2>
          {companyVacancies.length === 0 ? (
            <p style={{ color: '#666', marginTop: '20px' }}>Нет доступных вакансий</p>
          ) : (
            <div style={{ marginTop: '20px' }}>
              {companyVacancies.map(vacancy => (
                <div key={vacancy.id} style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '15px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <h3>{vacancy.title}</h3>
                  <p style={{ color: '#28a745', fontWeight: 'bold', marginTop: '10px' }}>
                    {vacancy.salary}
                  </p>
                  <p style={{ marginTop: '10px' }}><strong>Город:</strong> {vacancy.city}</p>
                  <p style={{ marginTop: '10px' }}>{vacancy.description}</p>
                  <Link to={`/vacancies/${vacancy.id}`} style={{
                    display: 'inline-block',
                    marginTop: '15px',
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px'
                  }}>
                    Подробнее
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CompanyDetail
