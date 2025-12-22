import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CreateMeme = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    description: '',
    tags: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Очищаем ошибку при изменении
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Введите название мема'
    } else if (formData.title.length < 3) {
      newErrors.title = 'Название должно быть не менее 3 символов'
    }
    
    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'Введите URL изображения'
    } else if (!formData.imageUrl.startsWith('http')) {
      newErrors.imageUrl = 'Введите корректный URL'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Введите описание мема'
    } else if (formData.description.length < 10) {
      newErrors.description = 'Описание должно быть не менее 10 символов'
    }
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    try {
      setIsSubmitting(true)
      
      // Имитация создания мема
      console.log('Создаём мем:', formData)
      
      // Задержка для имитации запроса
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert('Мем успешно создан!')
      navigate('/memes')
      
    } catch (error) {
      console.error('Ошибка при создании мема:', error)
      alert('Ошибка при создании мема')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="form-container">
      <h1 className="form-title">Создать новый мем</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Название мема *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="form-control"
            placeholder="Введите название мема"
            disabled={isSubmitting}
          />
          {errors.title && <div className="error-message">{errors.title}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">URL изображения *</label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            className="form-control"
            placeholder="https://example.com/meme.jpg"
            disabled={isSubmitting}
          />
          {errors.imageUrl && <div className="error-message">{errors.imageUrl}</div>}
          <div style={{ fontSize: '0.875rem', color: 'var(--gray)', marginTop: '0.5rem' }}>
            Совет: используйте прямые ссылки на изображения с Imgur, Imgflip и т.д.
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Описание *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-control form-textarea"
            placeholder="Опишите ваш мем..."
            disabled={isSubmitting}
          />
          {errors.description && <div className="error-message">{errors.description}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Теги (через запятую)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="form-control"
            placeholder="программирование, юмор, кофе"
            disabled={isSubmitting}
          />
          <div style={{ fontSize: '0.875rem', color: 'var(--gray)', marginTop: '0.5rem' }}>
            Пример: программирование, юмор, кофе, работа
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <button
            type="button"
            onClick={() => navigate('/memes')}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Создание...' : 'Создать мем'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateMeme