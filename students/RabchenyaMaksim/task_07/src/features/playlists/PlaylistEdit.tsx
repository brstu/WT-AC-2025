import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { playlistSchema } from '../../utils/zodSchemas'
import { usePlaylist, useUpdatePlaylist } from './playlistsQueries'
import LoadingSpinner from '../../components/LoadingSpinner'

type FormData = { name: string; description: string }

export default function PlaylistEdit() {
  const { id } = useParams<{ id: string }>()
  const { data: playlist, isLoading } = usePlaylist(id!)
  const updateMutation = useUpdatePlaylist()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(playlistSchema),
    defaultValues: { name: playlist?.title || '', description: playlist?.body || '' },
  })

  if (isLoading) return <LoadingSpinner />

  const onSubmit = (data: FormData) => {
    updateMutation.mutate({ id: id!, data }, {
      onSuccess: () => navigate(`/playlists/${id}`),
    })
  }

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-6">Редактировать плейлист</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-gray-700">Название</label>
          <input {...register('name')} className="w-full p-3 border rounded mt-1" />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-gray-700">Описание</label>
          <textarea {...register('description')} className="w-full p-3 border rounded mt-1" rows={4} />
        </div>
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {updateMutation.isPending ? 'Сохраняется...' : 'Сохранить'}
        </button>
      </form>
    </div>
  )
}