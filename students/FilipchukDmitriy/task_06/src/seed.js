require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database(process.env.DB_PATH || './database.db');

async function seed() {
    console.log('Начинаем заполнение БД...');
    
    const pass1 = await bcrypt.hash('student123', 10);
    const pass2 = await bcrypt.hash('teacher123', 10);
    const pass3 = await bcrypt.hash('admin123', 10);
    
    db.run('DELETE FROM tasks');
    db.run('DELETE FROM users');
    
    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['иванов', pass1, 'student'], function(err) {
        if (err) console.log(err);
        const studentId = this.lastID;
        
        db.run('INSERT INTO tasks (title, description, status, priority, ownerId, deadline) VALUES (?, ?, ?, ?, ?, ?)',
            ['Сдать лабораторную работу №5', 'Нужно завершить работу по базам данных', 'in_progress', 'high', studentId, '2025-01-15']);
        
        db.run('INSERT INTO tasks (title, description, status, priority, ownerId, deadline) VALUES (?, ?, ?, ?, ?, ?)',
            ['Подготовиться к экзамену', 'Повторить материал по веб-технологиям', 'pending', 'medium', studentId, '2025-01-20']);
    });
    
    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['петров', pass1, 'student']);
    
    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['преподаватель', pass2, 'teacher']);
    
    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', pass3, 'admin'], function(err) {
        console.log('БД заполнена');
        db.close();
    });
}

seed();
