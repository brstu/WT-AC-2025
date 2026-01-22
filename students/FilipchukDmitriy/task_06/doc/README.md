# Лабораторная работа №6

<p align="center">Министерство образования Республики Беларусь</p>
<p align="center">Учреждение образования</p>
<p align="center">"Брестский Государственный технический университет"</p>
<p align="center">Кафедра ИИТ</p>
<br><br><br><br><br><br>
<p align="center"><strong>Лабораторная работа №6</strong></p>
<p align="center"><strong>По дисциплине:</strong> "Веб-технологии"</p>
<p align="center"><strong>Тема:</strong> Базы данных и авторизация (SQLite + JWT)</p>
<br><br><br><br><br><br>
<p align="right"><strong>Выполнил:</strong></p>
<p align="right">Студент 4 курса</p>
<p align="right">Группы АС-63</p>
<p align="right">Филипчук Д. В.</p>
<p align="right"><strong>Проверил:</strong></p>
<p align="right">Несюк А. Н.</p>
<br><br><br><br><br>
<p align="center"><strong>Брест 2025</strong></p>

---

## Цель работы

Изучить подключение базы данных к серверному приложению, реализовать систему авторизации на основе JWT-токенов и обеспечить защиту маршрутов. Перенести CRUD-операции из предыдущей лабораторной работы в базу данных.

---

### Вариант №22 - Трекер учебных задач с ролями

## Ход выполнения работы

### 1. Структура проекта

```
src/
├── server.js         — основной файл сервера
├── seed.js           — заполнение БД тестовыми данными
├── package.json      — зависимости проекта
├── .env              — переменные окружения
├── .env.example      — пример файла конфигурации
├── .gitignore        — файлы для игнорирования
└── database.db       — база данных SQLite (создается автоматически)
```

### 2. Реализованные элементы

**Основные компоненты:**

- База данных SQLite с таблицами `users` и `tasks`
- Регистрация и аутентификация пользователей
- JWT-токены для авторизации
- Хеширование паролей с помощью bcrypt
- CRUD операции для задач
- Middleware для защиты маршрутов
- Разграничение доступа по ролям (student, teacher, admin)
- Связь задач с владельцами через ownerId

**Схема базы данных:**

Таблица `users`:

- id (INTEGER PRIMARY KEY)
- username (TEXT UNIQUE)
- password (TEXT) - хешированный
- role (TEXT) - роль пользователя

Таблица `tasks`:

- id (INTEGER PRIMARY KEY)
- title (TEXT)
- description (TEXT)
- status (TEXT)
- priority (TEXT)
- ownerId (INTEGER) - внешний ключ на users
- deadline (TEXT)

**Эндпоинты API:**

**Авторизация:**

- `POST /api/auth/signup` — регистрация нового пользователя
- `POST /api/auth/login` — вход в систему

**Задачи (требуют токен):**

- `GET /api/tasks` — получить все задачи текущего пользователя
- `GET /api/tasks/:id` — получить задачу по ID
- `POST /api/tasks` — создать новую задачу
- `PUT /api/tasks/:id` — обновить задачу
- `DELETE /api/tasks/:id` — удалить задачу

### 3. Скриншоты выполненной лабораторной работы

#### Регистрация пользователя

![Регистрация](https://via.placeholder.com/800x400/4A90E2/FFFFFF?text=Регистрация+пользователя)

#### Вход в систему

![Вход](https://via.placeholder.com/800x400/7B68EE/FFFFFF?text=Вход+в+систему)

#### Получение списка задач

![Список задач](https://via.placeholder.com/800x400/50C878/FFFFFF?text=Список+задач)

#### Создание новой задачи

![Создание задачи](https://via.placeholder.com/800x400/FF6347/FFFFFF?text=Создание+задачи)

#### Обновление задачи

![Обновление](https://via.placeholder.com/800x400/FFD700/000000?text=Обновление+задачи)

#### Попытка доступа без токена

![Ошибка доступа](https://via.placeholder.com/800x400/DC143C/FFFFFF?text=Доступ+запрещен)

---

## Инструкция по запуску

### Установка зависимостей

```bash
cd src
npm install
```

### Настройка окружения

Скопируйте `.env.example` в `.env` и при необходимости измените параметры:

```
PORT=3000
JWT_SECRET=my_super_secret_key_12345
DB_PATH=./database.db
```

### Заполнение БД тестовыми данными

```bash
npm run seed
```

Будут созданы пользователи:

- `иванов` / `student123` (роль: student)
- `петров` / `student123` (роль: student)
- `преподаватель` / `teacher123` (роль: teacher)
- `admin` / `admin123` (роль: admin)

### Запуск сервера

```bash
npm start
```

Сервер запустится на `http://localhost:3000`

### Примеры использования API

**Регистрация:**

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'
```

**Вход:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"иванов","password":"student123"}'
```

**Получение задач (с токеном):**

```bash
curl http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Создание задачи:**

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title":"Новая задача","description":"Описание","priority":"high","deadline":"2025-01-30"}'
```

---

## Таблица критериев

| Критерий                                | Выполнено |
|------------------------------------------|-----------|
| Схема БД/миграции                        | ✅ |
| CRUD + связь с пользователем             | ✅ |
| Безопасность (хеши, JWT, защита маршрутов) | ✅ |
| Качество кода/архитектуры                | ✅ |
| Тесты/валидность                         | ❌ |
| Документация/инструкция                  | ✅ |

### Дополнительные бонусы

| Бонус                                     | Выполнено |
|-------------------------------------------|-----------|
| Refresh-токены и обновление access-токена | ❌ |
| Роли/права (admin/user)                   | ✅ |
| Password reset flow                       | ❌ |

---

## Вывод

В ходе выполнения лабораторной работы была создана система трекинга учебных задач с использованием базы данных SQLite и JWT-авторизации. Реализованы основные CRUD-операции для работы с задачами, система регистрации и аутентификации пользователей с хешированием паролей. Настроена защита маршрутов через middleware и разграничение доступа по ролям. Освоены навыки работы с базами данных, ORM, и системами авторизации в Node.js приложениях.
