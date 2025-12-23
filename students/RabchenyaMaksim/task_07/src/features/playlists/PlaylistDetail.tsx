import { useParams, Link } from 'react-router-dom'
import { usePlaylist } from './playlistsQueries'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: playlist, isLoading, error } = usePlaylist(id!)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message="Не удалось загрузить плейлист" />
  if (!playlist) return <p>Плейлист не найден</p>

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <Link to="/playlists" className="text-indigo-600 hover:underline mb-4 inline-block">&larr; Назад</Link>
      <h1 className="text-3xl font-bold">{playlist.title || playlist.name}</h1>
      <p className="mt-4 text-gray-700">{playlist.body || playlist.description}</p>
      <p className="mt-6 text-sm text-gray-500">ID: {playlist.id}</p>
    </div>
  )
}