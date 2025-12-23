import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function NewArt() {
  var navigate = useNavigate()
  var [title, setTitle] = useState('')
  var [author, setAuthor] = useState('')
  var [description, setDescription] = useState('')
  var [year, setYear] = useState('')
  var [image, setImage] = useState('')
  var [errors, setErrors] = useState({})

  var handleSubmit = (e) => {
    e.preventDefault()
    
    var newErrors = {}
    if (!title) {
      newErrors.title = 'Название обязательно'
    }
    if (!author) {
      newErrors.author = 'Автор обязателен'
    }
    if (!year) {
      newErrors.year = 'Год обязателен'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    var data = localStorage.getItem('arts')
    var arts = data ? JSON.parse(data) : []
    var maxId = 0
    for (var i = 0; i < arts.length; i++) {
      if (arts[i].id > maxId) {
        maxId = arts[i].id
      }
    }
    
    var newArt = {
      id: maxId + 1,
      title: title,
      author: author,
      description: description,
      year: parseInt(year),
      image: image || `https://picsum.photos/seed/${maxId + 1}/400/300`
    }
    
    arts.push(newArt)
    localStorage.setItem('arts', JSON.stringify(arts))
    alert('Арт добавлен!')
    navigate('/')
  }

  return (
    <div style={{padding: '20px', maxWidth: '600px'}}>
      <h2>Добавить новый арт</h2>
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '5px'}}>Название:</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{width: '100%', padding: '8px'}}
          />
          {errors.title && <span style={{color: 'red'}}>{errors.title}</span>}
        </div>
        
        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '5px'}}>Автор:</label>
          <input 
            type="text" 
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            style={{width: '100%', padding: '8px'}}
          />
          {errors.author && <span style={{color: 'red'}}>{errors.author}</span>}
        </div>
        
        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '5px'}}>Описание:</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{width: '100%', padding: '8px', minHeight: '100px'}}
          />
        </div>
        
        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '5px'}}>Год:</label>
          <input 
            type="number" 
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{width: '100%', padding: '8px'}}
          />
          {errors.year && <span style={{color: 'red'}}>{errors.year}</span>}
        </div>
        
        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '5px'}}>URL изображения (необязательно):</label>
          <input 
            type="text" 
            value={image}
            onChange={(e) => setImage(e.target.value)}
            style={{width: '100%', padding: '8px'}}
          />
        </div>
        
        <button type="submit" style={{background: '#333', color: 'white', padding: '10px 20px', border: 'none', cursor: 'pointer'}}>
          Добавить
        </button>
      </form>
    </div>
  )
}

export default NewArt
