const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3000;

var SECRET_KEY = 'my_super_secret_key_12345';
var db;
var currentUser = null;

app.use(bodyParser.json());

// инициализация БД
function initDB() {
  db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
      console.log('Ошибка БД');
    }
  });

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT,
    email TEXT,
    created_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS ads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    price REAL,
    owner_id INTEGER,
    status TEXT,
    created_at TEXT,
    category TEXT
  )`);
}

initDB();

// регистрация
app.post('/api/auth/signup', (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;

  if (!username || !password) {
    return res.status(400).json({ message: 'Нет данных' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const date = new Date().toISOString();

  db.run(
    'INSERT INTO users (username, password, email, created_at) VALUES (?, ?, ?, ?)',
    [username, hash, email, date],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Ошибка регистрации' });
      } else {
        res.json({ message: 'Пользователь зарегистрирован', id: this.lastID });
      }
    }
  );
});

// логин
app.post('/api/auth/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: 'Неверные данные' });
    }

    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
        expiresIn: '24h',
      });

      res.json({ token: token, user: { id: user.id, username: user.username } });
    } else {
      res.status(401).json({ message: 'Неверный пароль' });
    }
  });
});

// middleware авторизации
function auth(req, res, next) {
  const header = req.headers['authorization'];

  if (!header) {
    return res.status(401).json({ message: 'Нет токена' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ message: 'Невалидный токен' });
  }
}

// получить все объявления (для авторизованных)
app.get('/api/ads', auth, (req, res) => {
  db.all('SELECT * FROM ads', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// получить объявления пользователя
app.get('/api/ads/my', auth, (req, res) => {
  const userId = req.user.id;

  db.all('SELECT * FROM ads WHERE owner_id = ?', [userId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// создать объявление
app.post('/api/ads', auth, (req, res) => {
  var title = req.body.title;
  var description = req.body.description;
  var price = req.body.price;
  var category = req.body.category;
  const ownerId = req.user.id;
  const status = 'на модерации';
  const date = new Date().toISOString();

  // минимальная валидация
  if (!title) {
    return res.status(400).json({ message: 'Нет заголовка' });
  }

  db.run(
    'INSERT INTO ads (title, description, price, owner_id, status, created_at, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, description, price, ownerId, status, date, category],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: 'Объявление создано', id: this.lastID });
      }
    }
  );
});

// получить одно объявление
app.get('/api/ads/:id', auth, (req, res) => {
  const id = req.params.id;

  db.get('SELECT * FROM ads WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ message: 'Не найдено' });
    } else {
      res.json(row);
    }
  });
});

// обновить объявление
app.put('/api/ads/:id', auth, (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

  // проверка владельца
  db.get('SELECT * FROM ads WHERE id = ?', [id], (err, ad) => {
    if (err || !ad) {
      return res.status(404).json({ message: 'Не найдено' });
    }

    if (ad.owner_id != userId) {
      return res.status(403).json({ message: 'Нет доступа' });
    }

    const title = req.body.title || ad.title;
    const description = req.body.description || ad.description;
    const price = req.body.price || ad.price;
    const category = req.body.category || ad.category;

    db.run(
      'UPDATE ads SET title = ?, description = ?, price = ?, category = ? WHERE id = ?',
      [title, description, price, category, id],
      (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.json({ message: 'Обновлено' });
        }
      }
    );
  });
});

// удалить объявление
app.delete('/api/ads/:id', auth, (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

  db.get('SELECT * FROM ads WHERE id = ?', [id], (err, ad) => {
    if (err || !ad) {
      return res.status(404).json({ message: 'Не найдено' });
    }

    if (ad.owner_id != userId) {
      return res.status(403).json({ message: 'Нет доступа' });
    }

    db.run('DELETE FROM ads WHERE id = ?', [id], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: 'Удалено' });
      }
    });
  });
});

// модерация объявлений
app.patch('/api/ads/:id/moderate', auth, (req, res) => {
  const id = req.params.id;
  const status = req.body.status;

  if (!status) {
    return res.status(400).json({ message: 'Нет статуса' });
  }

  db.run('UPDATE ads SET status = ? WHERE id = ?', [status, id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Статус обновлен' });
    }
  });
});

// получить пользователей
app.get('/api/users', (req, res) => {
  db.all('SELECT id, username, email, created_at FROM users', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// seed данных
app.post('/api/seed', (req, res) => {
  const users = [
    { username: 'admin', password: bcrypt.hashSync('admin123', 10), email: 'admin@test.ru' },
    { username: 'user1', password: bcrypt.hashSync('password', 10), email: 'user1@test.ru' },
  ];

  users.forEach((user) => {
    db.run(
      'INSERT INTO users (username, password, email, created_at) VALUES (?, ?, ?, ?)',
      [user.username, user.password, user.email, new Date().toISOString()]
    );
  });

  const ads = [
    {
      title: 'Продам диван',
      description: 'Хороший диван',
      price: 5000,
      owner_id: 1,
      status: 'одобрено',
      category: 'мебель',
    },
    {
      title: 'Куплю телефон',
      description: 'Нужен iPhone',
      price: 30000,
      owner_id: 2,
      status: 'на модерации',
      category: 'электроника',
    },
  ];

  ads.forEach((ad) => {
    db.run(
      'INSERT INTO ads (title, description, price, owner_id, status, created_at, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [ad.title, ad.description, ad.price, ad.owner_id, ad.status, new Date().toISOString(), ad.category]
    );
  });

  res.json({ message: 'Данные добавлены' });
});

app.get('/', (req, res) => {
  res.send('API сервиса объявлений');
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
