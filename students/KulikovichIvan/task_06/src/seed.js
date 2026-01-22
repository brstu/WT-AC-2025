require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database(process.env.DB_PATH || './database.db');

async function seed() {
    console.log('Начинаем заполнение БД...');

    const passUser = await bcrypt.hash('user123', 10);
    const passOrganizer = await bcrypt.hash('organizer123', 10);
    const passAdmin = await bcrypt.hash('admin123', 10);

    db.run('DELETE FROM bookings');
    db.run('DELETE FROM events');
    db.run('DELETE FROM users');

    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['петров', passUser, 'user'], function(err) {
        if (err) console.log(err);
        const petrovId = this.lastID;

        db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['сидорова', passUser, 'user'], function(err) {
            if (err) console.log(err);
            const sidorovaId = this.lastID;

            db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['организатор', passOrganizer, 'organizer'], function(err) {
                if (err) console.log(err);
                const organizerId = this.lastID;

                db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', passAdmin, 'admin'], function(err) {
                    if (err) console.log(err);
                    const adminId = this.lastID;

                    const events = [
                        ['Концерт классической музыки', 'Вечер классической музыки в филармонии', '2025-12-20T19:00:00', 'Брестская филармония', 200, organizerId, 'active'],
                        ['Выставка современного искусства', 'Работы местных художников', '2025-12-15T10:00:00', 'Художественный музей', 100, organizerId, 'active'],
                        ['Мастер-класс по кулинарии', 'Приготовление итальянской пасты', '2025-12-18T18:00:00', 'Кулинарная студия "Вкусно"', 20, adminId, 'active'],
                        ['Театральная постановка "Ревизор"', 'Классическая комедия', '2025-12-22T19:30:00', 'Драматический театр', 150, organizerId, 'active'],
                        ['Лекция по истории города', 'История Бреста от основания до наших дней', '2025-12-17T17:00:00', 'Краеведческий музей', 50, organizerId, 'active']
                    ];

                    events.forEach((event, index) => {
                        db.run('INSERT INTO events (title, description, date, location, maxParticipants, organizerId, status) VALUES (?, ?, ?, ?, ?, ?, ?)', event, function(err) {
                            if (err) console.log(err);
                            const eventId = this.lastID;

                            
                            if (index < 2) {
                                db.run('INSERT INTO bookings (userId, eventId, bookingDate, status, participantsCount) VALUES (?, ?, ?, ?, ?)',
                                    [petrovId, eventId, new Date().toISOString(), 'confirmed', 2]);
                                
                                db.run('INSERT INTO bookings (userId, eventId, bookingDate, status, participantsCount) VALUES (?, ?, ?, ?, ?)',
                                    [sidorovaId, eventId, new Date().toISOString(), 'confirmed', 1]);
                            }
                        });
                    });

                    console.log('БД успешно заполнена начальными данными');
                    db.close();
                });
            });
        });
    });
}

seed();