import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
      .then(response => response.json())
      .then(data => {
        setProject({
          id: data.id,
          title: data.title,
          description: data.body,
          imageUrl: `https://picsum.photos/seed/${data.id}/600/400`
        })
        setLoading(false)
      })
      .catch(err => {
        setLoading(false)
      })
  }, [id])

  const handleDelete = () => {
    if (confirm('Точно удалить?')) {
      fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          alert('Удалено')
          navigate('/')
        })
    }
  }

  if (loading) return <div>Загрузка...</div>
  if (!project) return <div>Проект не найден</div>

  return (
    <div>
      <Link to="/">← Назад к списку</Link>
      <h1>{project.title}</h1>
      <img src={project.imageUrl} alt={project.title} style={{width: '100%', maxWidth: '600px'}} />
      <p style={{marginTop: '20px'}}>{project.description}</p>
      <div style={{marginTop: '20px'}}>
        <Link to={`/projects/${id}/edit`}>
          <button style={{marginRight: '10px'}}>Редактировать</button>
        </Link>
        <button onClick={handleDelete} style={{background: '#ff4444', color: 'white'}}>
          Удалить
        </button>
      </div>
    </div>
  )
}

export default ProjectDetail
