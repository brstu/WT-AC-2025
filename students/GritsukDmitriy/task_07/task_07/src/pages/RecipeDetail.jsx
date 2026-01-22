import { useParams, Link } from 'react-router-dom'
import { useGetRecipeQuery } from '../app/api'
import Layout from '../components/Layout'

export default function RecipeDetail() {
  const { id } = useParams()
  const { data, isLoading } = useGetRecipeQuery(id)

  if (isLoading) return <Layout><p>Загрузка...</p></Layout>
  if (!data) return <Layout><p>Рецепт не найден</p></Layout>

  return (
    <Layout>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
      <Link to="/" className="btn-secondary">Назад</Link>
    </Layout>
  )
}
