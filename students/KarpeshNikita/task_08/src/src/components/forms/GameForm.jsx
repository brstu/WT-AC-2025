import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateGameMutation, useUpdateGameMutation } from '../../services/apiSlice'
import { validateGameForm } from '../../utils/validation'
import FormInput from './FormInput'
import './GameForm.css'

const GameForm = ({ game = null, isEdit = false }) => {
  const navigate = useNavigate()
  
  const [createGame, { isLoading: isCreating, error: createError }] = useCreateGameMutation()
  const [updateGame, { isLoading: isUpdating, error: updateError }] = useUpdateGameMutation()

  const isLoading = isCreating || isUpdating
  const error = createError || updateError

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    minPlayers: 1,
    maxPlayers: 4,
    playTime: 30,
    complexity: 1,
    rating: 7,
    category: '',
    image: '',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (game && isEdit) {
      setFormData(game)
    }
  }, [game, isEdit])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validation = validateGameForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setErrors({})

    try {
      if (isEdit) {
        const result = await updateGame({ id: game.id, gameData: formData }).unwrap()
        navigate(`/games/${result.id}`)
      } else {
        const result = await createGame(formData).unwrap()
        navigate(`/games/${result.id}`)
      }
    } catch (error) {
      console.error('Ошибка при сохранении:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="game-form">
      <h2>{isEdit ? 'Редактировать игру' : 'Добавить новую игру'}</h2>
      
      {error && <div className="error-message">{error.data || 'Ошибка при сохранении'}</div>}

      <FormInput
        label="Название *"
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="Введите название игры"
      />

      <FormInput
        label="Описание *"
        type="textarea"
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        placeholder="Опишите игру"
      />

      <div className="form-row">
        <FormInput
          label="Минимальное количество игроков *"
          type="number"
          name="minPlayers"
          value={formData.minPlayers}
          onChange={handleChange}
          error={errors.minPlayers}
          min="1"
        />

        <FormInput
          label="Максимальное количество игроков *"
          type="number"
          name="maxPlayers"
          value={formData.maxPlayers}
          onChange={handleChange}
          error={errors.maxPlayers}
          min={formData.minPlayers}
        />
      </div>

      <FormInput
        label="Время игры (минуты) *"
        type="number"
        name="playTime"
        value={formData.playTime}
        onChange={handleChange}
        error={errors.playTime}
        min="1"
      />

      <FormInput
        label="Сложность (1-5) *"
        type="number"
        name="complexity"
        value={formData.complexity}
        onChange={handleChange}
        error={errors.complexity}
        min="1"
        max="5"
      />

      <FormInput
        label="Рейтинг (1-10) *"
        type="number"
        name="rating"
        value={formData.rating}
        onChange={handleChange}
        error={errors.rating}
        min="1"
        max="10"
        step="0.1"
      />

      <FormInput
        label="Категория"
        type="text"
        name="category"
        value={formData.category}
        onChange={handleChange}
        error={errors.category}
        placeholder="Например: Стратегия, Карточная"
      />

      <FormInput
        label="URL изображения"
        type="url"
        name="image"
        value={formData.image}
        onChange={handleChange}
        error={errors.image}
        placeholder="https://example.com/image.jpg"
      />

      <div className="form-actions">
        <button 
          type="button" 
          onClick={() => navigate(-1)}
          className="btn-secondary"
        >
          Отмена
        </button>
        <button 
          type="submit" 
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? 'Сохранение...' : (isEdit ? 'Обновить' : 'Создать')}
        </button>
      </div>
    </form>
  )
}

export default GameForm
