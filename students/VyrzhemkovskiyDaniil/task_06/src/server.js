require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database(process.env.DB_PATH || './workout.db', (err) => {
    if (err) console.error('Ошибка подключения к БД:', err.message);
    else console.log('✅ Подключено к SQLite БД');
});

// Создание таблиц при запуске (если нет)
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATETIME NOT NULL,
    exerciseType TEXT NOT NULL,
    durationMinutes INTEGER NOT NULL,
    caloriesBurned INTEGER NOT NULL,
    notes TEXT,
    userId INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
)`);

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'default_workout_secret';

// --- Middleware для авторизации ---
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Токен не предоставлен' });
    }
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
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Все поля обязательны: username, email, password' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (user) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
            [username, email, hashedPassword], 
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                
                const token = jwt.sign(
                    { userId: this.lastID, username, email }, 
                    JWT_SECRET, 
                    { expiresIn: '1h' }
                );
                
                res.status(201).json({ 
                    message: 'Пользователь создан успешно',
                    token, 
                    user: { 
                        id: this.lastID, 
                        username, 
                        email 
                    } 
                });
            }
        );
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email и пароль обязательны' });
    }
    
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username, email: user.email }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );
        
        res.json({ 
            message: 'Вход выполнен успешно',
            token, 
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email 
            } 
        });
    });
});

// --- Профиль пользователя ---
app.get('/api/users/me', authMiddleware, (req, res) => {
    db.get('SELECT id, username, email, createdAt FROM users WHERE id = ?', [req.user.userId], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.json(user);
    });
});

// --- CRUD для тренировок ---
app.get('/api/workouts', authMiddleware, (req, res) => {
    db.all('SELECT * FROM workouts WHERE userId = ? ORDER BY date DESC', [req.user.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/workouts/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM workouts WHERE id = ?', [id], (err, workout) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!workout) return res.status(404).json({ error: 'Тренировка не найдена' });
        if (workout.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Доступ запрещён' });
        }
        
        res.json(workout);
    });
});

app.post('/api/workouts', authMiddleware, (req, res) => {
    const { date, exerciseType, durationMinutes, caloriesBurned, notes } = req.body;
    
    if (!date || !exerciseType || !durationMinutes || !caloriesBurned) {
        return res.status(400).json({ 
            error: 'Обязательные поля: date, exerciseType, durationMinutes, caloriesBurned' 
        });
    }
    
    db.run(
        `INSERT INTO workouts (date, exerciseType, durationMinutes, caloriesBurned, notes, userId) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [date, exerciseType, parseInt(durationMinutes), parseInt(caloriesBurned), notes || '', req.user.userId],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            db.get('SELECT * FROM workouts WHERE id = ?', [this.lastID], (err, row) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({
                    message: 'Тренировка создана успешно',
                    workout: row
                });
            });
        }
    );
});

app.put('/api/workouts/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    const { date, exerciseType, durationMinutes, caloriesBurned, notes } = req.body;
    
    db.get('SELECT * FROM workouts WHERE id = ?', [id], (err, workout) => {
        if (!workout) return res.status(404).json({ error: 'Тренировка не найдена' });
        if (workout.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Доступ запрещён' });
        }
        
        const updateData = {
            date: date || workout.date,
            exerciseType: exerciseType || workout.exerciseType,
            durationMinutes: durationMinutes ? parseInt(durationMinutes) : workout.durationMinutes,
            caloriesBurned: caloriesBurned ? parseInt(caloriesBurned) : workout.caloriesBurned,
            notes: notes !== undefined ? notes : workout.notes
        };
        
        db.run(
            `UPDATE workouts SET date = ?, exerciseType = ?, durationMinutes = ?, caloriesBurned = ?, notes = ? 
             WHERE id = ?`,
            [updateData.date, updateData.exerciseType, updateData.durationMinutes, 
             updateData.caloriesBurned, updateData.notes, id],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                
                db.get('SELECT * FROM workouts WHERE id = ?', [id], (err, row) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({
                        message: 'Тренировка обновлена успешно',
                        workout: row
                    });
                });
            }
        );
    });
});

app.delete('/api/workouts/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM workouts WHERE id = ?', [id], (err, workout) => {
        if (!workout) return res.status(404).json({ error: 'Тренировка не найдена' });
        if (workout.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Доступ запрещён' });
        }
        
        db.run('DELETE FROM workouts WHERE id = ?', [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Тренировка удалена успешно' });
        });
    });
});

// --- Статистика тренировок ---
app.get('/api/workouts/stats/summary', authMiddleware, (req, res) => {
    const query = `
        SELECT 
            COUNT(*) as totalWorkouts,
            SUM(durationMinutes) as totalMinutes,
            SUM(caloriesBurned) as totalCalories,
            AVG(durationMinutes) as avgDuration,
            AVG(caloriesBurned) as avgCalories
        FROM workouts 
        WHERE userId = ?
    `;
    
    db.get(query, [req.user.userId], (err, stats) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(stats);
    });
});

app.get('/api/workouts/stats/by-type', authMiddleware, (req, res) => {
    const query = `
        SELECT 
            exerciseType,
            COUNT(*) as count,
            SUM(durationMinutes) as totalMinutes,
            SUM(caloriesBurned) as totalCalories
        FROM workouts 
        WHERE userId = ?
        GROUP BY exerciseType
        ORDER BY count DESC
    `;
    
    db.all(query, [req.user.userId], (err, stats) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(stats);
    });
});

// --- Health check ---
app.get('/api/health', (req, res) => {
    db.get('SELECT 1 as status', (err) => {
        if (err) {
            return res.status(500).json({ status: 'ERROR', database: 'disconnected' });
        }
        res.json({ 
            status: 'OK', 
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    });
});

// --- Тестовый маршрут ---
app.get('/', (req, res) => {
    res.json({ 
        message: 'Workout Tracker API работает!',
        version: '1.0.0',
        endpoints: {
            auth: ['POST /api/auth/signup', 'POST /api/auth/login'],
            profile: ['GET /api/users/me'],
            workouts: ['GET /api/workouts', 'POST /api/workouts', 'GET /api/workouts/:id', 
                      'PUT /api/workouts/:id', 'DELETE /api/workouts/:id'],
            stats: ['GET /api/workouts/stats/summary', 'GET /api/workouts/stats/by-type']
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});