const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let posts = [
  { id: 1, title: 'Первая статья', content: 'Содержание первой статьи о веб-разработке', date: '2025-12-10' },
  { id: 2, title: 'Вторая статья', content: 'Содержание второй статьи про тестирование', date: '2025-12-12' }
];

let currentId = 3;

app.get('/api/posts', (req, res) => {
  res.json(posts);
});

app.get('/api/posts/:id', (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ error: 'Статья не найдена' });
  }
});

app.post('/api/posts', (req, res) => {
  const { title, content } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Название статьи обязательно' });
  }
  
  const newPost = {
    id: currentId++,
    title: title,
    content: content || '',
    date: new Date().toISOString().split('T')[0]
  };
  
  posts.push(newPost);
  res.status(201).json(newPost);
});

app.put('/api/posts/:id', (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Статья не найдена' });
  }
  
  post.title = req.body.title || post.title;
  post.content = req.body.content || post.content;
  res.json(post);
});

app.delete('/api/posts/:id', (req, res) => {
  const index = posts.findIndex(p => p.id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Статья не найдена' });
  }
  
  posts.splice(index, 1);
  res.json({ success: true });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
  });
}

module.exports = app;
