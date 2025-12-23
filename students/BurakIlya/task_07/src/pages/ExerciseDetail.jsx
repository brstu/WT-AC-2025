import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

function ExerciseDetail(props) {
  var { id } = useParams()
  var navigate = useNavigate()
  var [showConfirm, setShowConfirm] = useState(false)

  var exercise = props.exercises.find(ex => ex.id == id)

  useEffect(() => {
  }, [id])

  if (!exercise) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Упражнение не найдено</h2>
        <Link to="/" style={{ color: '#2196F3' }}>Вернуться к списку</Link>
      </div>
    )
  }

  var handleDelete = () => {
    props.deleteExercise(exercise.id)
    navigate('/')
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/" style={{ color: '#2196F3', textDecoration: 'none' }}>← Назад к списку</Link>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <img 
          src={exercise.image}
          alt={exercise.name}
          style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
        />
        
        <div style={{ padding: '30px' }}>
          <h1 style={{ marginTop: 0, marginBottom: '20px' }}>{exercise.name}</h1>
          
          <div style={{ marginBottom: '20px' }}>
            <span style={{ backgroundColor: '#e3f2fd', padding: '8px 15px', borderRadius: '4px', marginRight: '10px' }}>
              {exercise.category}
            </span>
            <span style={{ backgroundColor: '#fff3e0', padding: '8px 15px', borderRadius: '4px' }}>
              {exercise.difficulty}
            </span>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3>Описание</h3>
            <p style={{ lineHeight: '1.6', color: '#555' }}>{exercise.description}</p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link 
              to={`/edit/${exercise.id}`}
              style={{ display: 'inline-block', backgroundColor: '#4CAF50', color: 'white', padding: '10px 20px', borderRadius: '4px', textDecoration: 'none', border: 'none', cursor: 'pointer' }}
            >
              Редактировать
            </Link>
            
            <button
              onClick={() => setShowConfirm(true)}
              style={{ backgroundColor: '#f44336', color: 'white', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
            >
              Удалить
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '400px' }}>
            <h3 style={{ marginTop: 0 }}>Подтверждение удаления</h3>
            <p>Вы уверены, что хотите удалить упражнение "{exercise.name}"?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: 'white', cursor: 'pointer' }}
              >
                Отмена
              </button>
              <button
                onClick={handleDelete}
                style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#f44336', color: 'white', cursor: 'pointer' }}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExerciseDetail
