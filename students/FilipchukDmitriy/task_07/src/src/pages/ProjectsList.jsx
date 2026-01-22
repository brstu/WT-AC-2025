import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

var data = []

function ProjectsList() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    loadProjects()
  }, [])
  
  useEffect(() => {
    if (projects.length > 0) {
      console.log('Projects loaded:', projects)
    }
  }, [projects])
  
  const loadProjects = () => {
    setLoading(true)
    
    var stored = localStorage.getItem('projects')
    if (stored) {
      data = JSON.parse(stored)
      setProjects(data)
      setLoading(false)
    } else {
      fetch('https://api.github.com/search/repositories?q=language:javascript+stars:>1000&sort=stars&per_page=15')
        .then(response => response.json())
        .then(result => {
          var projectsData = result.items.map((item, index) => {
            return {
              id: index + 1,
              name: item.name,
              description: item.description || 'Описание отсутствует',
              author: item.owner.login,
              stars: item.stargazers_count,
              language: item.language,
              url: item.html_url,
              image: 'https://picsum.photos/200/150?random=' + index
            }
          })
          
          data = projectsData
          localStorage.setItem('projects', JSON.stringify(projectsData))
          setProjects(projectsData)
          setLoading(false)
        })
        .catch(err => {
          setError('Ошибка загрузки')
          setLoading(false)
        })
    }
  }
  
  function deleteProject(id) {
    if (confirm('Удалить проект?')) {
      var newProjects = projects.filter(p => p.id !== id)
      setProjects(newProjects)
      localStorage.setItem('projects', JSON.stringify(newProjects))
    }
  }
  
  if (loading) {
    return <div style={{padding: '20px', fontSize: '18px'}}>Загрузка...</div>
  }
  
  if (error) {
    return <div style={{padding: '20px', color: 'red'}}>{error}</div>
  }
  
  if (projects.length === 0) {
    return <div style={{padding: '20px'}}>Нет проектов. <Link to="/new">Добавить проект</Link></div>
  }
  
  return (
    <div>
      <h2>Список проектов</h2>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px'}}>
        {projects.map(project => (
          <div key={project.id} style={{border: '1px solid #ddd', padding: '15px', borderRadius: '5px'}}>
            <img src={project.image} style={{width: '100%', height: '150px', objectFit: 'cover'}} />
            <h3 style={{marginTop: '10px'}}>{project.name}</h3>
            <p style={{color: '#666', fontSize: '14px'}}>{project.description}</p>
            <p style={{fontSize: '12px', color: '#999'}}>Автор: {project.author}</p>
            <p style={{fontSize: '12px', color: '#999'}}>⭐ {project.stars}</p>
            <div style={{marginTop: '10px', display: 'flex', gap: '10px'}}>
              <Link to={'/project/' + project.id} style={{color: 'blue'}}>Подробнее</Link>
              <Link to={'/edit/' + project.id} style={{color: 'green'}}>Редактировать</Link>
              <button onClick={() => deleteProject(project.id)} style={{color: 'red', background: 'none', border: 'none', cursor: 'pointer'}}>Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectsList
