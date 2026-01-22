# Лабораторная работа — Вариант 27: «Сервис подкастов с приватными выпусками (Formula 1)»

## 1) Описание

В рамках лабораторной работы реализован серверный REST API **«Podcast F1 Service»** (сервис подкастов о Формуле-1) на **Node.js + Express** с использованием ORM **Sequelize** и БД **SQLite/PostgreSQL**.
Сервис удовлетворяет требованиям задания:

* ORM и схема данных: сущности **User**, **Podcast**, **Episode** с привязкой к владельцу через **ownerId**
* синхронизация схемы БД: **Sequelize `sync({ alter: true })`**
* перенос CRUD на БД: операции для подкастов и выпусков выполняются через ORM
* авторизация: **/api/auth/signup**, **/api/auth/login**, выдача **JWT**
* middleware защиты: проверка `Authorization: Bearer <token>`
* безопасность: **bcrypt** (хеш пароля), **CORS**, лимит размера тела, секреты в `.env`, **rate limit** на auth (включено)
* контроль доступа: пользователь получает/изменяет **только свои** подкасты и эпизоды (`ownerId = req.user.id`)
* приватные выпуски: поле **isPrivate** (private доступен только владельцу)

## 2) Метаданные

* ФИО: Будник Анна
* Группа: АС-64
* StudentID: 220033
* GitHub: annettebb
* Вариант: №27
* Дата: 22.12.2025

## 3) Параметры варианта

* Тема: **Сервис подкастов с приватными выпусками**
* Тематика контента: **Формула 1**
* База данных:

  * по умолчанию: **SQLite** (`DATABASE_URL=file:./dev.db`)
  * опционально: **PostgreSQL** (`DATABASE_URL=postgresql://...`)
* ORM: **Sequelize**
* Сущности и поля:

  * **User**: `id (UUID)`, `email (unique)`, `passwordHash`, `createdAt`
  * **Podcast**: `id (UUID)`, `title`, `description`, `ownerId`, `createdAt`, `updatedAt`
  * **Episode**: `id (UUID)`, `podcastId`, `title`, `summary`, `audioUrl`, `publishedAt`, `isPrivate`, `ownerId`, `createdAt`, `updatedAt`
* Связи:

  * User 1..N Podcast (через `ownerId`)
  * Podcast 1..N Episode (через `podcastId`)
  * User 1..N Episode (через `ownerId`)
* Приватность:

  * `isPrivate=true` — эпизод видит только владелец через защищённые эндпоинты
  * `isPrivate=false` — эпизод считается публичным (может отдаваться отдельным public endpoint по желанию)
* Retry/Timeout (не требуется для серверной ЛР) — не применяется
* JWT:

  * `JWT_EXPIRES_IN`: **7d**
  * `JWT_SECRET`: хранится в `.env`
* Хеширование пароля: **bcryptjs**, salt rounds: **10**
* Безопасность:

  * CORS: `CORS_ORIGIN` из `.env`
  * лимит тела JSON: `BODY_LIMIT` (пример: **64kb**)
  * rate limit на `/api/auth/*`: окно **60s**, лимит **30** запросов
  * защитные заголовки: `helmet()`

## 4) Эндпоинты API

### 4.1 Auth

* `POST /api/auth/signup` — регистрация пользователя, хеширование пароля, выдача JWT
* `POST /api/auth/login` — проверка пароля, выдача JWT

### 4.2 Podcasts (protected, Bearer token)

* `GET /api/podcasts` — список **моих** подкастов
* `POST /api/podcasts` — создать подкаст
* `GET /api/podcasts/:id` — получить подкаст (только если мой)
* `PATCH /api/podcasts/:id` — обновить подкаст (только если мой)
* `DELETE /api/podcasts/:id` — удалить подкаст (только если мой)

### 4.3 Episodes (protected, Bearer token)

* `GET /api/episodes?podcastId=...` — список **моих** эпизодов (опционально фильтр по подкасту)
* `POST /api/episodes` — создать эпизод (public/private)
* `GET /api/episodes/:id` — получить эпизод (только если мой)
* `PATCH /api/episodes/:id` — обновить эпизод (только если мой)
* `DELETE /api/episodes/:id` — удалить эпизод (только если мой)

### 4.4 Public (опционально)

* `GET /api/public/episodes` — список публичных эпизодов (`isPrivate=false`) без JWT

## 5) Ключевые моменты реализации

* **Изоляция данных по владельцу:** все запросы к Podcast/Episode выполняются с условием `ownerId = req.user.id`, что исключает доступ к чужим ресурсам.
* **Проверка владельца подкаста при создании эпизода:** перед созданием Episode проверяется, что `podcastId` принадлежит текущему пользователю.
* **Auth middleware:**

  * принимает заголовок `Authorization: Bearer <token>`
  * валидирует JWT и проверяет пользователя в БД
  * прокидывает `req.user` для дальнейших фильтраций по `ownerId`
* **Хранение паролей:** хранится только `passwordHash`, исходный пароль не сохраняется.
* **Базовая защита API:** helmet, CORS, лимиты тела запроса, rate limit на auth.

## 6) Артефакты (что сдаём)

* исходники сервера (Express + Sequelize + модели User/Podcast/Episode)
* инструкции запуска и описание эндпоинтов в README
* `.env.example` (секреты и настройки окружения)
* синхронизация схемы БД (sync alter)
* (по желанию) seed с демо-данными Formula 1

## 7) Примеры использования (cURL)

### Signup → получить токен

curl -X POST [http://localhost:3000/api/auth/signup](http://localhost:3000/api/auth/signup)
-H "Content-Type: application/json"
-d '{"email":"[test@f1.com](mailto:test@f1.com)","password":"qwerty123"}'

### Login → получить токен

curl -X POST [http://localhost:3000/api/auth/login](http://localhost:3000/api/auth/login)
-H "Content-Type: application/json"
-d '{"email":"[test@f1.com](mailto:test@f1.com)","password":"qwerty123"}'

### Использование токена

TOKEN="PASTE_TOKEN_HERE"
curl [http://localhost:3000/api/podcasts](http://localhost:3000/api/podcasts)
-H "Authorization: Bearer $TOKEN"

### Создать подкаст

curl -X POST [http://localhost:3000/api/podcasts](http://localhost:3000/api/podcasts)
-H "Authorization: Bearer $TOKEN"
-H "Content-Type: application/json"
-d '{"title":"F1 Weekend Debrief","description":"Разбор гонок и стратегии"}'

### Создать приватный эпизод

curl -X POST [http://localhost:3000/api/episodes](http://localhost:3000/api/episodes)
-H "Authorization: Bearer $TOKEN"
-H "Content-Type: application/json"
-d '{"podcastId":"<PODCAST_ID>","title":"Team Radio Leaks","summary":"Приватные заметки","isPrivate":true}'

### Публичные эпизоды без токена (опционально)

curl [http://localhost:3000/api/public/episodes](http://localhost:3000/api/public/episodes)
* seed с демо-данными Formula 1
