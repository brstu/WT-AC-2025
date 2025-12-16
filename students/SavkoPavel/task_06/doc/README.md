# Министерство образования Республики Беларусь

<p align="center">Учреждение образования</p>
<p align="center">“Брестский Государственный технический университет”</p>
<p align="center">Кафедра ИИТ</p>

<p align="center"><strong>Лабораторная работа №6</strong></p>
<p align="center"><strong>По дисциплине:</strong> “Веб-технологии”</p>
<p align="center"><strong>Тема:</strong> “Базы данных и авторизация (SQLite + Prisma + JWT)”</p>

<p align="right"><strong>Выполнил:</strong></p>
<p align="right">Студент 4 курса</p>
<p align="right">Группы АС-63</p>
<p align="right">Савко П.С.</p>
<p align="right"><strong>Проверил:</strong></p>
<p align="right">Несюк А.Н.</p>

<p align="center"><strong>Брест 2025</strong></p>

---

## Вариант №18 — “База фильмов/сериалов с личными списками”

---

## Ход выполнения работы

### Цель работы

Настроить ORM (Prisma), реализовать регистрацию/логин с JWT, защиту маршрутов и CRUD фильмов/сериалов, доступных только владельцу.

---

### Архитектура проекта

```text
task_06/
├─ package.json
├─ .env
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
└─ src/
   ├─ server.js
   ├─ app.js
   ├─ routes/
   │  └─ movies.routes.js
   └─ middleware/
       └─ auth.middleware.js
```

---

### Настройка и запуск

```bash
npm install
npx prisma migrate dev --name init
node src/server.js
```

---

### Prisma схема

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  movies    Movie[]
}

model Movie {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  type        String   @default("MOVIE")
  status      String   @default("PLANNED")
  ownerId     Int
  owner       User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
}
```

---

### Авторизация и middleware

- `/api/auth/signup` — регистрация с хешированием пароля
- `/api/auth/login` — логин и выдача JWT
- `auth.middleware.js` — проверка JWT и защита маршрутов

---

### CRUD фильмов

- `GET /api/movies` — получить фильмы текущего пользователя
- `POST /api/movies` — добавить фильм
- `DELETE /api/movies/:id` — удалить фильм (только свой)

---

### Безопасность

- Пароли хранятся в хеше (`bcrypt`)
- JWT защищает маршруты
- Секреты и строки подключения в `.env`

---

### Используемые технологии

- Node.js, Express.js
- Prisma v5, SQLite

### Вывод

База данных подключена, CRUD реализован через Prisma + SQLite, JWT авторизация и защита маршрутов настроены. Сервер готов к тестированию и сдаче лабораторной работы.
