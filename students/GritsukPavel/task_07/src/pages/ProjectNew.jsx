import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function ProjectNew() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    
    let newErrors = {}
    if (!title) newErrors.title = 'Заголовок обязателен'
    if (!description) newErrors.description = 'Описание обязательно'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      body: JSON.stringify({
        title: title,
        body: description,
        userId: 1,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    })
      .then(response => response.json())
      .then(data => {
        alert('Проект создан!')
        navigate('/')
      })
  }

  return (
    <div>
      <Link to="/">← Назад</Link>
      <h1>Новый проект</h1>
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom: '15px'}}>
          <label>
            Название:
            <br />
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              style={{width: '300px', padding: '5px'}}
            />
          </label>
          {errors.title && <div style={{color: 'red'}}>{errors.title}</div>}
        </div>
        
        <div style={{marginBottom: '15px'}}>
          <label>
            Описание:
            <br />
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              style={{width: '300px', height: '100px', padding: '5px'}}
            />
          </label>
          {errors.description && <div style={{color: 'red'}}>{errors.description}</div>}
        </div>
        
        <button type="submit" style={{padding: '10px 20px'}}>
          Создать
        </button>
      </form>
    </div>
  )
}

export default ProjectNew
