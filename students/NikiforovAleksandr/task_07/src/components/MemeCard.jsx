import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { memeApi } from '../services/memeApi'

const MemeCard = ({ meme }) => {
  const [likes, setLikes] = useState(meme.likes)
  const [isLiked, setIsLiked] = useState(false)

  const handleLike = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isLiked) {
      try {
        await memeApi.likeMeme(meme.id)
        setLikes(likes + 1)
        setIsLiked(true)
      } catch (error) {
        console.error('Error liking meme:', error)
      }
    }
  }

  return (
    <Link to={`/memes/${meme.id}`} className="card block">
      <div className="relative">
        <img 
          src={meme.imageUrl} 
          alt={meme.title}
          className="w-full h-48 object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{meme.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {meme.description}
        </p>
        <div className="flex flex-wrap gap-1 mb-3">
          {meme.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>by {meme.author}</span>
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
          >
            <span>❤️</span>
            <span>{likes}</span>
          </button>
        </div>
      </div>
    </Link>
  )
}

export default MemeCard