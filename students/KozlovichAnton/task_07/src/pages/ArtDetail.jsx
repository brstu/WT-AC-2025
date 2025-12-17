import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

function ArtDetail() {
  var { id } = useParams()
  var [art, setArt] = useState(null)
  var [loading, setLoading] = useState(true)
  var [error, setError] = useState(false)

  useEffect(() => {
    var data = localStorage.getItem('arts')
    if (data) {
      var arts = JSON.parse(data)
      var foundArt = arts.find(a => a.id == id)
      if (foundArt) {
        setArt(foundArt)
      } else {
        setError(true)
      }
    } else {
      setError(true)
    }
    setLoading(false)
  }, [id])

  if (loading) {
    return <div style={{padding: '20px'}}>Загрузка...</div>
  }

  if (error || !art) {
    return (
      <div style={{padding: '20px'}}>
        <h2>Арт не найден</h2>
        <Link to="/">Назад к списку</Link>
      </div>
    )
  }

  return (
    <div style={{padding: '20px', maxWidth: '800px'}}>
      <h2>{art.title}</h2>
      <img src={art.image} alt={art.title} style={{width: '100%', maxHeight: '500px', objectFit: 'cover'}} />
      <div style={{marginTop: '20px'}}>
        <p><strong>Автор:</strong> {art.author}</p>
        <p><strong>Год:</strong> {art.year}</p>
        <p><strong>Описание:</strong> {art.description}</p>
      </div>
      <div style={{marginTop: '20px'}}>
        <Link to="/">Назад к списку</Link>
      </div>
    </div>
  )
}

export default ArtDetail
