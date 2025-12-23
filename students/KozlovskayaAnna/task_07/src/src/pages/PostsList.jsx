import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function PostsList() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data)
        setLoading(false)
      })
      .catch(err => {
        setError('Ошибка загрузки')
        setLoading(false)
      })
  }, [])

  const deletePost = (id) => {
    if (window.confirm('Удалить пост?')) {
      fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          setPosts(posts.filter(p => p.id !== id))
          alert('Пост удален')
        })
    }
  }

  if (loading) return <div style={{textAlign: 'center', padding: '50px', fontSize: '20px'}}>Загрузка...</div>
  if (error) return <div style={{textAlign: 'center', padding: '50px', color: 'red'}}>{error}</div>

  return (
    <div>
      <h2 style={{marginBottom: '20px'}}>Все посты</h2>
      {posts.length === 0 && <p>Постов нет</p>}
      <div>
        {posts.map(post => (
          <div key={post.id} style={{
            background: 'white', 
            padding: '20px', 
            marginBottom: '15px', 
            borderRadius: '5px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
              <img 
                src={`https://picsum.photos/seed/post${post.id}/60/60`} 
                style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%', marginRight: '15px'}}
                alt="пост"
              />
              <div style={{flex: 1}}>
                <h3 style={{margin: '0 0 5px 0'}}>
                  <Link to={`/posts/${post.id}`}>{post.title}</Link>
                </h3>
                <p style={{margin: 0, color: '#666', fontSize: '14px'}}>
                  {post.body.substring(0, 100)}...
                </p>
              </div>
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
              <Link to={`/posts/${post.id}`}>
                <button style={{
                  padding: '8px 16px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px'
                }}>
                  Читать
                </button>
              </Link>
              <Link to={`/edit/${post.id}`}>
                <button style={{
                  padding: '8px 16px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px'
                }}>
                  Редактировать
                </button>
              </Link>
              <button 
                onClick={() => deletePost(post.id)}
                style={{
                  padding: '8px 16px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px'
                }}
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

export default PostsList
