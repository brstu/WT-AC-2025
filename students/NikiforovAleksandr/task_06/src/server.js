require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const db = new sqlite3.Database(process.env.DB_PATH || './database.db', (err) => {
    if (err) console.error('Ошибка подключения к БД:', err.message);
    else console.log('Подключено к SQLite БД');
});

// Создание таблиц при запуске (если нет)
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin'))
)`);

db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER DEFAULT 0,
    ownerId INTEGER NOT NULL,
    FOREIGN KEY (ownerId) REFERENCES users(id)
)`);

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// --- Middleware для авторизации ---
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Токен не предоставлен' });
    const token = authHeader.split(' ')[1];
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Неверный или просроченный токен' });
    }
}

// --- Аутентификация ---
app.post('/api/auth/signup', async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Логин и пароль обязательны' });

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (user) return res.status(400).json({ error: 'Пользователь уже существует' });

        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role || 'user'], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            const token = jwt.sign({ userId: this.lastID, username, role: role || 'user' }, JWT_SECRET);
            res.json({ token, userId: this.lastID, role: role || 'user' });
        });
    });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Неверный логин или пароль' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Неверный логин или пароль' });

        const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET);
        res.json({ token, userId: user.id, role: user.role });
    });
});

// --- CRUD для задач ---
app.get('/api/tasks', authMiddleware, (req, res) => {
    let query = 'SELECT * FROM tasks';
    const params = [];
    if (req.user.role !== 'admin') { query += ' WHERE ownerId = ?'; params.push(req.user.userId); }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/tasks', authMiddleware, (req, res) => {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Заголовок задачи обязателен' });

    db.run('INSERT INTO tasks (title, done, ownerId) VALUES (?, ?, ?)', [title, 0, req.user.userId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, row) => res.status(201).json(row));
    });
});

app.put('/api/tasks/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    const { title, done } = req.body;

    db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, task) => {
        if (!task) return res.status(404).json({ error: 'Задача не найдена' });
        if (task.ownerId !== req.user.userId && req.user.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });

        db.run(`UPDATE tasks SET title = ?, done = ? WHERE id = ?`, [title ?? task.title, done ?? task.done, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => res.json(row));
        });
    });
});

app.delete('/api/tasks/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, task) => {
        if (!task) return res.status(404).json({ error: 'Задача не найдена' });
        if (task.ownerId !== req.user.userId && req.user.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });

        db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Задача удалена' });
        });
    });
});

// --- Тестовый маршрут ---
app.get('/', (req, res) => res.json({ message: 'API форума/задач работает!' }));

app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));
