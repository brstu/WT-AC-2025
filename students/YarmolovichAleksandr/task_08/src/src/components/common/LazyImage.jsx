import { useState } from 'react'
import './LazyImage.css'

const LazyImage = ({ src, alt, className = '' }) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <div className={`lazy-image ${className}`}>
      {!loaded && !error && (
        <div className="image-placeholder">🎲</div>
      )}
      <img 
        src={src} 
        alt={alt}
        className={`lazy-image-img ${loaded ? 'loaded' : 'loading'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}

export default LazyImage