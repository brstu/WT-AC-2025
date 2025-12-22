import { useState } from 'react'
import { usePodcasts } from './podcastsQueries'
import PodcastCard from '../../components/PodcastCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'

export default function PodcastList() {
  const [search, setSearch] = useState('')
  const { data, isLoading, error } = usePodcasts(search)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Подкасты</h1>
      <input
        type="text"
        placeholder="Поиск подкастов..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 mb-6 border rounded-lg"
      />
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage message="Ошибка загрузки подкастов" />}
      {!isLoading && !error && data?.length === 0 && <p className="text-center text-gray-500">Ничего не найдено</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data?.map((podcast: any) => (
          <PodcastCard key={podcast.trackId} podcast={podcast} />
        ))}
      </div>
    </div>
  )
}