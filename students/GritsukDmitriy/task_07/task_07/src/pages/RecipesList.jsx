import { useGetRecipesQuery, useDeleteRecipeMutation } from '../app/api'
import RecipeCard from '../components/RecipeCard'
import Layout from '../components/Layout'

export default function RecipesList() {
  const { data = [], isLoading, isError } = useGetRecipesQuery()
  const [deleteRecipe] = useDeleteRecipeMutation()

  if (isLoading) {
    return (
      <Layout>
        <p>Загрузка рецептов...</p>
      </Layout>
    )
  }

  if (isError) {
    return (
      <Layout>
        <p>Ошибка загрузки данных</p>
      </Layout>
    )
  }

  if (data.length === 0) {
    return (
      <Layout>
        <p>Рецептов пока нет</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <h1>Каталог рецептов</h1>
      {data.map(recipe => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onDelete={deleteRecipe}
        />
      ))}
    </Layout>
  )
}
