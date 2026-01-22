import { Link } from 'react-router-dom'

interface Podcast {
  trackId: string
  trackName: string
  artistName: string
  artworkUrl100: string
}

export default function PodcastCard({ podcast }: { podcast: Podcast }) {
  return (
    <Link to={`/podcasts/${podcast.trackId}`} className="block bg-white rounded-lg shadow hover:shadow-lg transition">
      <img src={podcast.artworkUrl100} alt={podcast.trackName} className="w-full h-48 object-cover rounded-t-lg" />
      <div className="p-4">
        <h3 className="font-bold text-lg truncate">{podcast.trackName}</h3>
        <p className="text-gray-600">{podcast.artistName}</p>
      </div>
    </Link>
  )
}