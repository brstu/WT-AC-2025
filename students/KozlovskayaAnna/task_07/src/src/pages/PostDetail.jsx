import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [commentName, setCommentName] = useState('')
  const [commentEmail, setCommentEmail] = useState('')

  useEffect(() => {
    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
      .then(res => res.json())
      .then(data => {
        setPost(data)
        setLoading(false)
      })

    fetch(`https://jsonplaceholder.typicode.com/posts/${id}/comments`)
      .then(res => res.json())
      .then(data => setComments(data))
  }, [id])

  const deletePost = () => {
    if (window.confirm('Удалить этот пост?')) {
      fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          alert('Пост удален')
          navigate('/')
        })
    }
  }

  const addComment = (e) => {
    e.preventDefault()
    
    fetch('https://jsonplaceholder.typicode.com/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId: id,
        name: commentName,
        email: commentEmail,
        body: commentText
      })
    })
      .then(res => res.json())
      .then(data => {
        setComments([...comments, data])
        setCommentText('')
        setCommentName('')
        setCommentEmail('')
        alert('Комментарий добавлен')
      })
  }

  if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Загрузка...</div>
  if (!post) return <div>Пост не найден</div>

  return (
    <div>
      <Link to="/" style={{display: 'inline-block', marginBottom: '20px'}}>← Назад к списку</Link>
      
      <div style={{background: 'white', padding: '30px', borderRadius: '5px', marginBottom: '30px'}}>
        <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px'}}>
          <img 
            src={`https://picsum.photos/seed/post${post.id}/100/100`} 
            style={{width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px', marginRight: '20px'}}
            alt="пост"
          />
          <div>
            <h1 style={{margin: '0 0 10px 0'}}>{post.title}</h1>
            <p style={{margin: 0, color: '#666'}}>Автор: Пользователь {post.userId}</p>
          </div>
        </div>
        
        <p style={{fontSize: '16px', lineHeight: '1.6'}}>{post.body}</p>
        
        <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
          <Link to={`/edit/${post.id}`}>
            <button style={{
              padding: '10px 20px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}>
              Редактировать
            </button>
          </Link>
          <button 
            onClick={deletePost}
            style={{
              padding: '10px 20px',
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

      <div style={{background: 'white', padding: '30px', borderRadius: '5px'}}>
        <h2>Комментарии ({comments.length})</h2>
        
        <form onSubmit={addComment} style={{marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '5px'}}>
          <h3>Добавить комментарий</h3>
          <div style={{marginBottom: '15px'}}>
            <input
              type="text"
              placeholder="Ваше имя"
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </div>
          <div style={{marginBottom: '15px'}}>
            <input
              type="email"
              placeholder="Email"
              value={commentEmail}
              onChange={(e) => setCommentEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </div>
          <div style={{marginBottom: '15px'}}>
            <textarea
              placeholder="Текст комментария"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                minHeight: '100px',
                resize: 'vertical'
              }}
            />
          </div>
          <button type="submit" style={{
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}>
            Отправить
          </button>
        </form>

        {comments.map(comment => (
          <div key={comment.id} style={{
            padding: '15px',
            marginBottom: '15px',
            background: '#f8f9fa',
            borderRadius: '5px',
            borderLeft: '3px solid #007bff'
          }}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
              <img 
                src={`https://picsum.photos/seed/comment${comment.id}/40/40`} 
                style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%', marginRight: '10px'}}
                alt="аватар"
              />
              <div>
                <strong>{comment.name}</strong>
                <div style={{fontSize: '12px', color: '#666'}}>{comment.email}</div>
              </div>
            </div>
            <p style={{margin: 0}}>{comment.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PostDetail
