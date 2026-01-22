import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useState } from 'react'
import CompaniesList from './pages/CompaniesList'
import CompanyDetail from './pages/CompanyDetail'
import VacanciesList from './pages/VacanciesList'
import VacancyDetail from './pages/VacancyDetail'
import NewCompany from './pages/NewCompany'
import EditCompany from './pages/EditCompany'
import NewVacancy from './pages/NewVacancy'
import NotFound from './pages/NotFound'

function App() {
  const [companies, setCompanies] = useState([
    { id: 1, name: 'ООО "ТехноСофт"', description: 'Разработка программного обеспечения', city: 'Минск', employees: 150, logo: 'https://via.placeholder.com/150/0000FF/808080?text=ТехноСофт' },
    { id: 2, name: 'ЗАО "БизнесПро"', description: 'Консалтинговые услуги', city: 'Брест', employees: 80, logo: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=БизнесПро' },
    { id: 3, name: 'ИП Иванов А.А.', description: 'Веб-разработка', city: 'Гомель', employees: 25, logo: 'https://via.placeholder.com/150/00FF00/000000?text=Иванов' }
  ])

  const [vacancies, setVacancies] = useState([
    { id: 1, companyId: 1, title: 'Стажёр Frontend разработчик', salary: '800-1000 BYN', requirements: 'Знание HTML, CSS, JavaScript', description: 'Работа в дружной команде', city: 'Минск' },
    { id: 2, companyId: 1, title: 'Junior Backend разработчик', salary: '1200-1500 BYN', requirements: 'Python, Django', description: 'Разработка веб-приложений', city: 'Минск' },
    { id: 3, companyId: 2, title: 'Аналитик данных', salary: '1000-1300 BYN', requirements: 'Excel, SQL', description: 'Анализ бизнес-процессов', city: 'Брест' },
    { id: 4, companyId: 3, title: 'Веб-дизайнер', salary: '700-900 BYN', requirements: 'Figma, Adobe XD', description: 'Создание дизайна сайтов', city: 'Гомель' }
  ])

  const [responses, setResponses] = useState([])

  return (
    <BrowserRouter>
      <div style={{ 
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <nav style={{
          backgroundColor: '#333',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto',
            display: 'flex',
            gap: '30px',
            alignItems: 'center'
          }}>
            <Link to="/" style={{ 
              color: 'white', 
              textDecoration: 'none',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              Портал стажировок
            </Link>
            <Link to="/companies" style={{ color: 'white', textDecoration: 'none' }}>
              Компании
            </Link>
            <Link to="/vacancies" style={{ color: 'white', textDecoration: 'none' }}>
              Вакансии
            </Link>
            <Link to="/companies/new" style={{ color: 'white', textDecoration: 'none' }}>
              Добавить компанию
            </Link>
            <Link to="/vacancies/new" style={{ color: 'white', textDecoration: 'none' }}>
              Добавить вакансию
            </Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
              <h1>Добро пожаловать на портал стажировок!</h1>
              <p>Здесь вы можете найти компании, вакансии и откликнуться на интересующие предложения.</p>
              <div style={{ marginTop: '30px' }}>
                <h2>Статистика:</h2>
                <p>Компаний в базе: {companies.length}</p>
                <p>Вакансий доступно: {vacancies.length}</p>
                <p>Откликов отправлено: {responses.length}</p>
              </div>
            </div>
          } />
          <Route path="/companies" element={<CompaniesList companies={companies} />} />
          <Route path="/companies/:id" element={<CompanyDetail companies={companies} vacancies={vacancies} responses={responses} setResponses={setResponses} />} />
          <Route path="/companies/new" element={<NewCompany companies={companies} setCompanies={setCompanies} />} />
          <Route path="/companies/:id/edit" element={<EditCompany companies={companies} setCompanies={setCompanies} />} />
          <Route path="/vacancies" element={<VacanciesList vacancies={vacancies} companies={companies} responses={responses} setResponses={setResponses} />} />
          <Route path="/vacancies/:id" element={<VacancyDetail vacancies={vacancies} companies={companies} responses={responses} setResponses={setResponses} />} />
          <Route path="/vacancies/new" element={<NewVacancy vacancies={vacancies} setVacancies={setVacancies} companies={companies} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
