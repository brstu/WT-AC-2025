import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ExerciseList from './pages/ExerciseList'
import ExerciseDetail from './pages/ExerciseDetail'
import ExerciseForm from './pages/ExerciseForm'
import NotFound from './pages/NotFound'

function App() {
  var [exercises, setExercises] = useState([])
  var [loading, setLoading] = useState(false)
  var [error, setError] = useState('')
  var [notification, setNotification] = useState('')

  useEffect(() => {
    var data = [
      {
        id: 1,
        name: 'Отжимания',
        description: 'Базовое упражнение для грудных мышц',
        category: 'Грудь',
        difficulty: 'Начальный',
        image: 'https://via.placeholder.com/300x200/4CAF50/ffffff?text=Отжимания'
      },
      {
        id: 2,
        name: 'Приседания',
        description: 'Упражнение для ног',
        category: 'Ноги',
        difficulty: 'Начальный',
        image: 'https://via.placeholder.com/300x200/2196F3/ffffff?text=Приседания'
      },
      {
        id: 3,
        name: 'Планка',
        description: 'Упражнение для укрепления кора',
        category: 'Пресс',
        difficulty: 'Средний',
        image: 'https://via.placeholder.com/300x200/FF9800/ffffff?text=Планка'
      }
    ]
    setExercises(data)
  }, [])

  var addExercise = (exercise) => {
    var newId = exercises.length > 0 ? Math.max(...exercises.map(e => e.id)) + 1 : 1
    var newExercise = { ...exercise, id: newId }
    setExercises([...exercises, newExercise])
    setNotification('Упражнение добавлено!')
    setTimeout(() => setNotification(''), 3000)
  }

  var updateExercise = (id, updatedExercise) => {
    setExercises(exercises.map(ex => ex.id == id ? { ...updatedExercise, id: id } : ex))
    setNotification('Упражнение обновлено!')
    setTimeout(() => setNotification(''), 3000)
  }

  var deleteExercise = (id) => {
    setExercises(exercises.filter(ex => ex.id != id))
    setNotification('Упражнение удалено!')
    setTimeout(() => setNotification(''), 3000)
  }

  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
        <nav style={{ backgroundColor: '#333', padding: '10px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '20px' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Главная</Link>
            <Link to="/new" style={{ color: 'white', textDecoration: 'none' }}>Добавить упражнение</Link>
          </div>
        </nav>

        {notification && (
          <div style={{ backgroundColor: '#4CAF50', color: 'white', padding: '15px', textAlign: 'center' }}>
            {notification}
          </div>
        )}

        <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
          <Routes>
            <Route path="/" element={<ExerciseList exercises={exercises} loading={loading} error={error} />} />
            <Route path="/exercise/:id" element={<ExerciseDetail exercises={exercises} deleteExercise={deleteExercise} />} />
            <Route path="/new" element={<ExerciseForm addExercise={addExercise} />} />
            <Route path="/edit/:id" element={<ExerciseForm exercises={exercises} updateExercise={updateExercise} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
