import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { playlistSchema } from '../../utils/zodSchemas'
import { useCreatePlaylist } from './playlistsQueries'

type FormData = { name: string; description: string }

export default function PlaylistCreate() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(playlistSchema),
  })
  const createMutation = useCreatePlaylist()
  const navigate = useNavigate()

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data, {
      onSuccess: () => navigate('/playlists'),
    })
  }

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-6">Создать плейлист</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-gray-700">Название</label>
          <input
            {...register('name')}
            className="w-full p-3 border rounded mt-1"
            placeholder="Мой любимый подкаст"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-gray-700">Описание</label>
          <textarea
            {...register('description')}
            className="w-full p-3 border rounded mt-1"
            rows={4}
          />
        </div>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {createMutation.isPending ? 'Создаётся...' : 'Создать'}
        </button>
      </form>
    </div>
  )
}