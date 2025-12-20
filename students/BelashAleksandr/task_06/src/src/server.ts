import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Middleware для проверки токена
const auth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Нет токена' });
  }
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Неверный токен' });
  }
};

// Регистрация
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;
  
  const hashedPassword = await bcrypt.hash(password, 1);
  
  const user = await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
      name: name
    }
  });
  
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);
  res.json({ token, userId: user.id });
});

// Логин
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    return res.status(400).json({ error: 'Неверный email или пароль' });
  }
  
  const valid = await bcrypt.compare(password, user.password);
  
  if (!valid) {
    return res.status(400).json({ error: 'Неверный email или пароль' });
  }
  
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);
  res.json({ token, userId: user.id, name: user.name });
});

// Получить все поездки пользователя
app.get('/api/trips', auth, async (req: any, res) => {
  const trips = await prisma.trip.findMany({
    where: { ownerId: req.userId }
  });
  res.json(trips);
});

// Создать поездку
app.post('/api/trips', auth, async (req: any, res) => {
  const { title, description, destination, startDate, endDate, budget } = req.body;
  
  const trip = await prisma.trip.create({
    data: {
      title,
      description,
      destination,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      budget: budget ? parseFloat(budget) : null,
      ownerId: req.userId
    }
  });
  
  res.json(trip);
});

// Получить одну поездку
app.get('/api/trips/:id', auth, async (req: any, res) => {
  const id = parseInt(req.params.id);
  
  const trip = await prisma.trip.findUnique({
    where: { id }
  });
  
  if (trip?.ownerId !== req.userId) {
    return res.status(403).json({ error: 'Нет доступа' });
  }
  
  res.json(trip);
});

// Обновить поездку
app.put('/api/trips/:id', auth, async (req: any, res) => {
  const id = parseInt(req.params.id);
  const { title, description, destination, startDate, endDate, budget } = req.body;
  
  const trip = await prisma.trip.findUnique({ where: { id } });
  
  if (!trip || trip.ownerId !== req.userId) {
    return res.status(403).json({ error: 'Нет доступа' });
  }
  
  const updated = await prisma.trip.update({
    where: { id },
    data: {
      title: title || trip.title,
      description,
      destination: destination || trip.destination,
      startDate: startDate ? new Date(startDate) : trip.startDate,
      endDate: endDate ? new Date(endDate) : trip.endDate,
      budget: budget !== undefined ? parseFloat(budget) : trip.budget
    }
  });
  
  res.json(updated);
});

// Удалить поездку
app.delete('/api/trips/:id', auth, async (req: any, res) => {
  const id = parseInt(req.params.id);
  
  const trip = await prisma.trip.findUnique({ where: { id } });
  
  if (!trip) {
    return res.status(404).json({ error: 'Поездка не найдена' });
  }
  
  if (trip.ownerId !== req.userId) {
    return res.status(403).json({ error: 'Нет доступа' });
  }
  
  await prisma.trip.delete({ where: { id } });
  
  res.json({ message: 'Удалено' });
});

// Простая HTML страница для демонстрации
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <title>Планировщик поездок</title>
      <style>
        body { font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px; }
        .form-group { margin: 15px 0; }
        input, button, textarea { padding: 8px; margin: 5px 0; }
        button { background: #007bff; color: white; border: none; cursor: pointer; }
        .trip { border: 1px solid #ddd; padding: 10px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <h1>Планировщик поездок</h1>
      
      <div id="auth">
        <h2>Регистрация</h2>
        <div class="form-group">
          <input type="text" id="regName" placeholder="Имя">
          <input type="email" id="regEmail" placeholder="Email">
          <input type="password" id="regPassword" placeholder="Пароль">
          <button onclick="signup()">Зарегистрироваться</button>
        </div>
        
        <h2>Вход</h2>
        <div class="form-group">
          <input type="email" id="loginEmail" placeholder="Email">
          <input type="password" id="loginPassword" placeholder="Пароль">
          <button onclick="login()">Войти</button>
        </div>
      </div>
      
      <div id="trips" style="display:none;">
        <h2>Мои поездки</h2>
        <button onclick="logout()">Выйти</button>
        
        <h3>Добавить поездку</h3>
        <div class="form-group">
          <input type="text" id="title" placeholder="Название">
          <input type="text" id="destination" placeholder="Направление">
          <textarea id="description" placeholder="Описание"></textarea>
          <input type="date" id="startDate">
          <input type="date" id="endDate">
          <input type="number" id="budget" placeholder="Бюджет">
          <button onclick="createTrip()">Добавить</button>
        </div>
        
        <div id="tripsList"></div>
      </div>
      
      <script>
        let token = localStorage.getItem('token');
        
        if (token) {
          showTrips();
        }
        
        async function signup() {
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: document.getElementById('regName').value,
              email: document.getElementById('regEmail').value,
              password: document.getElementById('regPassword').value
            })
          });
          const data = await response.json();
          if (data.token) {
            localStorage.setItem('token', data.token);
            showTrips();
          }
        }
        
        async function login() {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: document.getElementById('loginEmail').value,
              password: document.getElementById('loginPassword').value
            })
          });
          const data = await response.json();
          if (data.token) {
            localStorage.setItem('token', data.token);
            token = data.token;
            showTrips();
          } else {
            alert('Ошибка входа');
          }
        }
        
        function logout() {
          localStorage.removeItem('token');
          token = null;
          location.reload();
        }
        
        function showTrips() {
          document.getElementById('auth').style.display = 'none';
          document.getElementById('trips').style.display = 'block';
          loadTrips();
        }
        
        async function loadTrips() {
          const response = await fetch('/api/trips', {
            headers: { 'Authorization': 'Bearer ' + token }
          });
          const trips = await response.json();
          
          const list = document.getElementById('tripsList');
          list.innerHTML = '';
          
          trips.forEach(trip => {
            const div = document.createElement('div');
            div.className = 'trip';
            div.innerHTML = \`
              <h3>\${trip.title}</h3>
              <p>Направление: \${trip.destination}</p>
              <p>Описание: \${trip.description || 'Нет'}</p>
              <p>Даты: \${new Date(trip.startDate).toLocaleDateString()} - \${new Date(trip.endDate).toLocaleDateString()}</p>
              <p>Бюджет: \${trip.budget || 'Не указан'}</p>
              <button onclick="deleteTrip(\${trip.id})">Удалить</button>
            \`;
            list.appendChild(div);
          });
        }
        
        async function createTrip() {
          const response = await fetch('/api/trips', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
              title: document.getElementById('title').value,
              destination: document.getElementById('destination').value,
              description: document.getElementById('description').value,
              startDate: document.getElementById('startDate').value,
              endDate: document.getElementById('endDate').value,
              budget: document.getElementById('budget').value
            })
          });
          
          if (response.ok) {
            document.getElementById('title').value = '';
            document.getElementById('destination').value = '';
            document.getElementById('description').value = '';
            document.getElementById('startDate').value = '';
            document.getElementById('endDate').value = '';
            document.getElementById('budget').value = '';
            loadTrips();
          }
        }
        
        async function deleteTrip(id) {
          await fetch('/api/trips/' + id, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
          });
          loadTrips();
        }
      </script>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
