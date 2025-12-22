const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Данные в памяти
let workouts = [];
let id = 1;

// GET все тренировки
app.get('/workouts', (req, res) => {
  const q = req.query.q;
  const limit = req.query.limit;
  const offset = req.query.offset;
  
  let result = workouts;
  
  if (q) {
    result = result.filter(w => w.name && w.name.includes(q));
  }
  
  if (offset) {
    result = result.slice(Number(offset));
  }
  
  if (limit) {
    result = result.slice(0, Number(limit));
  }
  
  res.json(result);
});

// GET одна тренировка
app.get('/workouts/:id', (req, res) => {
  const workout = workouts.find(w => w.id == req.params.id);
  if (workout) {
    res.json(workout);
  } else {
    res.status(404).send('Не найдено');
  }
});

// POST новая тренировка
app.post('/workouts', (req, res) => {
  const data = req.body;
  
  const workout = {
    id: id++,
    name: data.name,
    type: data.type,
    duration: data.duration,
    calories: data.calories,
    date: data.date,
    completed: data.completed || false
  };
  
  workouts.push(workout);
  res.status(201).json(workout);
});

// PUT обновление тренировки
app.put('/workouts/:id', (req, res) => {
  const idx = workouts.findIndex(w => w.id == req.params.id);
  
  if (idx !== -1) {
    workouts[idx] = { ...workouts[idx], ...req.body };
    res.json(workouts[idx]);
  } else {
    res.status(404).json({ error: 'Не найдено' });
  }
});

// DELETE удаление
app.delete('/workouts/:id', (req, res) => {
  const idx = workouts.findIndex(w => w.id == req.params.id);
  
  if (idx !== -1) {
    workouts.splice(idx, 1);
    res.status(200).send('Удалено');
  } else {
    res.status(404).send('Не найдено');
  }
});

// Планы тренировок
let plans = [];
let planId = 1;

app.get('/plans', (req, res) => {
  res.json(plans);
});

app.post('/plans', (req, res) => {
  const plan = {
    id: planId++,
    title: req.body.title,
    description: req.body.description,
    workouts: req.body.workouts || []
  };
  plans.push(plan);
  res.json(plan);
});

app.get('/plans/:id', (req, res) => {
  const plan = plans.find(p => p.id == req.params.id);
  if (plan) {
    res.json(plan);
  } else {
    res.status(404).send('План не найден');
  }
});

// Прогресс
let progress = [];
let progressId = 1;

app.get('/progress', (req, res) => {
  res.send(progress);
});

app.post('/progress', (req, res) => {
  const p = {
    id: progressId++,
    workoutId: req.body.workoutId,
    date: req.body.date,
    result: req.body.result
  };
  progress.push(p);
  res.json(p);
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
