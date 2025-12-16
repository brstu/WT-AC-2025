require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

var db;
var PORT = process.env.PORT || 3000;
var JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

function initDB() {
    db = new sqlite3.Database(process.env.DB_PATH || './database.db', (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Подключено к БД');
    });

    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'student'
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        ownerId INTEGER NOT NULL,
        deadline TEXT,
        FOREIGN KEY (ownerId) REFERENCES users(id)
    )`);
}

initDB();

app.post('/api/auth/signup', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const role = req.body.role || 'student';
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Не указаны данные' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
        [username, hashedPassword, role], 
        function(err) {
            if (err) {
                return res.status(400).json({ error: 'Пользователь уже существует' });
            }
            
            const token = jwt.sign({ userId: this.lastID, username: username, role: role }, JWT_SECRET);
            res.json({ token: token, userId: this.lastID });
        }
    );
});

app.post('/api/auth/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Неверные данные' });
        }
        
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Неверный пароль' });
        }
        
        const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET);
        res.json({ token: token, userId: user.id, role: user.role });
    });
});

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Неверный токен' });
    }
}

app.get('/api/tasks', authMiddleware, (req, res) => {
    let query = 'SELECT * FROM tasks WHERE ownerId = ?';
    let params = [req.user.userId];
    
    if (req.user.role === 'admin' || req.user.role === 'teacher') {
        query = 'SELECT * FROM tasks';
        params = [];
    }
    
    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.get('/api/tasks/:id', authMiddleware, (req, res) => {
    const id = req.params.id;
    
    db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, task) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (!task) {
            return res.status(404).json({ error: 'Задача не найдена' });
        }
        
        if (task.ownerId !== req.user.userId && req.user.role !== 'admin' && req.user.role !== 'teacher') {
            return res.status(403).json({ error: 'Доступ запрещен' });
        }
        
        res.json(task);
    });
});

app.post('/api/tasks', authMiddleware, (req, res) => {
    const title = req.body.title;
    const description = req.body.description || '';
    const status = req.body.status || 'pending';
    const priority = req.body.priority || 'medium';
    const deadline = req.body.deadline;
    
    if (!title) {
        return res.status(400).json({ error: 'Название обязательно' });
    }
    
    db.run('INSERT INTO tasks (title, description, status, priority, ownerId, deadline) VALUES (?, ?, ?, ?, ?, ?)',
        [title, description, status, priority, req.user.userId, deadline],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, task) => {
                res.status(201).json(task);
            });
        }
    );
});

app.put('/api/tasks/:id', authMiddleware, (req, res) => {
    const id = req.params.id;
    
    db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, task) => {
        if (err || !task) {
            return res.status(404).json({ error: 'Задача не найдена' });
        }
        
        if (task.ownerId !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Доступ запрещен' });
        }
        
        const title = req.body.title || task.title;
        const description = req.body.description || task.description;
        const status = req.body.status || task.status;
        const priority = req.body.priority || task.priority;
        const deadline = req.body.deadline || task.deadline;
        
        db.run('UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, deadline = ? WHERE id = ?',
            [title, description, status, priority, deadline, id],
            (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                
                db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, updatedTask) => {
                    res.json(updatedTask);
                });
            }
        );
    });
});

app.delete('/api/tasks/:id', authMiddleware, (req, res) => {
    const id = req.params.id;
    
    db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, task) => {
        if (err || !task) {
            return res.status(404).json({ error: 'Задача не найдена' });
        }
        
        if (task.ownerId !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Доступ запрещен' });
        }
        
        db.run('DELETE FROM tasks WHERE id = ?', [id], (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Задача удалена' });
        });
    });
});

app.get('/', (req, res) => {
    res.json({ message: 'API трекера задач работает' });
});

app.listen(PORT, () => {
    console.log('Сервер запущен на порту ' + PORT);
});
