import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Home() {
  var [arts, setArts] = useState([])
  var [loading, setLoading] = useState(true)

  useEffect(() => {
    var data = localStorage.getItem('arts')
    if (data) {
      setArts(JSON.parse(data))
    }
    setLoading(false)
  }, [])

  var deleteArt = (id) => {
    var data = localStorage.getItem('arts')
    var arts = JSON.parse(data)
    var newArts = arts.filter(art => art.id !== id)
    localStorage.setItem('arts', JSON.stringify(newArts))
    setArts(newArts)
    alert('Арт удален!')
  }

  if (loading) {
    return <div style={{padding: '20px'}}>Загрузка...</div>
  }

  if (arts.length === 0) {
    return (
      <div style={{padding: '20px'}}>
        <h2>Нет артов</h2>
        <p>Добавьте первый арт!</p>
      </div>
    )
  }

  return (
    <div style={{padding: '20px'}}>
      <h2>Список артов</h2>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px'}}>
        {arts.map(art => (
          <div key={art.id} style={{border: '1px solid #ddd', padding: '10px', width: '300px'}}>
            <img src={art.image} alt={art.title} style={{width: '100%', height: '200px', objectFit: 'cover'}} />
            <h3>{art.title}</h3>
            <p>Автор: {art.author}</p>
            <p>Год: {art.year}</p>
            <div>
              <Link to={`/art/${art.id}`} style={{marginRight: '10px'}}>Подробнее</Link>
              <Link to={`/edit/${art.id}`} style={{marginRight: '10px'}}>Редактировать</Link>
              <button onClick={() => deleteArt(art.id)} style={{background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer'}}>Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home
