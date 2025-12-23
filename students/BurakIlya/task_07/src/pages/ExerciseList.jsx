import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

function ExerciseList(props) {
  var [filter, setFilter] = useState('')
  var [categoryFilter, setCategoryFilter] = useState('Все')

  var filteredExercises = props.exercises.filter(ex => {
    var matchesName = ex.name.toLowerCase().includes(filter.toLowerCase())
    var matchesCategory = categoryFilter == 'Все' || ex.category == categoryFilter
    return matchesName && matchesCategory
  })

  var categories = ['Все', 'Грудь', 'Ноги', 'Пресс', 'Спина', 'Руки']

  if (props.loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Загрузка...</div>
  }

  if (props.error) {
    return <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>{props.error}</div>
  }

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>Каталог фитнес-упражнений</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Поиск упражнений..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', flex: '1', minWidth: '200px' }}
        />
        
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {filteredExercises.length == 0 && (
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
          Упражнения не найдены
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filteredExercises.map(exercise => (
          <div key={exercise.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <img 
              src={exercise.image} 
              alt={exercise.name}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
            <div style={{ padding: '15px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '10px' }}>{exercise.name}</h3>
              <p style={{ color: '#666', marginBottom: '10px' }}>{exercise.description}</p>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ backgroundColor: '#e3f2fd', padding: '5px 10px', borderRadius: '4px', fontSize: '12px', marginRight: '5px' }}>
                  {exercise.category}
                </span>
                <span style={{ backgroundColor: '#fff3e0', padding: '5px 10px', borderRadius: '4px', fontSize: '12px' }}>
                  {exercise.difficulty}
                </span>
              </div>
              <Link 
                to={`/exercise/${exercise.id}`}
                style={{ display: 'inline-block', backgroundColor: '#2196F3', color: 'white', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none' }}
              >
                Подробнее
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ExerciseList
