import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useAddRecipeMutation,
  useUpdateRecipeMutation,
  useGetRecipeQuery
} from '../app/api'
import { useEffect } from 'react'
import Layout from '../components/Layout'

export default function RecipeForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { register, handleSubmit, setValue } = useForm()

  const [addRecipe] = useAddRecipeMutation()
  const [updateRecipe] = useUpdateRecipeMutation()
  const { data } = useGetRecipeQuery(id, { skip: !id })

  useEffect(() => {
    if (data) {
      setValue('title', data.title)
      setValue('description', data.description)
    }
  }, [data])

  const onSubmit = async (formData) => {
    if (id) {
      await updateRecipe({ id, ...formData })
    } else {
      await addRecipe(formData)
    }
    navigate('/')
  }

  return (
    <Layout>
      <h1>{id ? 'Редактирование рецепта' : 'Добавление рецепта'}</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register('title', { required: true })}
          placeholder="Название рецепта"
        />
        <textarea
          {...register('description', { required: true })}
          placeholder="Описание"
          rows={5}
        />
        <button className="btn-primary">Сохранить</button>
      </form>
    </Layout>
  )
}
