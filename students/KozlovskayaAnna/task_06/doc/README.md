# Лабораторная работа 06

<p align="center">Министерство образования Республики Беларусь</p>
<p align="center">Учреждение образования</p>
<p align="center">“Брестский Государственный технический университет”</p>
<p align="center">Кафедра ИИТ</p>
<br><br><br><br><br><br>
<p align="center"><strong>Лабораторная работа №6</strong></p>
<p align="center"><strong>По дисциплине:</strong> “Веб-технологии”</p>
<p align="center"><strong>Тема:</strong> “Блог‑платформа: посты, комментарии, роли.”</p>
<br><br><br><br><br><br>
<p align="right"><strong>Выполнил:</strong></p>
<p align="right">Студент 4 курса</p>
<p align="right">Группы АС-63</p>
<p align="right">Козловская А.Г.></p>
<p align="right"><strong>Проверил:</strong></p>
<p align="right">Несюк А.Н.</p>
<br><br><br><br><br>
<p align="center"><strong>Брест 2025</strong></p>

## Базы данных и авторизация (Prisma + SQLite + JWT)

## Цель

Выполнить практическую работу по подключению базы данных к серверу, реализовать авторизацию на основе JWT, защитить маршруты и перенести CRUD для задач (Task/Post) в БД.

## Тема

Базы данных и авторизация: настройка ORM (Prisma), миграции, хеширование паролей (bcrypt), JWT‑аутентификация и проверка прав доступа к ресурсам.
Файлы ключевые

- `prisma/schema.prisma` — схема БД (модели `User`, `Post`, `Comment`).
- `prisma/seed.js` — скрипт заполнения начальными данными.
- `prismaClient.js` — экземпляр Prisma Client.
- `routes/auth.js` — регистрация/логин.
- `routes/posts.js` — CRUD для постов (только владелец или `admin` может править/удалять).
- `middleware/auth.js` — проверка Bearer JWT.

Требования

- Node.js (LTS) и npm
- SQLite (используется файл `dev.db` по умолчанию через `DATABASE_URL`)

API — основные эндпоинты

- POST /api/auth/signup
  - Тело: `{ "email": "...", "password": "...", "role": "user|admin"? }`
  - Результат: `{ id, email }`

- POST /api/auth/login
  - Тело: `{ "email": "...", "password": "..." }`
  - Результат: `{ accessToken }` (JWT)

- GET /api/posts — получить все посты (публично)
- GET /api/posts/mine — получить посты текущего пользователя (Bearer token)
- POST /api/posts — создать пост (Bearer token)
- GET /api/posts/:id — получить пост по id
- PUT /api/posts/:id — обновить (Bearer token, только владелец или admin)
- DELETE /api/posts/:id — удалить (Bearer token, только владелец или admin)

Безопасность и рекомендации

- Никогда не храните `JWT_SECRET` в репозитории; используйте `.env`.
- Пароли хранятся в базе в виде хеша (bcrypt).
- Настройте CORS под ваши домены (в `app.js` используется `cors()` по-умолчанию).
- Для продакшна: использовать PostgreSQL, задать `DATABASE_URL`, включить HTTPS, и сократить время жизни access-token + реализовать refresh-token flow.

Артефакты для сдачи

- Исходники сервера (весь код в репозитории).
- `prisma/schema.prisma`, миграции (папка `prisma/migrations` если вы её создадите), `prisma/seed.js`.
- `.env.example` с перечнем необходимых переменных.
- README с инструкциями и примерами запросов (этот файл).

Критерии соответствия задания

- В схеме присутствуют `User` и сущность задач (`Post`) с полем `ownerId` — см. `prisma/schema.prisma`.
- CRUD маршруты реализованы в `routes/posts.js`, защита маршрутов — `middleware/auth.js`.
- Хеширование паролей — `bcrypt` в `routes/auth.js`.

Реализованные компоненты
------------------------

- Аутентификация: регистрация (`/api/auth/signup`), логин (`/api/auth/login`) с выдачей JWT.
- Middleware `auth` для проверки Bearer‑токена и прикрепления `req.user`.
- CRUD для `Post` (аналог `Task`) в `routes/posts.js`.
- Prisma ORM со схемой `User`, `Post`, `Comment` и seed‑скриптом.
- Тесты: базовый тест для signup/login (Jest + Supertest).

## Файлы проекта (основные)

- `index.js` — старт сервера.
- `app.js` — экспресс‑приложение и подключение маршрутов.
- `routes/auth.js` — регистрация/логин.
- `routes/posts.js` — CRUD для постов.
- `middleware/auth.js` — проверка JWT.
- `prisma/schema.prisma` — схема БД.
- `prisma/seed.js` — скрипт заполнения начальными данными.
- `prismaClient.js` — общий экземпляр Prisma Client.
- `README.md` — инструкции (этот файл).
- `postman_collection.json` — примеры запросов.

## Доступность

По умолчанию сервер слушает `http://localhost:3000`. Все эндпоинты доступны локально после запуска (`npm run dev` или `npm start`). Если вы измените `PORT` в `.env`, используйте соответствующий адрес.

## Примечание

- Значения секретов (`JWT_SECRET`) и строки подключения (`DATABASE_URL`) хранятся в `.env` и не должны попадать в репозиторий.
- Для продакшна рекомендуется использовать PostgreSQL вместо SQLite, настроить CORS, HTTPS и реализовать refresh‑токены.
- Если у вас в PowerShell возникают ошибки при запуске `npm` (ExecutionPolicy), выполните команды в CMD или разрешите выполнение сценариев согласно политике безопасности Windows.

## Ссылка на гитхаб
Ссылка <https://github.com/annkrq/WT-AC-2025/tree/main/students/KozlovskayaAnna/task_06>
