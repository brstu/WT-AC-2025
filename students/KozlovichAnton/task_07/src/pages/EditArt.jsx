import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function EditArt() {
  var { id } = useParams()
  var navigate = useNavigate()
  var [title, setTitle] = useState('')
  var [author, setAuthor] = useState('')
  var [description, setDescription] = useState('')
  var [year, setYear] = useState('')
  var [image, setImage] = useState('')
  var [errors, setErrors] = useState({})
  var [loading, setLoading] = useState(true)

  useEffect(() => {
    var data = localStorage.getItem('arts')
    if (data) {
      var arts = JSON.parse(data)
      var art = arts.find(a => a.id == id)
      if (art) {
        setTitle(art.title)
        setAuthor(art.author)
        setDescription(art.description)
        setYear(art.year.toString())
        setImage(art.image)
      }
    }
    setLoading(false)
  }, [id])

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
    var arts = JSON.parse(data)
    var index = -1
    for (var i = 0; i < arts.length; i++) {
      if (arts[i].id == id) {
        index = i
        break
      }
    }
    
    if (index !== -1) {
      arts[index] = {
        id: parseInt(id),
        title: title,
        author: author,
        description: description,
        year: parseInt(year),
        image: image
      }
      localStorage.setItem('arts', JSON.stringify(arts))
      alert('Арт обновлен!')
      navigate('/')
    }
  }

  if (loading) {
    return <div style={{padding: '20px'}}>Загрузка...</div>
  }

  return (
    <div style={{padding: '20px', maxWidth: '600px'}}>
      <h2>Редактировать арт</h2>
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
          <label style={{display: 'block', marginBottom: '5px'}}>URL изображения:</label>
          <input 
            type="text" 
            value={image}
            onChange={(e) => setImage(e.target.value)}
            style={{width: '100%', padding: '8px'}}
          />
        </div>
        
        <button type="submit" style={{background: '#333', color: 'white', padding: '10px 20px', border: 'none', cursor: 'pointer'}}>
          Сохранить
        </button>
      </form>
    </div>
  )
}

export default EditArt
