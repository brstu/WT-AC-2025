import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

function ExerciseForm(props) {
  var { id } = useParams()
  var navigate = useNavigate()
  var isEdit = id !== undefined

  var [name, setName] = useState('')
  var [description, setDescription] = useState('')
  var [category, setCategory] = useState('Грудь')
  var [difficulty, setDifficulty] = useState('Начальный')
  var [errors, setErrors] = useState({})

  useEffect(() => {
    if (isEdit && props.exercises) {
      var exercise = props.exercises.find(ex => ex.id == id)
      if (exercise) {
        setName(exercise.name)
        setDescription(exercise.description)
        setCategory(exercise.category)
        setDifficulty(exercise.difficulty)
      }
    }
  }, [id, isEdit, props.exercises])

  var validate = () => {
    var newErrors = {}
    if (name.length < 3) {
      newErrors.name = 'Название должно содержать минимум 3 символа'
    }
    if (description.length < 10) {
      newErrors.description = 'Описание должно содержать минимум 10 символов'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  var handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    var colors = ['4CAF50', '2196F3', 'FF9800', '9C27B0', 'F44336']
    var randomColor = colors[Math.floor(Math.random() * colors.length)]
    var image = `https://via.placeholder.com/300x200/${randomColor}/ffffff?text=${encodeURIComponent(name)}`

    var exerciseData = {
      name: name,
      description: description,
      category: category,
      difficulty: difficulty,
      image: image
    }

    if (isEdit) {
      props.updateExercise(parseInt(id), exerciseData)
    } else {
      props.addExercise(exerciseData)
    }

    navigate('/')
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/" style={{ color: '#2196F3', textDecoration: 'none' }}>← Назад к списку</Link>
      </div>

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', maxWidth: '600px' }}>
        <h1 style={{ marginTop: 0 }}>{isEdit ? 'Редактировать упражнение' : 'Новое упражнение'}</h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Название упражнения
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              placeholder="Например: Отжимания"
            />
            {errors.name && <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>{errors.name}</div>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Описание
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', minHeight: '100px' }}
              placeholder="Опишите упражнение..."
            />
            {errors.description && <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>{errors.description}</div>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Категория
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
            >
              <option value="Грудь">Грудь</option>
              <option value="Ноги">Ноги</option>
              <option value="Пресс">Пресс</option>
              <option value="Спина">Спина</option>
              <option value="Руки">Руки</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Сложность
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
            >
              <option value="Начальный">Начальный</option>
              <option value="Средний">Средний</option>
              <option value="Продвинутый">Продвинутый</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              style={{ backgroundColor: '#4CAF50', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
            >
              {isEdit ? 'Сохранить изменения' : 'Добавить упражнение'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{ backgroundColor: '#9E9E9E', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExerciseForm
