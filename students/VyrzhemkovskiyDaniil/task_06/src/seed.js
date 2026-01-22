require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database(process.env.DB_PATH || './workout.db');

async function seed() {
    console.log('🌱 Заполнение БД начальными данными...');

    const passUser1 = await bcrypt.hash('user123', 10);
    const passUser2 = await bcrypt.hash('test123', 10);

    db.serialize(() => {
        // Создание таблиц (если не существуют)
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

        // Очистка таблиц
        db.run('DELETE FROM workouts');
        db.run('DELETE FROM users');

        // Добавление пользователей
        db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
            ['Иван Петров', 'ivan@example.com', passUser1], 
            function(err) {
                if (err) {
                    console.error('Ошибка создания пользователя 1:', err);
                    return;
                }
                const userId1 = this.lastID;

                // Добавление тренировок для первого пользователя
                const workouts1 = [
                    ['2024-01-10 08:00:00', 'Бег', 30, 300, 'Утренняя пробежка в парке'],
                    ['2024-01-11 18:00:00', 'Тренажерный зал', 60, 450, 'Силовая тренировка: грудь, спина'],
                    ['2024-01-12 09:30:00', 'Йога', 45, 200, 'Утренняя йога для расслабления'],
                    ['2024-01-13 17:00:00', 'Плавание', 40, 350, 'Бассеин 50 метров'],
                    ['2024-01-14 19:00:00', 'Велосипед', 50, 400, 'Велотренажер в зале'],
                ];

                let inserted1 = 0;
                workouts1.forEach(workout => {
                    db.run('INSERT INTO workouts (date, exerciseType, durationMinutes, caloriesBurned, notes, userId) VALUES (?, ?, ?, ?, ?, ?)',
                        [...workout, userId1],
                        function(err) {
                            if (err) console.error('Ошибка создания тренировки:', err);
                            inserted1++;
                            
                            if (inserted1 === workouts1.length) {
                                console.log(`✅ Добавлено ${workouts1.length} тренировок для пользователя 1`);
                                
                                // Второй пользователь
                                db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
                                    ['Мария Сидорова', 'maria@example.com', passUser2], 
                                    function(err) {
                                        if (err) {
                                            console.error('Ошибка создания пользователя 2:', err);
                                            return;
                                        }
                                        const userId2 = this.lastID;

                                        // Добавление тренировок для второго пользователя
                                        const workouts2 = [
                                            ['2024-01-10 07:00:00', 'Пилатес', 50, 250, 'Групповое занятие'],
                                            ['2024-01-11 19:00:00', 'Танцы', 60, 400, 'Зумба фитнес'],
                                            ['2024-01-13 08:00:00', 'Ходьба', 40, 180, 'Скандинавская ходьба'],
                                        ];

                                        let inserted2 = 0;
                                        workouts2.forEach(workout => {
                                            db.run('INSERT INTO workouts (date, exerciseType, durationMinutes, caloriesBurned, notes, userId) VALUES (?, ?, ?, ?, ?, ?)',
                                                [...workout, userId2],
                                                function(err) {
                                                    if (err) console.error('Ошибка создания тренировки:', err);
                                                    inserted2++;
                                                    
                                                    if (inserted2 === workouts2.length) {
                                                        console.log(`✅ Добавлено ${workouts2.length} тренировок для пользователя 2`);
                                                        
                                                        // Статистика
                                                        db.get('SELECT COUNT(*) as totalUsers FROM users', (err, row) => {
                                                            if (!err) console.log(`👥 Всего пользователей: ${row.totalUsers}`);
                                                        });
                                                        
                                                        db.get('SELECT COUNT(*) as totalWorkouts FROM workouts', (err, row) => {
                                                            if (!err) console.log(`💪 Всего тренировок: ${row.totalWorkouts}`);
                                                            db.close();
                                                            console.log('✅ БД успешно заполнена!');
                                                            console.log('\nТестовые данные:');
                                                            console.log('Пользователь 1: email: ivan@example.com, password: user123');
                                                            console.log('Пользователь 2: email: maria@example.com, password: test123');
                                                        });
                                                    }
                                                }
                                            );
                                        });
                                    }
                                );
                            }
                        }
                    );
                });
            }
        );
    });
}

seed().catch(console.error);