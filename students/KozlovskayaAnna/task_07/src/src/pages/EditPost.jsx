import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

function EditPost() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
      .then(res => res.json())
      .then(data => {
        setTitle(data.title)
        setBody(data.body)
        setLoading(false)
      })
  }, [id])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    let err = {}
    if (!title) err.title = 'Заголовок обязателен'
    if (!body) err.body = 'Текст обязателен'
    if (title.length < 5) err.title = 'Заголовок слишком короткий'
    
    if (Object.keys(err).length > 0) {
      setErrors(err)
      return
    }

    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id,
        title: title,
        body: body,
        userId: 1,
      })
    })
      .then(res => res.json())
      .then(data => {
        alert('Пост обновлен!')
        navigate(`/posts/${id}`)
      })
  }

  if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Загрузка...</div>

  return (
    <div>
      <Link to={`/posts/${id}`} style={{display: 'inline-block', marginBottom: '20px'}}>← Назад к посту</Link>
      
      <div style={{background: 'white', padding: '30px', borderRadius: '5px', maxWidth: '800px'}}>
        <h1>Редактировать пост</h1>
        
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
              Заголовок:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: errors.title ? '2px solid red' : '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
            {errors.title && <div style={{color: 'red', marginTop: '5px'}}>{errors.title}</div>}
          </div>

          <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
              Текст поста:
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: errors.body ? '2px solid red' : '1px solid #ddd',
                borderRadius: '4px',
                minHeight: '200px',
                resize: 'vertical'
              }}
            />
            {errors.body && <div style={{color: 'red', marginTop: '5px'}}>{errors.body}</div>}
          </div>

          <div style={{display: 'flex', gap: '10px'}}>
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            >
              Сохранить изменения
            </button>
            <button
              type="button"
              onClick={() => navigate(`/posts/${id}`)}
              style={{
                padding: '12px 24px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPost
