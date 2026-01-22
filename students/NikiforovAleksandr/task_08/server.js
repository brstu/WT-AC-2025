const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Mock данные для мемов
const memes = [
  {
    id: '1',
    name: 'Doge',
    url: 'https://i.imgflip.com/4t0m5.jpg',
    likes: 1500,
    views: 10000,
    description: 'Much wow such meme',
    tags: ['doge', 'dog', 'shiba', 'funny']
  },
  {
    id: '2',
    name: 'Grumpy Cat',
    url: 'https://i.imgflip.com/1h7in3.jpg',
    likes: 1200,
    views: 8000,
    description: 'I had fun once. It was awful.',
    tags: ['cat', 'grumpy', 'funny', 'animal']
  },
  {
    id: '3',
    name: 'Distracted Boyfriend',
    url: 'https://i.imgflip.com/1ur9b0.jpg',
    likes: 2000,
    views: 15000,
    description: 'When you see something better',
    tags: ['boyfriend', 'distracted', 'funny', 'reaction']
  },
  {
    id: '4',
    name: 'Two Buttons',
    url: 'https://i.imgflip.com/1yxkcp.jpg',
    likes: 800,
    views: 5000,
    description: 'Which button would you press?',
    tags: ['buttons', 'choice', 'memes', 'decision']
  },
  {
    id: '5',
    name: 'Drake Hotline Bling',
    url: 'https://i.imgflip.com/30b1gx.jpg',
    likes: 1800,
    views: 12000,
    description: 'Hotline Bling reaction meme',
    tags: ['drake', 'music', 'reaction', 'dancing']
  }
];

// API routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Memes Gallery API'
  });
});

app.get('/api/memes', (req, res) => {
  const { search, limit } = req.query;
  let result = [...memes];

  if (search) {
    const searchTerm = search.toLowerCase();
    result = result.filter(meme => 
      meme.name.toLowerCase().includes(searchTerm) ||
      meme.description.toLowerCase().includes(searchTerm) ||
      meme.tags.some(tag => tag.includes(searchTerm))
    );
  }

  if (limit) {
    result = result.slice(0, parseInt(limit, 10));
  }

  res.json(result);
});

app.get('/api/memes/:id', (req, res) => {
  const meme = memes.find(m => m.id === req.params.id);
  if (meme) {
    res.json(meme);
  } else {
    res.status(404).json({ error: 'Meme not found' });
  }
});

app.post('/api/memes/:id/like', (req, res) => {
  const meme = memes.find(m => m.id === req.params.id);
  if (meme) {
    meme.likes += 1;
    res.json({ 
      success: true, 
      memeId: meme.id, 
      likes: meme.likes 
    });
  } else {
    res.status(404).json({ error: 'Meme not found' });
  }
});

app.post('/api/memes/:id/view', (req, res) => {
  const meme = memes.find(m => m.id === req.params.id);
  if (meme) {
    meme.views += 1;
    res.json({ 
      success: true, 
      memeId: meme.id, 
      views: meme.views 
    });
  } else {
    res.status(404).json({ error: 'Meme not found' });
  }
});

// Отдаем index.html для всех остальных маршрутов
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Memes Gallery запущен на http://localhost:${PORT}`);
  console.log(`✅ API доступен на http://localhost:${PORT}/api/memes`);
});