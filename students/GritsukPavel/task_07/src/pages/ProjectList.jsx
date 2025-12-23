import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function ProjectList() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/posts')
      .then(response => response.json())
      .then(data => {
        const projectsData = data.slice(0, 10).map(item => ({
          id: item.id,
          title: item.title,
          description: item.body,
          imageUrl: `https://picsum.photos/seed/${item.id}/300/200`
        }))
        setProjects(projectsData)
        setLoading(false)
      })
      .catch(err => {
        setError('Ошибка загрузки')
        setLoading(false)
      })
  }, [])

  const handleDelete = (id) => {
    if (confirm('Удалить проект?')) {
      fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          setProjects(projects.filter(p => p.id !== id))
          alert('Проект удален')
        })
    }
  }

  if (loading) return <div>Загрузка...</div>
  if (error) return <div style={{color: 'red'}}>{error}</div>
  if (projects.length === 0) return <div>Нет проектов</div>

  return (
    <div>
      <h1>Мои проекты</h1>
      <div>
        {projects.map(project => (
          <div key={project.id} style={{border: '1px solid #ccc', padding: '15px', marginBottom: '10px'}}>
            <img src={project.imageUrl} alt={project.title} style={{width: '200px', height: '150px', objectFit: 'cover'}} />
            <h3>{project.title}</h3>
            <p>{project.description.substring(0, 100)}...</p>
            <Link to={`/projects/${project.id}`}>
              <button style={{marginRight: '10px'}}>Подробнее</button>
            </Link>
            <Link to={`/projects/${project.id}/edit`}>
              <button style={{marginRight: '10px'}}>Редактировать</button>
            </Link>
            <button onClick={() => handleDelete(project.id)} style={{background: '#ff4444', color: 'white'}}>
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectList
