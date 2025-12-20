import { Link } from 'react-router-dom'

function CompaniesList({ companies }) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>Список компаний</h1>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '20px',
        marginTop: '30px'
      }}>
        {companies.map(company => (
          <div key={company.id} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <img src={company.logo} alt={company.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} />
            <h3 style={{ marginTop: '15px' }}>{company.name}</h3>
            <p style={{ color: '#666' }}>{company.city}</p>
            <p style={{ fontSize: '14px', color: '#888' }}>Сотрудников: {company.employees}</p>
            <p style={{ marginTop: '10px' }}>{company.description}</p>
            <Link to={`/companies/${company.id}`} style={{
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
    </div>
  )
}

export default CompaniesList
