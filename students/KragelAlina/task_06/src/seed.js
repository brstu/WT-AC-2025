require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database(process.env.DB_PATH || './database.db');

async function seed() {
    console.log('Начинаем заполнение БД...');

    const passUser = await bcrypt.hash('user123', 10);
    const passViewer = await bcrypt.hash('viewer123', 10);
    const passAdmin = await bcrypt.hash('admin123', 10);

    // Очищаем таблицы
    db.run('DELETE FROM transactions');
    db.run('DELETE FROM users');

    // Создаём пользователей
    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['иванов', passUser, 'user'], function(err) {
        if (err) console.log(err);
        const ivanovId = this.lastID;

        // Транзакции Иванова
        const transactions = [
            ['Продукты в Магните', 2500.50, 'expense', 'groceries', '2025-12-10', ivanovId],
            ['Зарплата', 85000.00, 'income', 'salary', '2025-12-05', ivanovId],
            ['Кафе с друзьями', 1800.00, 'expense', 'entertainment', '2025-12-15', ivanovId],
            ['Коммуналка', 5200.00, 'expense', 'utilities', '2025-12-12', ivanovId],
            ['Аренда Netflix', 599.00, 'expense', 'subscription', '2025-12-01', ivanovId]
        ];

        transactions.forEach(t => {
            db.run('INSERT INTO transactions (description, amount, type, category, date, ownerId) VALUES (?, ?, ?, ?, ?, ?)', t);
        });
    });

    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['петрова', passUser, 'user']);

    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['бухгалтер', passViewer, 'viewer']);

    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', passAdmin, 'admin'], function(err) {
        console.log('БД успешно заполнена начальными данными');
        db.close();
    });
}

seed();