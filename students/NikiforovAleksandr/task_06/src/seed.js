require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database(process.env.DB_PATH || './database.db');

async function seed() {
    console.log('Заполнение БД...');

    const passUser = await bcrypt.hash('user123', 10);
    const passAdmin = await bcrypt.hash('admin123', 10);

    db.serialize(() => {
        // Создание таблиц
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

        // Очистка таблиц
        db.run('DELETE FROM tasks');
        db.run('DELETE FROM users');

        // Добавление пользователей
        db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['user1', passUser, 'user']);
        db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', passAdmin, 'admin'], function(err) {
            if (err) console.log(err);
            const adminId = this.lastID;

            // Добавление задач
            db.run('INSERT INTO tasks (title, done, ownerId) VALUES (?, ?, ?)', ['Первая тема форума', 0, 1]);
            db.run('INSERT INTO tasks (title, done, ownerId) VALUES (?, ?, ?)', ['Админская тема', 0, adminId], function() {
                console.log('БД успешно заполнена начальными данными');
                db.close();
            });
        });
    });
}

seed();
