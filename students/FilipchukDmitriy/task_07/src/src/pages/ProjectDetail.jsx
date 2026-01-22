import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    var projects = localStorage.getItem('projects')
    if (projects) {
      var allProjects = JSON.parse(projects)
      var found = allProjects.find(p => p.id == id)
      if (found) {
        setProject(found)
      }
    }
    setLoading(false)
  }, [id])
  
  function deleteProject() {
    if (confirm('Вы уверены?')) {
      var projects = JSON.parse(localStorage.getItem('projects'))
      var filtered = projects.filter(p => p.id != id)
      localStorage.setItem('projects', JSON.stringify(filtered))
      navigate('/')
    }
  }
  
  if (loading) {
    return <div>Загрузка...</div>
  }
  
  if (!project) {
    return (
      <div>
        <h2>Проект не найден</h2>
        <Link to="/">Вернуться к списку</Link>
      </div>
    )
  }
  
  return (
    <div>
      <Link to="/" style={{marginBottom: '20px', display: 'inline-block'}}>← Назад к списку</Link>
      
      <div style={{maxWidth: '800px'}}>
        <img src={project.image} style={{width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px'}} />
        
        <h1 style={{marginTop: '20px'}}>{project.name}</h1>
        
        <div style={{backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px', marginTop: '15px'}}>
          <p><strong>Автор:</strong> {project.author}</p>
          <p><strong>Язык:</strong> {project.language}</p>
          <p><strong>Звезды:</strong> ⭐ {project.stars}</p>
          {project.url && <p><strong>URL:</strong> <a href={project.url} target="_blank">{project.url}</a></p>}
        </div>
        
        <div style={{marginTop: '20px'}}>
          <h3>Описание</h3>
          <p>{project.description}</p>
        </div>
        
        <div style={{marginTop: '30px', display: 'flex', gap: '15px'}}>
          <button onClick={() => navigate('/edit/' + project.id)} style={{padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
            Редактировать
          </button>
          <button onClick={deleteProject} style={{padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetail
