import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

function VacancyDetail({ vacancies, companies, responses, setResponses }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const vacancy = vacancies.find(v => v.id === parseInt(id))
  const company = vacancy ? companies.find(c => c.id === vacancy.companyId) : null
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [showForm, setShowForm] = useState(false)

  if (!vacancy) {
    return <div style={{ padding: '20px' }}>Вакансия не найдена</div>
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newResponse = {
      id: responses.length + 1,
      vacancyId: vacancy.id,
      name: name,
      email: email,
      phone: phone,
      coverLetter: coverLetter,
      date: new Date().toLocaleDateString()
    }
    
    setResponses([...responses, newResponse])
    alert('Ваш отклик успешно отправлен!')
    setShowForm(false)
    setName('')
    setEmail('')
    setPhone('')
    setCoverLetter('')
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
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
        <h1>{vacancy.title}</h1>
        
        {company && (
          <div style={{ 
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px'
          }}>
            <Link to={`/companies/${company.id}`} style={{
              fontSize: '18px',
              color: '#007bff',
              textDecoration: 'none'
            }}>
              {company.name}
            </Link>
            <p style={{ marginTop: '5px', color: '#666' }}>{company.city}</p>
          </div>
        )}

        <div style={{ marginTop: '30px' }}>
          <p style={{ 
            fontSize: '24px', 
            color: '#28a745',
            fontWeight: 'bold'
          }}>
            {vacancy.salary}
          </p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3>Город</h3>
          <p style={{ marginTop: '10px' }}>{vacancy.city}</p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3>Требования</h3>
          <p style={{ marginTop: '10px' }}>{vacancy.requirements}</p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3>Описание вакансии</h3>
          <p style={{ marginTop: '10px', lineHeight: '1.6' }}>{vacancy.description}</p>
        </div>

        <button onClick={() => setShowForm(!showForm)} style={{
          marginTop: '30px',
          padding: '15px 40px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '18px',
          cursor: 'pointer'
        }}>
          {showForm ? 'Скрыть форму' : 'Откликнуться на вакансию'}
        </button>

        {showForm && (
          <div style={{ 
            marginTop: '30px',
            padding: '25px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <h3>Форма отклика</h3>
            <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Ваше имя: *
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
                  Email: *
                </label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  Телефон:
                </label>
                <input 
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                  Сопроводительное письмо:
                </label>
                <textarea 
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows="6"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <button type="submit" style={{
                padding: '12px 30px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer'
              }}>
                Отправить отклик
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default VacancyDetail
