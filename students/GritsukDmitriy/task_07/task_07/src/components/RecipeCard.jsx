import { Link } from 'react-router-dom'

export default function RecipeCard({ recipe, onDelete }) {
  return (
    <div className="card">
      <h3>{recipe.title}</h3>
      <p>{recipe.description.slice(0, 100)}...</p>

      <div className="card-actions">
        <Link to={`/recipes/${recipe.id}`} className="btn-secondary">
          Подробнее
        </Link>
        <Link to={`/edit/${recipe.id}`} className="btn-primary" style={{ marginLeft: 10 }}>
          Редактировать
        </Link>
        <button
          className="btn-danger"
          onClick={() => onDelete(recipe.id)}
        >
          Удалить
        </button>
      </div>
    </div>
  )
}
