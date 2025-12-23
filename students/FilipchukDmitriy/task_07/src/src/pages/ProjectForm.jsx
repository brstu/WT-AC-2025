import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

var errors = {}

function ProjectForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    author: '',
    stars: '',
    language: '',
    url: ''
  })
  const [validationErrors, setValidationErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  
  useEffect(() => {
    if (id) {
      var projects = localStorage.getItem('projects')
      if (projects) {
        var allProjects = JSON.parse(projects)
        var project = allProjects.find(p => p.id == id)
        if (project) {
          setFormData({
            name: project.name,
            description: project.description,
            author: project.author,
            stars: project.stars,
            language: project.language,
            url: project.url || ''
          })
        }
      }
    }
  }, [id])
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    
    if (validationErrors[e.target.name]) {
      var newErrors = {...validationErrors}
      delete newErrors[e.target.name]
      setValidationErrors(newErrors)
    }
  }
  
  function validate() {
    errors = {}
    
    if (!formData.name) {
      errors.name = 'Введите название'
    }
    
    if (!formData.description) {
      errors.description = 'Введите описание'
    }
    
    if (!formData.author) {
      errors.author = 'Введите автора'
    }
    
    if (formData.stars && isNaN(formData.stars)) {
      errors.stars = 'Звезды должны быть числом'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitError('')
    
    if (!validate()) {
      return
    }
    
    var projects = localStorage.getItem('projects')
    var allProjects = projects ? JSON.parse(projects) : []
    
    if (id) {
      var index = allProjects.findIndex(p => p.id == id)
      if (index !== -1) {
        allProjects[index] = {
          ...allProjects[index],
          name: formData.name,
          description: formData.description,
          author: formData.author,
          stars: formData.stars ? parseInt(formData.stars) : 0,
          language: formData.language,
          url: formData.url
        }
      }
    } else {
      var newId = allProjects.length > 0 ? Math.max(...allProjects.map(p => p.id)) + 1 : 1
      var newProject = {
        id: newId,
        name: formData.name,
        description: formData.description,
        author: formData.author,
        stars: formData.stars ? parseInt(formData.stars) : 0,
        language: formData.language,
        url: formData.url,
        image: 'https://picsum.photos/200/150?random=' + newId
      }
      allProjects.push(newProject)
    }
    
    localStorage.setItem('projects', JSON.stringify(allProjects))
    navigate('/')
  }
  
  return (
    <div>
      <Link to="/" style={{marginBottom: '20px', display: 'inline-block'}}>← Назад</Link>
      
      <h2>{id ? 'Редактировать проект' : 'Добавить новый проект'}</h2>
      
      {submitError && <div style={{color: 'red', marginBottom: '15px'}}>{submitError}</div>}
      
      <form onSubmit={handleSubmit} style={{maxWidth: '600px'}}>
        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '5px'}}>Название *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px'}}
          />
          {validationErrors.name && <div style={{color: 'red', fontSize: '12px', marginTop: '3px'}}>{validationErrors.name}</div>}
        </div>
        
        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '5px'}}>Описание *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            style={{width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px'}}
          />
          {validationErrors.description && <div style={{color: 'red', fontSize: '12px', marginTop: '3px'}}>{validationErrors.description}</div>}
        </div>
        
        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '5px'}}>Автор *</label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            style={{width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px'}}
          />
          {validationErrors.author && <div style={{color: 'red', fontSize: '12px', marginTop: '3px'}}>{validationErrors.author}</div>}
        </div>
        
        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '5px'}}>Количество звезд</label>
          <input
            type="text"
            name="stars"
            value={formData.stars}
            onChange={handleChange}
            style={{width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px'}}
          />
          {validationErrors.stars && <div style={{color: 'red', fontSize: '12px', marginTop: '3px'}}>{validationErrors.stars}</div>}
        </div>
        
        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '5px'}}>Язык программирования</label>
          <input
            type="text"
            name="language"
            value={formData.language}
            onChange={handleChange}
            style={{width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px'}}
          />
        </div>
        
        <div style={{marginBottom: '20px'}}>
          <label style={{display: 'block', marginBottom: '5px'}}>URL репозитория</label>
          <input
            type="text"
            name="url"
            value={formData.url}
            onChange={handleChange}
            style={{width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px'}}
          />
        </div>
        
        <div style={{display: 'flex', gap: '10px'}}>
          <button type="submit" style={{padding: '10px 30px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px'}}>
            {id ? 'Сохранить' : 'Создать'}
          </button>
          <button type="button" onClick={() => navigate('/')} style={{padding: '10px 30px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px'}}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProjectForm
