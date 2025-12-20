require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

let db;
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_me_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

const validators = {
    isValidUsername: (username) => {
        return username && typeof username === 'string' && username.length >= 3 && username.length <= 50;
    },
    
    isValidPassword: (password) => {
        return password && typeof password === 'string' && password.length >= 6;
    },
    
    isValidRole: (role) => {
        return ['user', 'organizer', 'admin'].includes(role);
    },
    
    isValidEventTitle: (title) => {
        return title && typeof title === 'string' && title.length >= 3 && title.length <= 200;
    },
    
    isValidLocation: (location) => {
        return location && typeof location === 'string' && location.length >= 3 && location.length <= 200;
    },
    
    isValidParticipantsCount: (count) => {
        return Number.isInteger(count) && count > 0 && count <= 1000;
    },
    
    isValidDate: (dateString) => {
        if (!dateString || typeof dateString !== 'string') return false;
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    },
    
    isValidStatus: (status, type) => {
        if (type === 'event') {
            return ['active', 'cancelled', 'completed'].includes(status);
        }
        if (type === 'booking') {
            return ['confirmed', 'cancelled', 'pending'].includes(status);
        }
        return false;
    }
};

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
        role TEXT DEFAULT 'user' CHECK(role IN ('user', 'organizer', 'admin')),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        date DATETIME NOT NULL,
        location TEXT NOT NULL,
        maxParticipants INTEGER NOT NULL CHECK(maxParticipants > 0),
        organizerId INTEGER NOT NULL,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'cancelled', 'completed')),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organizerId) REFERENCES users(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        eventId INTEGER NOT NULL,
        bookingDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'confirmed' CHECK(status IN ('confirmed', 'cancelled', 'pending')),
        participantsCount INTEGER NOT NULL CHECK(participantsCount > 0),
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
        UNIQUE(userId, eventId)
    )`);
    
    db.run('CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizerId)');
    db.run('CREATE INDEX IF NOT EXISTS idx_events_date ON events(date)');
    db.run('CREATE INDEX IF NOT EXISTS idx_events_status ON events(status)');
    db.run('CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(userId)');
    db.run('CREATE INDEX IF NOT EXISTS idx_bookings_event ON bookings(eventId)');
}

initDB();

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            error: 'Требуется авторизация',
            message: 'Токен не предоставлен' 
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ 
            error: 'Неверный токен',
            message: 'Токен недействителен или истек срок действия' 
        });
    }
}

function requireRole(roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Доступ запрещен',
                message: 'У вас недостаточно прав для выполнения этой операции' 
            });
        }
        next();
    };
}

function validateEventData(req, res, next) {
    const { title, description, date, location, maxParticipants, status } = req.body;
    const errors = [];
    
    if (!validators.isValidEventTitle(title)) {
        errors.push('Название события обязательно и должно содержать от 3 до 200 символов');
    }
    
    if (description && description.length > 1000) {
        errors.push('Описание не должно превышать 1000 символов');
    }
    
    if (!validators.isValidDate(date)) {
        errors.push('Дата обязательна и должна быть в корректном формате');
    } else {
        const eventDate = new Date(date);
        if (eventDate < new Date()) {
            errors.push('Дата события не может быть в прошлом');
        }
    }
    
    if (!validators.isValidLocation(location)) {
        errors.push('Место проведения обязательно и должно содержать от 3 до 200 символов');
    }
    
    if (!validators.isValidParticipantsCount(maxParticipants)) {
        errors.push('Максимальное количество участников должно быть положительным целым числом (макс. 1000)');
    }
    
    if (status && !validators.isValidStatus(status, 'event')) {
        errors.push('Недопустимый статус события');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ 
            error: 'Ошибка валидации',
            messages: errors 
        });
    }
    
    next();
}

function validateBookingData(req, res, next) {
    const { participantsCount, status, notes } = req.body;
    const errors = [];
    
    if (!validators.isValidParticipantsCount(participantsCount)) {
        errors.push('Количество участников должно быть положительным целым числом (макс. 1000)');
    }
    
    if (status && !validators.isValidStatus(status, 'booking')) {
        errors.push('Недопустимый статус бронирования');
    }
    
    if (notes && notes.length > 500) {
        errors.push('Примечания не должны превышать 500 символов');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ 
            error: 'Ошибка валидации',
            messages: errors 
        });
    }
    
    next();
}

async function hashPassword(password) {
    return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

function generateToken(user) {
    return jwt.sign(
        { 
            userId: user.id, 
            username: user.username, 
            role: user.role 
        }, 
        JWT_SECRET, 
        { expiresIn: JWT_EXPIRES_IN }
    );
}

app.post('/api/auth/signup', async (req, res) => {
    const { username, password, role = 'user' } = req.body;
    const errors = [];
    
    if (!validators.isValidUsername(username)) {
        errors.push('Имя пользователя должно содержать от 3 до 50 символов');
    }
    
    if (!validators.isValidPassword(password)) {
        errors.push('Пароль должен содержать минимум 6 символов');
    }
    
    if (!validators.isValidRole(role)) {
        errors.push('Недопустимая роль пользователя');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ 
            error: 'Ошибка валидации',
            messages: errors 
        });
    }
    
    try {
        const hashedPassword = await hashPassword(password);
        
        db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(409).json({ 
                            error: 'Конфликт',
                            message: 'Пользователь с таким именем уже существует' 
                        });
                    }
                    return res.status(500).json({ 
                        error: 'Ошибка сервера',
                        message: 'Не удалось создать пользователя' 
                    });
                }
                
                const token = generateToken({ id: this.lastID, username, role });
                
                res.status(201).json({ 
                    success: true,
                    message: 'Пользователь успешно зарегистрирован',
                    token,
                    userId: this.lastID,
                    username,
                    role 
                });
            }
        );
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(500).json({ 
            error: 'Ошибка сервера',
            message: 'Внутренняя ошибка сервера' 
        });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ 
            error: 'Ошибка запроса',
            message: 'Имя пользователя и пароль обязательны' 
        });
    }
    
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            console.error('Ошибка БД при входе:', err);
            return res.status(500).json({ 
                error: 'Ошибка сервера',
                message: 'Внутренняя ошибка сервера' 
            });
        }
        
        if (!user) {
            return res.status(401).json({ 
                error: 'Ошибка аутентификации',
                message: 'Неверное имя пользователя или пароль' 
            });
        }
        
        try {
            const valid = await bcrypt.compare(password, user.password);
            
            if (!valid) {
                return res.status(401).json({ 
                    error: 'Ошибка аутентификации',
                    message: 'Неверное имя пользователя или пароль' 
                });
            }
            
            const token = generateToken(user);
            
            res.json({ 
                success: true,
                message: 'Вход выполнен успешно',
                token,
                userId: user.id,
                username: user.username,
                role: user.role 
            });
        } catch (error) {
            console.error('Ошибка при проверке пароля:', error);
            res.status(500).json({ 
                error: 'Ошибка сервера',
                message: 'Внутренняя ошибка сервера' 
            });
        }
    });
});

app.get('/api/events', (req, res) => {
    const { status, organizer, from, to, limit = 50, offset = 0 } = req.query;
    
    let query = `
        SELECT e.*, u.username as organizerName,
               (SELECT COUNT(*) FROM bookings b WHERE b.eventId = e.id AND b.status = 'confirmed') as bookedCount
        FROM events e
        LEFT JOIN users u ON e.organizerId = u.id
        WHERE 1=1
    `;
    const params = [];
    
    if (status) {
        query += ' AND e.status = ?';
        params.push(status);
    } else {
        query += ' AND e.status = "active"';
    }
    
    if (organizer) {
        query += ' AND e.organizerId = ?';
        params.push(organizer);
    }
    
    if (from) {
        query += ' AND e.date >= ?';
        params.push(from);
    }
    
    if (to) {
        query += ' AND e.date <= ?';
        params.push(to);
    }
    
    query += ' ORDER BY e.date ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Ошибка при получении событий:', err);
            return res.status(500).json({ 
                error: 'Ошибка сервера',
                message: 'Не удалось получить список событий' 
            });
        }
        
        const events = rows.map(event => ({
            ...event,
            availableSpots: event.maxParticipants - (event.bookedCount || 0)
        }));
        
        res.json({ 
            success: true,
            events,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: events.length
            }
        });
    });
});

app.get('/api/events/:id', (req, res) => {
    const { id } = req.params;
    
    const query = `
        SELECT e.*, u.username as organizerName,
               (SELECT COUNT(*) FROM bookings b WHERE b.eventId = e.id AND b.status = 'confirmed') as bookedCount
        FROM events e
        LEFT JOIN users u ON e.organizerId = u.id
        WHERE e.id = ?
    `;
    
    db.get(query, [id], (err, event) => {
        if (err) {
            console.error('Ошибка при получении события:', err);
            return res.status(500).json({ 
                error: 'Ошибка сервера',
                message: 'Не удалось получить событие' 
            });
        }
        
        if (!event) {
            return res.status(404).json({ 
                error: 'Не найдено',
                message: 'Событие с указанным ID не найдено' 
            });
        }
        
        event.availableSpots = event.maxParticipants - (event.bookedCount || 0);
        
        res.json({ 
            success: true,
            event 
        });
    });
});

app.post('/api/events', 
    authMiddleware, 
    requireRole(['organizer', 'admin']), 
    validateEventData,
    (req, res) => {
        const { title, description, date, location, maxParticipants, status = 'active' } = req.body;
        
        db.run(
            'INSERT INTO events (title, description, date, location, maxParticipants, organizerId, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, description || null, date, location, maxParticipants, req.user.userId, status],
            function(err) {
                if (err) {
                    console.error('Ошибка при создании события:', err);
                    return res.status(500).json({ 
                        error: 'Ошибка сервера',
                        message: 'Не удалось создать событие' 
                    });
                }
                
                db.get('SELECT * FROM events WHERE id = ?', [this.lastID], (err, event) => {
                    if (err || !event) {
                        return res.status(500).json({ 
                            error: 'Ошибка сервера',
                            message: 'Событие создано, но не удалось получить данные' 
                        });
                    }
                    
                    res.status(201).json({ 
                        success: true,
                        message: 'Событие успешно создано',
                        event 
                    });
                });
            }
        );
    }
);

app.put('/api/events/:id', 
    authMiddleware, 
    validateEventData,
    async (req, res) => {
        const { id } = req.params;
        
        try {
            const event = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM events WHERE id = ?', [id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            if (!event) {
                return res.status(404).json({ 
                    error: 'Не найдено',
                    message: 'Событие с указанным ID не найдено' 
                });
            }
            
            if (event.organizerId !== req.user.userId && req.user.role !== 'admin') {
                return res.status(403).json({ 
                    error: 'Доступ запрещен',
                    message: 'Вы не можете редактировать это событие' 
                });
            }
            
            const { title, description, date, location, maxParticipants, status } = req.body;
            
            if (maxParticipants !== undefined && maxParticipants < event.maxParticipants) {
                const bookedCount = await new Promise((resolve, reject) => {
                    db.get(
                        'SELECT SUM(participantsCount) as total FROM bookings WHERE eventId = ? AND status = "confirmed"',
                        [id],
                        (err, result) => {
                            if (err) reject(err);
                            else resolve(result?.total || 0);
                        }
                    );
                });
                
                if (maxParticipants < bookedCount) {
                    return res.status(400).json({ 
                        error: 'Ошибка валидации',
                        message: `Нельзя установить количество участников меньше ${bookedCount} (уже забронировано)` 
                    });
                }
            }
            
            const updateQuery = `
                UPDATE events 
                SET title = ?, description = ?, date = ?, location = ?, maxParticipants = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            
            db.run(
                updateQuery,
                [
                    title || event.title,
                    description !== undefined ? description : event.description,
                    date || event.date,
                    location || event.location,
                    maxParticipants || event.maxParticipants,
                    status || event.status,
                    id
                ],
                function(err) {
                    if (err) {
                        console.error('Ошибка при обновлении события:', err);
                        return res.status(500).json({ 
                            error: 'Ошибка сервера',
                            message: 'Не удалось обновить событие' 
                        });
                    }
                    
                    db.get('SELECT * FROM events WHERE id = ?', [id], (err, updatedEvent) => {
                        if (err || !updatedEvent) {
                            return res.status(500).json({ 
                                error: 'Ошибка сервера',
                                message: 'Событие обновлено, но не удалось получить данные' 
                            });
                        }
                        
                        res.json({ 
                            success: true,
                            message: 'Событие успешно обновлено',
                            event: updatedEvent 
                        });
                    });
                }
            );
            
        } catch (error) {
            console.error('Ошибка при обновлении события:', error);
            res.status(500).json({ 
                error: 'Ошибка сервера',
                message: 'Внутренняя ошибка сервера' 
            });
        }
    }
);

app.delete('/api/events/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM events WHERE id = ?', [id], (err, event) => {
        if (err) {
            console.error('Ошибка при получении события:', err);
            return res.status(500).json({ 
                error: 'Ошибка сервера',
                message: 'Не удалось получить событие' 
            });
        }
        
        if (!event) {
            return res.status(404).json({ 
                error: 'Не найдено',
                message: 'Событие с указанным ID не найдено' 
            });
        }
        
        if (event.organizerId !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ 
                error: 'Доступ запрещен',
                message: 'Вы не можете удалить это событие' 
            });
        }
        
        db.run('DELETE FROM events WHERE id = ?', [id], (err) => {
            if (err) {
                console.error('Ошибка при удалении события:', err);
                return res.status(500).json({ 
                    error: 'Ошибка сервера',
                    message: 'Не удалось удалить событие' 
                });
            }
            
            res.json({ 
                success: true,
                message: 'Событие успешно удалено' 
            });
        });
    });
});

app.get('/api/bookings', authMiddleware, (req, res) => {
    const { status, from, to, limit = 50, offset = 0 } = req.query;
    
    let query = `
        SELECT b.*, e.title as eventTitle, e.date as eventDate, e.location as eventLocation,
               u.username as userName
        FROM bookings b
        JOIN events e ON b.eventId = e.id
        JOIN users u ON b.userId = u.id
        WHERE b.userId = ?
    `;
    const params = [req.user.userId];
    
    if (status) {
        query += ' AND b.status = ?';
        params.push(status);
    }
    
    if (from) {
        query += ' AND b.bookingDate >= ?';
        params.push(from);
    }
    
    if (to) {
        query += ' AND b.bookingDate <= ?';
        params.push(to);
    }
    
    query += ' ORDER BY b.bookingDate DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    db.all(query, params, (err, bookings) => {
        if (err) {
            console.error('Ошибка при получении бронирований:', err);
            return res.status(500).json({ 
                error: 'Ошибка сервера',
                message: 'Не удалось получить список бронирований' 
            });
        }
        
        res.json({ 
            success: true,
            bookings,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: bookings.length
            }
        });
    });
});

app.get('/api/events/:eventId/bookings', 
    authMiddleware, 
    requireRole(['organizer', 'admin']),
    (req, res) => {
        const { eventId } = req.params;
        
        db.get('SELECT organizerId FROM events WHERE id = ?', [eventId], (err, event) => {
            if (err || !event) {
                return res.status(404).json({ 
                    error: 'Не найдено',
                    message: 'Событие не найдено' 
                });
            }
            
            if (event.organizerId !== req.user.userId && req.user.role !== 'admin') {
                return res.status(403).json({ 
                    error: 'Доступ запрещен',
                    message: 'Вы не можете просматривать бронирования этого события' 
                });
            }
            
            const query = `
                SELECT b.*, u.username as userName, u.role as userRole
                FROM bookings b
                JOIN users u ON b.userId = u.id
                WHERE b.eventId = ?
                ORDER BY b.bookingDate DESC
            `;
            
            db.all(query, [eventId], (err, bookings) => {
                if (err) {
                    console.error('Ошибка при получении бронирований события:', err);
                    return res.status(500).json({ 
                        error: 'Ошибка сервера',
                        message: 'Не удалось получить бронирования' 
                    });
                }
                
                res.json({ 
                    success: true,
                    bookings 
                });
            });
        });
    }
);

app.post('/api/events/:eventId/bookings', 
    authMiddleware, 
    validateBookingData,
    async (req, res) => {
        const { eventId } = req.params;
        const { participantsCount, notes } = req.body;
        
        try {
            const event = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM events WHERE id = ? AND status = "active"', [eventId], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            if (!event) {
                return res.status(404).json({ 
                    error: 'Не найдено',
                    message: 'Событие не найдено или не активно' 
                });
            }
            
            const existingBooking = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM bookings WHERE userId = ? AND eventId = ?', 
                    [req.user.userId, eventId], 
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });
            
            if (existingBooking) {
                return res.status(409).json({ 
                    error: 'Конфликт',
                    message: 'Вы уже забронировали это событие' 
                });
            }
            
            const bookedCount = await new Promise((resolve, reject) => {
                db.get('SELECT SUM(participantsCount) as total FROM bookings WHERE eventId = ? AND status = "confirmed"', 
                    [eventId], 
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result?.total || 0);
                    }
                );
            });
            
            const availableSpots = event.maxParticipants - bookedCount;
            
            if (participantsCount > availableSpots) {
                return res.status(400).json({ 
                    error: 'Ошибка валидации',
                    message: `Доступно только ${availableSpots} мест` 
                });
            }
            
            db.run(
                'INSERT INTO bookings (userId, eventId, participantsCount, notes) VALUES (?, ?, ?, ?)',
                [req.user.userId, eventId, participantsCount, notes || null],
                function(err) {
                    if (err) {
                        console.error('Ошибка при создании бронирования:', err);
                        return res.status(500).json({ 
                            error: 'Ошибка сервера',
                            message: 'Не удалось создать бронирование' 
                        });
                    }
                    
                    db.get('SELECT * FROM bookings WHERE id = ?', [this.lastID], (err, booking) => {
                        if (err || !booking) {
                            return res.status(500).json({ 
                                error: 'Ошибка сервера',
                                message: 'Бронирование создано, но не удалось получить данные' 
                            });
                        }
                        
                        res.status(201).json({ 
                            success: true,
                            message: 'Бронирование успешно создано',
                            booking 
                        });
                    });
                }
            );
            
        } catch (error) {
            console.error('Ошибка при создании бронирования:', error);
            res.status(500).json({ 
                error: 'Ошибка сервера',
                message: 'Внутренняя ошибка сервера' 
            });
        }
    }
);

app.put('/api/bookings/:id', 
    authMiddleware, 
    validateBookingData,
    async (req, res) => {
        const { id } = req.params;
        const { participantsCount, status, notes } = req.body;
        
        try {
            const booking = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM bookings WHERE id = ?', [id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            if (!booking) {
                return res.status(404).json({ 
                    error: 'Не найдено',
                    message: 'Бронирование не найдено' 
                });
            }
            
            if (booking.userId !== req.user.userId && req.user.role !== 'admin') {
                return res.status(403).json({ 
                    error: 'Доступ запрещен',
                    message: 'Вы не можете редактировать это бронирование' 
                });
            }
            
            if (participantsCount !== undefined && participantsCount !== booking.participantsCount) {
                const otherBookingsCount = await new Promise((resolve, reject) => {
                    db.get(
                        'SELECT SUM(participantsCount) as total FROM bookings WHERE eventId = ? AND status = "confirmed" AND id != ?',
                        [booking.eventId, id],
                        (err, result) => {
                            if (err) reject(err);
                            else resolve(result?.total || 0);
                        }
                    );
                });
                
                const event = await new Promise((resolve, reject) => {
                    db.get('SELECT maxParticipants FROM events WHERE id = ?', [booking.eventId], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });
                
                const availableSpots = event.maxParticipants - otherBookingsCount;
                
                if (participantsCount > availableSpots) {
                    return res.status(400).json({ 
                        error: 'Ошибка валидации',
                        message: `Доступно только ${availableSpots} мест` 
                    });
                }
            }
            
            const updateQuery = `
                UPDATE bookings 
                SET participantsCount = ?, status = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            
            db.run(
                updateQuery,
                [
                    participantsCount || booking.participantsCount,
                    status || booking.status,
                    notes !== undefined ? notes : booking.notes,
                    id
                ],
                function(err) {
                    if (err) {
                        console.error('Ошибка при обновлении бронирования:', err);
                        return res.status(500).json({ 
                            error: 'Ошибка сервера',
                            message: 'Не удалось обновить бронирование' 
                        });
                    }
                    
                    db.get('SELECT * FROM bookings WHERE id = ?', [id], (err, updatedBooking) => {
                        if (err || !updatedBooking) {
                            return res.status(500).json({ 
                                error: 'Ошибка сервера',
                                message: 'Бронирование обновлено, но не удалось получить данные' 
                            });
                        }
                        
                        res.json({ 
                            success: true,
                            message: 'Бронирование успешно обновлено',
                            booking: updatedBooking 
                        });
                    });
                }
            );
            
        } catch (error) {
            console.error('Ошибка при обновлении бронирования:', error);
            res.status(500).json({ 
                error: 'Ошибка сервера',
                message: 'Внутренняя ошибка сервера' 
            });
        }
    }
);

app.delete('/api/bookings/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM bookings WHERE id = ?', [id], (err, booking) => {
        if (err) {
            console.error('Ошибка при получении бронирования:', err);
            return res.status(500).json({ 
                error: 'Ошибка сервера',
                message: 'Не удалось получить бронирование' 
            });
        }
        
        if (!booking) {
            return res.status(404).json({ 
                error: 'Не найдено',
                message: 'Бронирование не найдено' 
            });
        }
        
        if (booking.userId !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ 
                error: 'Доступ запрещен',
                message: 'Вы не можете отменить это бронирование' 
            });
        }
        
        db.run('DELETE FROM bookings WHERE id = ?', [id], (err) => {
            if (err) {
                console.error('Ошибка при удалении бронирования:', err);
                return res.status(500).json({ 
                    error: 'Ошибка сервера',
                    message: 'Не удалось отменить бронирование' 
                });
            }
            
            res.json({ 
                success: true,
                message: 'Бронирование успешно отменено' 
            });
        });
    });
});

app.use((err, req, res, next) => {
    console.error('Непредвиденная ошибка:', err);
    res.status(500).json({ 
        error: 'Внутренняя ошибка сервера',
        message: 'Произошла непредвиденная ошибка' 
    });
});

app.use((req, res) => {
    res.status(404).json({ 
        error: 'Не найдено',
        message: 'Запрашиваемый ресурс не найден' 
    });
});

app.listen(PORT, () => {
    console.log(`Сервер бронирований запущен на http://localhost:${PORT}`);
});