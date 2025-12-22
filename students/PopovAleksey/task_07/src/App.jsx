import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

let artworks = [
  {
    id: 1,
    title: 'Закат над морем',
    author: 'Иванов И.И.',
    year: 2020,
    description: 'Прекрасный морской пейзаж',
    image: 'https://picsum.photos/seed/art1/400/300',
    category: 'Пейзаж'
  },
  {
    id: 2,
    title: 'Портрет девушки',
    author: 'Петрова А.А.',
    year: 2019,
    description: 'Реалистичный портрет',
    image: 'https://picsum.photos/seed/art2/400/300',
    category: 'Портрет'
  },
  {
    id: 3,
    title: 'Абстракция №5',
    author: 'Сидоров П.П.',
    year: 2021,
    description: 'Современное искусство',
    image: 'https://picsum.photos/seed/art3/400/300',
    category: 'Абстракция'
  },
  {
    id: 4,
    title: 'Натюрморт с фруктами',
    author: 'Кузнецова М.М.',
    year: 2022,
    description: 'Классический натюрморт',
    image: 'https://picsum.photos/seed/art4/400/300',
    category: 'Натюрморт'
  },
  {
    id: 5,
    title: 'Городская улица',
    author: 'Смирнов В.В.',
    year: 2023,
    description: 'Урбанистический пейзаж',
    image: 'https://picsum.photos/seed/art5/400/300',
    category: 'Пейзаж'
  }
]

let nextId = 6

function getArtworks() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const copy = [...artworks]
      resolve(copy)
    }, 500)
  })
}

function getArtworkById(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const artwork = artworks.find(a => a.id === parseInt(id))
      if (artwork) {
        resolve({ ...artwork })
      } else {
        reject(new Error('Not found'))
      }
    }, 300)
  })
}

function createArtwork(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newArtwork = {
        ...data,
        id: nextId++,
        image: `https://picsum.photos/seed/art${nextId}/400/300`
      }
      artworks.push(newArtwork)
      resolve(newArtwork)
    }, 500)
  })
}

function updateArtwork(id, data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = artworks.findIndex(a => a.id === parseInt(id))
      if (index !== -1) {
        artworks[index] = { ...artworks[index], ...data }
        resolve(artworks[index])
      }
    }, 500)
  })
}

function deleteArtwork(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      artworks = artworks.filter(a => a.id !== parseInt(id))
      resolve()
    }, 300)
  })
}

function ArtworkList() {
  const [works, setWorks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadArtworks()
  }, [])

  const loadArtworks = async () => {
    setLoading(true)
    try {
      const data = await getArtworks()
      setWorks(data)
      setError(null)
    } catch (err) {
      setError('Ошибка загрузки')
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Удалить работу?')) {
      await deleteArtwork(id)
      loadArtworks()
    }
  }

  const containerStyle = {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  }

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px'
  }

  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  }

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }

  const deleteButtonStyle = {
    padding: '5px 10px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px'
  }

  if (loading) return <div style={containerStyle}><h2>Загрузка...</h2></div>
  if (error) return <div style={containerStyle}><h2>{error}</h2></div>

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1>Каталог художественных работ</h1>
        <button style={buttonStyle} onClick={() => navigate('/create')}>
          Добавить работу
        </button>
      </div>
      
      {works.length === 0 && <p>Нет работ в каталоге</p>}
      
      <div style={gridStyle}>
        {works.map(work => (
          <div key={work.id} style={cardStyle}>
            <img 
              src={work.image} 
              alt={work.title}
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }}
              onClick={() => navigate(`/artwork/${work.id}`)}
            />
            <h3 onClick={() => navigate(`/artwork/${work.id}`)}>{work.title}</h3>
            <p><strong>Автор:</strong> {work.author}</p>
            <p><strong>Год:</strong> {work.year}</p>
            <p><strong>Категория:</strong> {work.category}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button 
                style={{ ...buttonStyle, backgroundColor: '#2196F3', flex: 1 }}
                onClick={() => navigate(`/edit/${work.id}`)}
              >
                Редактировать
              </button>
              <button 
                style={deleteButtonStyle}
                onClick={() => handleDelete(work.id)}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ArtworkDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [artwork, setArtwork] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadArtwork()
  }, [id])

  const loadArtwork = async () => {
    setLoading(true)
    try {
      const data = await getArtworkById(id)
      setArtwork(data)
      setError(null)
    } catch (err) {
      setError('Работа не найдена')
    }
    setLoading(false)
  }

  const containerStyle = {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto'
  }

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px'
  }

  if (loading) return <div style={containerStyle}><h2>Загрузка...</h2></div>
  if (error) return <div style={containerStyle}><h2>{error}</h2></div>
  if (!artwork) return null

  return (
    <div style={containerStyle}>
      <button style={buttonStyle} onClick={() => navigate('/')}>Назад</button>
      <button 
        style={{ ...buttonStyle, backgroundColor: '#2196F3' }}
        onClick={() => navigate(`/edit/${id}`)}
      >
        Редактировать
      </button>
      
      <div style={{ marginTop: '20px' }}>
        <img 
          src={artwork.image} 
          alt={artwork.title}
          style={{ width: '100%', maxHeight: '500px', objectFit: 'contain' }}
        />
        <h1>{artwork.title}</h1>
        <p style={{ fontSize: '18px' }}><strong>Автор:</strong> {artwork.author}</p>
        <p style={{ fontSize: '18px' }}><strong>Год создания:</strong> {artwork.year}</p>
        <p style={{ fontSize: '18px' }}><strong>Категория:</strong> {artwork.category}</p>
        <p style={{ fontSize: '16px', marginTop: '20px' }}>{artwork.description}</p>
      </div>
    </div>
  )
}

function ArtworkForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(!!id)
  const { register, handleSubmit, setValue, formState: { errors } } = useForm()

  useEffect(() => {
    if (id) {
      loadArtwork()
    }
  }, [id])

  const loadArtwork = async () => {
    try {
      const data = await getArtworkById(id)
      setValue('title', data.title)
      setValue('author', data.author)
      setValue('year', data.year)
      setValue('description', data.description)
      setValue('category', data.category)
    } catch (err) {
      alert('Ошибка загрузки')
    }
    setInitialLoading(false)
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (id) {
        await updateArtwork(id, data)
        alert('Работа обновлена!')
      } else {
        await createArtwork(data)
        alert('Работа создана!')
      }
      navigate('/')
    } catch (err) {
      alert('Ошибка сохранения')
    }
    setLoading(false)
  }

  const containerStyle = {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto'
  }

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  }

  const inputStyle = {
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  }

  const buttonStyle = {
    padding: '12px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px'
  }

  const errorStyle = {
    color: 'red',
    fontSize: '14px',
    marginTop: '-10px'
  }

  if (initialLoading) return <div style={containerStyle}><h2>Загрузка...</h2></div>

  return (
    <div style={containerStyle}>
      <h1>{id ? 'Редактировать работу' : 'Добавить новую работу'}</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} style={formStyle}>
        <div>
          <input 
            {...register('title', { required: 'Название обязательно' })}
            placeholder="Название работы"
            style={inputStyle}
          />
          {errors.title && <p style={errorStyle}>{errors.title.message}</p>}
        </div>

        <div>
          <input 
            {...register('author', { required: 'Автор обязателен' })}
            placeholder="Автор"
            style={inputStyle}
          />
          {errors.author && <p style={errorStyle}>{errors.author.message}</p>}
        </div>

        <div>
          <input 
            {...register('year', { 
              required: 'Год обязателен',
              min: { value: 1800, message: 'Минимум 1800' },
              max: { value: 2025, message: 'Максимум 2025' }
            })}
            type="number"
            placeholder="Год создания"
            style={inputStyle}
          />
          {errors.year && <p style={errorStyle}>{errors.year.message}</p>}
        </div>

        <div>
          <select 
            {...register('category', { required: 'Выберите категорию' })}
            style={inputStyle}
          >
            <option value="">Выберите категорию</option>
            <option value="Пейзаж">Пейзаж</option>
            <option value="Портрет">Портрет</option>
            <option value="Натюрморт">Натюрморт</option>
            <option value="Абстракция">Абстракция</option>
            <option value="Другое">Другое</option>
          </select>
          {errors.category && <p style={errorStyle}>{errors.category.message}</p>}
        </div>

        <div>
          <textarea 
            {...register('description')}
            placeholder="Описание работы"
            rows="4"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="submit" 
            style={buttonStyle}
            disabled={loading}
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button 
            type="button"
            onClick={() => navigate('/')}
            style={{ ...buttonStyle, backgroundColor: '#666' }}
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  )
}

function NotFound() {
  const navigate = useNavigate()
  
  const containerStyle = {
    padding: '20px',
    textAlign: 'center',
    marginTop: '50px'
  }

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '20px'
  }

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '72px', margin: '0' }}>404</h1>
      <h2>Страница не найдена</h2>
      <p>К сожалению, запрашиваемая страница не существует</p>
      <button style={buttonStyle} onClick={() => navigate('/')}>
        Вернуться на главную
      </button>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ArtworkList />} />
        <Route path="/artwork/:id" element={<ArtworkDetail />} />
        <Route path="/create" element={<ArtworkForm />} />
        <Route path="/edit/:id" element={<ArtworkForm />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
