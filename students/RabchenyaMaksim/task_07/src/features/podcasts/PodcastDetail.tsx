import { useParams, Link } from 'react-router-dom'
import { usePodcastDetail } from './podcastsQueries'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'

export default function PodcastDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: podcast, isLoading, error } = usePodcastDetail(id!)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message="Не удалось загрузить подкаст" />
  if (!podcast) return <p>Подкаст не найден</p>

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
      <Link to="/" className="text-indigo-600 hover:underline mb-4 inline-block">&larr; Назад</Link>
      <div className="flex flex-col md:flex-row gap-8">
        <img src={podcast.artworkUrl600} alt={podcast.trackName} className="w-64 h-64 rounded-lg object-cover" />
        <div>
          <h1 className="text-3xl font-bold">{podcast.trackName}</h1>
          <p className="text-xl text-gray-600 mt-2">{podcast.artistName}</p>
          <p className="mt-4">{podcast.longDescription || podcast.description}</p>
          <p className="mt-4 text-sm text-gray-500">Жанр: {podcast.primaryGenreName}</p>
        </div>
      </div>
    </div>
  )
}