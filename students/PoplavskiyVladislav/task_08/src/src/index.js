const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Mock database
let events = [
  {
    id: '1',
    title: 'Технический митап',
    date: '2024-12-15',
    time: '18:00',
    location: 'Онлайн',
    description: 'Обсуждение современных технологий',
    attendees: 45
  },
  {
    id: '2',
    title: 'Хакатон React',
    date: '2024-12-20',
    time: '10:00',
    location: 'Коворкинг Центр',
    description: 'Соревнование по разработке на React',
    attendees: 30
  }
];

// API Routes
app.get('/api/events', (req, res) => {
  res.json(events);
});

app.get('/api/events/:id', (req, res) => {
  const event = events.find(e => e.id === req.params.id);
  if (event) {
    res.json(event);
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

app.post('/api/events', (req, res) => {
  const newEvent = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  events.push(newEvent);
  res.status(201).json(newEvent);
});

app.put('/api/events/:id', (req, res) => {
  const index = events.findIndex(e => e.id === req.params.id);
  if (index !== -1) {
    events[index] = { ...events[index], ...req.body };
    res.json(events[index]);
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

app.delete('/api/events/:id', (req, res) => {
  events = events.filter(e => e.id !== req.params.id);
  res.status(204).end();
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});

module.exports = app;