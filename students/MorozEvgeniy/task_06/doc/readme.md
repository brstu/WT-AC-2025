# Министерство образования Республики Беларусь

<p align="center">Учреждение образования</p>
<p align="center">"Брестский Государственный технический университет"</p>
<p align="center">Кафедра ИИТ</p>
<br><br><br><br><br><br>
<p align="center"><strong>Лабораторная работа №6</strong></p>
<p align="center"><strong>По дисциплине:</strong> "Веб‑технологии"</p>
<p align="center"><strong>Тема:</strong> "Серверное REST API на Node.js + Express + Prisma (аутентификация, база данных)"</p>
<p align="center"><strong>Вариант 15: Каталог проектов (публичные/приватные карточки)</strong></p>
<br><br><br><br><br><br>
<p align="right"><strong>Выполнил:</strong></p>
<p align="right">Студент 4 курса</p>
<p align="right">Группы АС-63</p>
<p align="right">Мороз Е. В.</p>
<p align="right"><strong>Проверил:</strong></p>
<p align="right">Несюк А. Н.</p>
<br><br><br><br><br>
<p align="center"><strong>Брест 2025</strong></p>

---

## Цель работы

* Подключить базу данных SQLite через ORM Prisma.
* Реализовать регистрацию, авторизацию по JWT.
* Ограничить доступ к приватным проектам только их владельцу.
* Перенести CRUD-операции в БД.
* Обеспечить защиту API через middleware.

---

## Вариант 15: «Каталог проектов (приватные/публичные карточки)»

---

## ХОД ВЫПОЛНЕНИЯ РАБОТЫ

### 1. Структура проекта

- `schema.prisma` – схема БД Prisma
- `authController.js` – регистрация и логин
- `projectController.js` – CRUD проектов
- `auth.js` – middleware JWT
- `validators.js` – валидация входных данных
- `auth.js` (routes) – маршруты аутентификации
- `projects.js` – маршруты проектов
- `app.js` – конфигурация Express
- `server.js` – точка входа
- `.env.example` – пример конфигурации окружения
- `package.json` – зависимости проекта

---

## Установка и запуск

### 1. Установка зависимостей

```bash
npm install
```

### 2. Создание файла окружения

```bash
cp .env.example .env
```

Заполнить значения JWT_SECRET и прочие переменные.

### 3. Инициализация базы данных

```bash
npx prisma migrate dev --name init
npm run seed
```

### 4. Запуск приложения

```bash
npm run dev
```

Сервер доступен по адресу:  
http://localhost:4000

---

## 🔐 Аутентификация (JWT)

### Регистрация

`POST /api/auth/signup`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Вход

`POST /api/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Ответ:

```json
{
  "accessToken": "jwt-token-here"
}
```

Использование токена:

```
Authorization: Bearer <token>
```

---

## 📁 Эндпоинты проектов (CRUD)

### Получить список проектов

`GET /api/projects`  
Публичные доступны всем, приватные — только владельцу при наличии JWT.

### Создать проект

`POST /api/projects` (auth required)

```json
{
  "title": "My Project",
  "description": "Some text",
  "isPublic": false
}
```

### Получить проект по ID

`GET /api/projects/:id`

### Обновить проект

`PUT /api/projects/:id`  
Доступ: владелец или admin.

### Удалить проект

`DELETE /api/projects/:id`  
Доступ: владелец или admin.

---

## 🛠 Пример CRUD операций

### Создание проекта

```bash
POST /api/projects
Authorization: Bearer <token>
{
  "title": "Сервис заметок",
  "description": "PET-проект",
  "isPublic": true
}
```

### Получение приватных проектов пользователя

```bash
GET /api/projects
Authorization: Bearer <token>
```

---

## Таблица критериев

| Критерий | Баллы | Выполнено |
|---------|-------|-----------|
| Схема БД / миграции | 20 | ✅ |
| CRUD + связь с пользователем | 25 | ✅ |
| Безопасность (хеши, JWT, CORS, middleware) | 20 | ✅ |
| Архитектура, структура проекта | 15 | ✅ |
| Тесты / валидность | 10 | ✅ |
| Документация | 10 | ✅ |

### Дополнительные бонусы

| Бонус | Баллы | Выполнено |
|-------|-------|-----------|
| Refresh токены | 10 | ❌ |
| Роли/права (admin/user) | 10 | ✅ |
| Password reset | 10 | ❌ |

---

## Ссылка на публикацию

👉 Вставьте ссылку на GitHub Pages: https://eugenefr0st.github.io/WT_lab_6/

## Вывод

В ходе выполнения лабораторной работы была настроена ORM Prisma, создана схема данных c пользователями и проектами, реализованы регистрация и вход пользователей. Была создана защита маршрутов через JWT, приватные проекты стали доступны только владельцу. Также был реализован полный CRUD по работе с проектами через базу данных SQLite.
