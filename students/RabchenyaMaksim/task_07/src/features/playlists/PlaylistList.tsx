import { Link } from 'react-router-dom'
import { usePlaylists, useDeletePlaylist } from './playlistsQueries'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'

export default function PlaylistList() {
  const { data, isLoading, error } = usePlaylists()
  const deleteMutation = useDeletePlaylist()

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message="Ошибка загрузки плейлистов" />
  if (!data?.length) return <p className="text-center text-gray-500">Плейлистов пока нет</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Мои плейлисты</h1>
        <Link to="/playlists/new" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Создать плейлист
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map((playlist: any) => (
          <div key={playlist.id} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold">{playlist.title || playlist.name}</h2>
            <p className="text-gray-600 mt-2">{playlist.body?.substring(0, 100)}...</p>
            <div className="mt-4 flex gap-4">
              <Link to={`/playlists/${playlist.id}`} className="text-indigo-600 hover:underline">Подробнее</Link>
              <Link to={`/playlists/${playlist.id}/edit`} className="text-blue-600 hover:underline">Редактировать</Link>
              <button
                onClick={() => deleteMutation.mutate(playlist.id)}
                className="text-red-600 hover:underline"
                disabled={deleteMutation.isPending}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}