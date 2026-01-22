require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

let db;
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_me';

function initDB() {
    db = new sqlite3.Database(process.env.DB_PATH || './database.db', (err) => {
        if (err) {
            console.error('Ошибка подключения к БД:', err.message);
            process.exit(1);
        }
        console.log('Подключено к SQLite БД');
    });

    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK(role IN ('user', 'viewer', 'admin'))
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT,
        amount REAL NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        category TEXT,
        date TEXT NOT NULL,  -- ISO формат: YYYY-MM-DD
        ownerId INTEGER NOT NULL,
        FOREIGN KEY (ownerId) REFERENCES users(id)
    )`);
}

initDB();

// === Аутентификация ===

app.post('/api/auth/signup', async (req, res) => {
    const { username, password, role } = req.body;
    const userRole = role || 'user';

    if (!username || !password) {
        return res.status(400).json({ error: 'Логин и пароль обязательны' });
    }

    if (!['user', 'viewer', 'admin'].includes(userRole)) {
        return res.status(400).json({ error: 'Недопустимая роль' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hashedPassword, userRole],
        function(err) {
            if (err) {
                return res.status(400).json({ error: 'Пользователь уже существует' });
            }
            const token = jwt.sign({ userId: this.lastID, username, role: userRole }, JWT_SECRET);
            res.json({ token, userId: this.lastID, role: userRole });
        }
    );
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }

        const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET);
        res.json({ token, userId: user.id, role: user.role });
    });
});

// === Middleware ===

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Неверный или просроченный токен' });
    }
}

// === Маршруты транзакций ===

app.get('/api/transactions', authMiddleware, (req, res) => {
    let query = 'SELECT * FROM transactions';
    let params = [];

    if (req.user.role !== 'admin' && req.user.role !== 'viewer') {
        query += ' WHERE ownerId = ?';
        params.push(req.user.userId);
    }

    query += ' ORDER BY date DESC';

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/transactions/:id', authMiddleware, (req, res) => {
    const id = req.params.id;

    db.get('SELECT * FROM transactions WHERE id = ?', [id], (err, transaction) => {
        if (err || !transaction) {
            return res.status(404).json({ error: 'Транзакция не найдена' });
        }

        if (transaction.ownerId !== req.user.userId && req.user.role !== 'admin' && req.user.role !== 'viewer') {
            return res.status(403).json({ error: 'Доступ запрещён' });
        }

        res.json(transaction);
    });
});

app.post('/api/transactions', authMiddleware, (req, res) => {
    if (req.user.role === 'viewer') {
        return res.status(403).json({ error: 'У вас нет прав на создание транзакций' });
    }

    const { description, amount, type, category, date } = req.body;

    if (!amount || !type || !date) {
        return res.status(400).json({ error: 'Сумма, тип и дата обязательны' });
    }

    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ error: 'Тип должен быть income или expense' });
    }

    db.run('INSERT INTO transactions (description, amount, type, category, date, ownerId) VALUES (?, ?, ?, ?, ?, ?)',
        [description || null, amount, type, category || null, date, req.user.userId],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });

            db.get('SELECT * FROM transactions WHERE id = ?', [this.lastID], (err, row) => {
                res.status(201).json(row);
            });
        }
    );
});

app.put('/api/transactions/:id', authMiddleware, (req, res) => {
    if (req.user.role === 'viewer') {
        return res.status(403).json({ error: 'У вас нет прав на редактирование' });
    }

    const id = req.params.id;

    db.get('SELECT * FROM transactions WHERE id = ?', [id], (err, transaction) => {
        if (err || !transaction) {
            return res.status(404).json({ error: 'Транзакция не найдена' });
        }

        if (transaction.ownerId !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Доступ запрещён' });
        }

        const { description, amount, type, category, date } = req.body;

        db.run(`UPDATE transactions 
                SET description = ?, amount = ?, type = ?, category = ?, date = ?
                WHERE id = ?`,
            [
                description !== undefined ? description : transaction.description,
                amount !== undefined ? amount : transaction.amount,
                type !== undefined ? type : transaction.type,
                category !== undefined ? category : transaction.category,
                date || transaction.date,
                id
            ],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });

                db.get('SELECT * FROM transactions WHERE id = ?', [id], (err, row) => {
                    res.json(row);
                });
            }
        );
    });
});

app.delete('/api/transactions/:id', authMiddleware, (req, res) => {
    if (req.user.role === 'viewer') {
        return res.status(403).json({ error: 'У вас нет прав на удаление' });
    }

    const id = req.params.id;

    db.get('SELECT * FROM transactions WHERE id = ?', [id], (err, transaction) => {
        if (err || !transaction) {
            return res.status(404).json({ error: 'Транзакция не найдена' });
        }

        if (transaction.ownerId !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Доступ запрещён' });
        }

        db.run('DELETE FROM transactions WHERE id = ?', [id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Транзакция удалена' });
        });
    });
});

// Корневой маршрут
app.get('/', (req, res) => {
    res.json({ message: 'API трекера расходов работает!' });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});