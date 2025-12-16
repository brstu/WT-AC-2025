-- Тестовые данные для БД

-- Пользователи
INSERT INTO users (username, password, email, created_at) VALUES
('admin', '$2b$10$rZJ9Zqx8YZ3x8YZ3x8YZ3uOQKZ3x8YZ3x8YZ3x8YZ3x8YZ3x8YZ3x', 'admin@test.ru', datetime('now')),
('user1', '$2b$10$rZJ9Zqx8YZ3x8YZ3x8YZ3uOQKZ3x8YZ3x8YZ3x8YZ3x8YZ3x8YZ3x', 'user1@test.ru', datetime('now'));

-- Объявления
INSERT INTO ads (title, description, price, owner_id, status, created_at, category) VALUES
('Продам диван', 'Отличный диван в хорошем состоянии', 5000, 1, 'одобрено', datetime('now'), 'мебель'),
('Куплю iPhone', 'Нужен iPhone 12 или новее', 30000, 2, 'на модерации', datetime('now'), 'электроника');
