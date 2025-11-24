# Лекция 20. Бэкенд на Node.js: Express, Fastify, NestJS

**Цель лекции:** Изучить современные подходы к созданию серверных приложений на Node.js, освоить популярные фреймворки (Express, Fastify, NestJS) и научиться строить производительные и масштабируемые REST API.

## Содержание

1. **Почему Node.js для бэкенда:** Event Loop, неблокирующий I/O, экосистема npm.
2. **Express:** Минимализм, middleware-конвейер, роутинг, обработка ошибок.
3. **Fastify:** Производительность, схемы JSON Schema, встроенная валидация, плагины.
4. **NestJS:** Модульная архитектура, Dependency Injection, декораторы, TypeScript-first подход.
5. **Best Practices:** Валидация (Zod/Joi/class-validator), логирование (Pino/Winston), конфигурация (.env), структура проекта.
6. **Практическое задание:** Создать полноценное CRUD API с аутентификацией, валидацией и тестами.

## Материалы для чтения

- [Express.js Documentation](https://expressjs.com/ru/) — официальная документация
- [Fastify Documentation](https://fastify.dev/) — быстрый веб-фреймворк
- [NestJS Documentation](https://docs.nestjs.com/) — прогрессивный фреймворк для масштабируемых приложений
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) — коллекция лучших практик
- [MDN: HTTP](https://developer.mozilla.org/ru/docs/Web/HTTP) — основы HTTP-протокола

---

## 1) Почему Node.js для бэкенда

Node.js — это JavaScript-движок за пределами браузера. Он построен на движке V8 от Google Chrome и позволяет выполнять JavaScript на сервере.

### Event Loop — асинхронная модель выполнения

В отличие от традиционных серверов (PHP, Java с потоками на каждое соединение), Node.js использует **однопоточный Event Loop** с неблокирующим I/O.

**Как это работает:**

```javascript
// Традиционный блокирующий подход (псевдокод)
const data1 = readFileSync('file1.txt');  // ждём 100мс
const data2 = readFileSync('file2.txt');  // ждём 100мс
console.log('Общее время: 200мс');

// Node.js неблокирующий подход
readFile('file1.txt', (err, data1) => {
  console.log('Файл 1 прочитан');
});
readFile('file2.txt', (err, data2) => {
  console.log('Файл 2 прочитан');
});
console.log('Общее время: ~100мс (параллельно)');
```

**Преимущества Event Loop:**

- **Высокая производительность для I/O-операций:** Один процесс Node.js может обслуживать тысячи одновременных соединений.
- **Нет overhead на создание потоков:** В традиционных серверах каждое соединение = новый поток (дорого по памяти).
- **Простота:** Один поток → нет проблем с синхронизацией, гонками данных.

**Недостатки:**

- **CPU-интенсивные задачи:** Если код выполняет тяжёлые вычисления (например, обработка видео), он блокирует Event Loop, и сервер перестаёт отвечать на другие запросы.
- **Решение:** Выносить тяжёлые задачи в Worker Threads или отдельные микросервисы.

### Экосистема npm — миллионы пакетов

npm (Node Package Manager) — крупнейший реестр открытого ПО в мире (более 2 миллионов пакетов).

**Популярные пакеты для бэкенда:**

- **Express, Fastify, Koa** — веб-фреймворки.
- **Prisma, TypeORM, Sequelize** — ORM для баз данных.
- **Passport, jsonwebtoken** — аутентификация.
- **Joi, Zod** — валидация данных.
- **Winston, Pino** — логирование.

### Где Node.js применяется

- **REST API и GraphQL серверы:** Высокая пропускная способность для JSON-данных.
- **Real-time приложения:** WebSockets (чаты, нотификации, колаборативные редакторы).
- **Микросервисы:** Быстрый старт, малый footprint.
- **SSR (Server-Side Rendering):** Next.js, Nuxt.js для React/Vue.

**Когда НЕ использовать Node.js:**

- CPU-интенсивные задачи (машинное обучение, видео-кодирование) — лучше Python/Go/Rust.
- Легаси-системы с требованием Java/C#.

---

## 2) Express — минималистичный веб-фреймворк

Express — самый популярный фреймворк для Node.js. Его философия: "Ничего лишнего, максимум гибкости".

### Минимальный пример

```javascript
// server.js
import express from 'express';

const app = express();

// Middleware для парсинга JSON из тела запроса
app.use(express.json());

// Простейший маршрут
app.get('/', (req, res) => {
  res.json({ message: 'Hello, Express!' });
});

// Запуск сервера
app.listen(3000, () => {
  console.log('✅ Сервер запущен: http://localhost:3000');
});
```

**Запуск:**

```powershell
npm init -y
npm install express
node server.js
```

Откройте браузер: `http://localhost:3000` → увидите `{"message":"Hello, Express!"}`.

### Middleware — конвейер обработки запросов

Middleware — это функции, которые выполняются **последовательно** для каждого запроса.

```javascript
// Логирование каждого запроса
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();  // передаём управление следующему middleware
});

// Проверка аутентификации
app.use((req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Проверка токена...
  next();
});

// Маршрут (выполняется после всех middleware)
app.get('/protected', (req, res) => {
  res.json({ data: 'Секретные данные' });
});
```

**Порядок важен:** Middleware выполняются в порядке объявления. Если забыть вызвать `next()`, запрос "зависнет".

### Роутинг — организация маршрутов

```javascript
// GET /users — получить всех пользователей
app.get('/users', (req, res) => {
  res.json([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]);
});

// GET /users/:id — получить пользователя по ID
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.json({ id: userId, name: 'Alice' });
});

// POST /users — создать пользователя
app.post('/users', (req, res) => {
  const newUser = req.body;  // { name: 'Charlie' }
  // Сохранение в БД...
  res.status(201).json({ id: 3, ...newUser });
});

// PUT /users/:id — обновить пользователя
app.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  const updates = req.body;
  res.json({ id: userId, ...updates });
});

// DELETE /users/:id — удалить пользователя
app.delete('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.status(204).send();  // 204 No Content
});
```

### Организация маршрутов через Router

Для больших приложений создавайте отдельные файлы с маршрутами.

**routes/users.js:**

```javascript
import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json([{ id: 1, name: 'Alice' }]);
});

router.post('/', (req, res) => {
  res.status(201).json({ id: 2, name: req.body.name });
});

export default router;
```

**server.js:**

```javascript
import express from 'express';
import usersRouter from './routes/users.js';

const app = express();
app.use(express.json());

// Подключаем роутер с префиксом /users
app.use('/users', usersRouter);

app.listen(3000);
```

Теперь `GET /users` обрабатывается роутером из `routes/users.js`.

### Обработка ошибок

Express поддерживает специальный middleware для ошибок (4 параметра вместо 3).

```javascript
// Обычный маршрут
app.get('/error', (req, res) => {
  throw new Error('Что-то пошло не так!');
});

// Middleware для обработки ошибок (должен быть ПОСЛЕДНИМ)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});
```

**Best Practice:** Создайте класс `AppError` для своих ошибок:

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// В маршруте
app.get('/user/:id', (req, res, next) => {
  const user = findUserById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  res.json(user);
});

// Обработчик ошибок
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

### Пример CRUD API для задач

```javascript
import express from 'express';

const app = express();
app.use(express.json());

let tasks = [
  { id: 1, title: 'Изучить Express', completed: false },
  { id: 2, title: 'Создать API', completed: false }
];

// GET /tasks — получить все задачи
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// GET /tasks/:id — получить задачу по ID
app.get('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// POST /tasks — создать задачу
app.post('/tasks', (req, res) => {
  const newTask = {
    id: tasks.length + 1,
    title: req.body.title,
    completed: false
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT /tasks/:id — обновить задачу
app.put('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  
  task.title = req.body.title ?? task.title;
  task.completed = req.body.completed ?? task.completed;
  res.json(task);
});

// DELETE /tasks/:id — удалить задачу
app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  
  tasks.splice(index, 1);
  res.status(204).send();
});

app.listen(3000, () => console.log('✅ http://localhost:3000'));
```

**Тестирование через curl:**

```powershell
# Получить все задачи
curl http://localhost:3000/tasks

# Создать задачу
curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Новая задача"}'

# Обновить задачу
curl -X PUT http://localhost:3000/tasks/1 -H "Content-Type: application/json" -d '{"completed":true}'

# Удалить задачу
curl -X DELETE http://localhost:3000/tasks/2
```

---

## 3) Fastify — производительный фреймворк

Fastify — современная альтернатива Express с фокусом на **производительность** (в 2-3 раза быстрее Express) и **developer experience**.

### Почему Fastify

- **Скорость:** Оптимизирован для высоких нагрузок, использует быструю маршрутизацию (`find-my-way`).
- **JSON Schema валидация:** Встроенная валидация запросов/ответов через JSON Schema (компилируется в быстрый код).
- **TypeScript-friendly:** Отличная поддержка типов из коробки.
- **Плагины:** Архитектура на основе плагинов для изоляции кода.

### Базовый Fastify сервер

```javascript
// server.js
import Fastify from 'fastify';

const fastify = Fastify({
  logger: true  // Встроенное логирование
});

fastify.get('/', async (request, reply) => {
  return { message: 'Hello, Fastify!' };
});

// Запуск сервера
try {
  await fastify.listen({ port: 3000 });
  console.log('✅ Сервер запущен: http://localhost:3000');
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
```

**Запуск:**

```powershell
npm install fastify
node server.js
```

### JSON Schema валидация

Fastify автоматически валидирует входящие данные и генерирует документацию.

```javascript
fastify.post('/users', {
  schema: {
    body: {
      type: 'object',
      required: ['name', 'email'],
      properties: {
        name: { type: 'string', minLength: 3 },
        email: { type: 'string', format: 'email' },
        age: { type: 'integer', minimum: 18 }
      }
    },
    response: {
      201: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          email: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  const newUser = {
    id: Date.now(),
    ...request.body
  };
  // Сохранение в БД...
  reply.code(201).send(newUser);
});
```

**Что происходит:**

1. Fastify валидирует `request.body` по схеме `body`.
2. Если данные невалидны (например, `name` короче 3 символов), возвращается `400 Bad Request` с деталями ошибки.
3. Схема `response` документирует формат ответа (используется для OpenAPI).

**Тестирование:**

```powershell
# Невалидный запрос (name слишком короткий)
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name":"AB","email":"test@example.com"}'
# Ответ: {"statusCode":400,"error":"Bad Request","message":"body/name must NOT have fewer than 3 characters"}

# Валидный запрос
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name":"Alice","email":"alice@example.com","age":25}'
# Ответ: {"id":1699999999999,"name":"Alice","email":"alice@example.com"}
```

### Пример CRUD API на Fastify

```javascript
import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

let tasks = [
  { id: 1, title: 'Изучить Fastify', completed: false },
  { id: 2, title: 'Создать API', completed: false }
];

// GET /tasks — получить все задачи
fastify.get('/tasks', async (request, reply) => {
  return tasks;
});

// GET /tasks/:id — получить задачу по ID
fastify.get('/tasks/:id', {
  schema: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'integer' }
      }
    }
  }
}, async (request, reply) => {
  const task = tasks.find(t => t.id === parseInt(request.params.id));
  if (!task) {
    return reply.code(404).send({ error: 'Task not found' });
  }
  return task;
});

// POST /tasks — создать задачу
fastify.post('/tasks', {
  schema: {
    body: {
      type: 'object',
      required: ['title'],
      properties: {
        title: { type: 'string', minLength: 1 }
      }
    }
  }
}, async (request, reply) => {
  const newTask = {
    id: tasks.length + 1,
    title: request.body.title,
    completed: false
  };
  tasks.push(newTask);
  return reply.code(201).send(newTask);
});

// PUT /tasks/:id — обновить задачу
fastify.put('/tasks/:id', {
  schema: {
    params: {
      type: 'object',
      properties: { id: { type: 'integer' } }
    },
    body: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        completed: { type: 'boolean' }
      }
    }
  }
}, async (request, reply) => {
  const task = tasks.find(t => t.id === parseInt(request.params.id));
  if (!task) {
    return reply.code(404).send({ error: 'Task not found' });
  }

  if (request.body.title !== undefined) task.title = request.body.title;
  if (request.body.completed !== undefined) task.completed = request.body.completed;

  return task;
});

// DELETE /tasks/:id — удалить задачу
fastify.delete('/tasks/:id', async (request, reply) => {
  const index = tasks.findIndex(t => t.id === parseInt(request.params.id));
  if (index === -1) {
    return reply.code(404).send({ error: 'Task not found' });
  }

  tasks.splice(index, 1);
  return reply.code(204).send();
});

// Запуск сервера
await fastify.listen({ port: 3000 });
```

### Плагины — модульная архитектура

Fastify использует плагины для изоляции функциональности.

```javascript
// plugins/database.js
import fp from 'fastify-plugin';

async function databasePlugin(fastify, options) {
  // Имитация подключения к БД
  const db = {
    users: [{ id: 1, name: 'Alice' }]
  };

  // Декорируем инстанс Fastify
  fastify.decorate('db', db);
}

export default fp(databasePlugin);
```

**server.js:**

```javascript
import Fastify from 'fastify';
import databasePlugin from './plugins/database.js';

const fastify = Fastify();

// Регистрируем плагин
await fastify.register(databasePlugin);

// Теперь доступен fastify.db
fastify.get('/users', async (request, reply) => {
  return fastify.db.users;
});

await fastify.listen({ port: 3000 });
```

### Hooks — жизненный цикл запроса

Fastify предоставляет хуки для вмешательства на разных этапах обработки запроса.

```javascript
// onRequest — выполняется до парсинга тела запроса
fastify.addHook('onRequest', async (request, reply) => {
  console.log(`➡️ Входящий запрос: ${request.method} ${request.url}`);
});

// preHandler — выполняется после парсинга, до обработчика маршрута
fastify.addHook('preHandler', async (request, reply) => {
  const token = request.headers.authorization;
  if (!token) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});

// onResponse — выполняется после отправки ответа
fastify.addHook('onResponse', async (request, reply) => {
  console.log(`✅ Ответ отправлен: ${reply.statusCode}`);
});
```

---

## 4) NestJS — прогрессивный фреймворк с архитектурой

NestJS — это фреймворк для создания масштабируемых серверных приложений на TypeScript. Вдохновлён Angular, использует декораторы, Dependency Injection и модульную архитектуру.

### Почему NestJS

- **Структура из коробки:** Чёткое разделение на модули, контроллеры, сервисы, провайдеры.
- **Dependency Injection:** Автоматическое управление зависимостями (как в Spring/Angular).
- **TypeScript-first:** Строгая типизация, интерфейсы, декораторы.
- **Универсальность:** Поддержка REST, GraphQL, WebSockets, микросервисов.
- **Тестируемость:** Встроенная поддержка тестирования (Jest).

### Установка и создание проекта

```powershell
# Установить Nest CLI глобально
npm install -g @nestjs/cli

# Создать новый проект
nest new my-nest-app

# Перейти в папку проекта
cd my-nest-app

# Запустить dev-сервер
npm run start:dev
```

Откройте `http://localhost:3000` → увидите `Hello World!`.

### Архитектура NestJS

```plaintext
my-nest-app/
├── src/
│   ├── app.module.ts       # Корневой модуль
│   ├── app.controller.ts   # Контроллер (обрабатывает HTTP-запросы)
│   ├── app.service.ts      # Сервис (бизнес-логика)
│   └── main.ts             # Точка входа
├── test/                   # Тесты
├── nest-cli.json
├── tsconfig.json
└── package.json
```

### Контроллеры — обработка HTTP-запросов

Контроллер отвечает за обработку входящих HTTP-запросов и возврат ответов.

```typescript
// tasks.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';

@Controller('tasks')  // Префикс маршрута /tasks
export class TasksController {
  private tasks = [
    { id: 1, title: 'Изучить NestJS', completed: false },
    { id: 2, title: 'Создать API', completed: false }
  ];

  // GET /tasks
  @Get()
  findAll() {
    return this.tasks;
  }

  // GET /tasks/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    const task = this.tasks.find(t => t.id === parseInt(id));
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  // POST /tasks
  @Post()
  create(@Body() createTaskDto: any) {
    const newTask = {
      id: this.tasks.length + 1,
      title: createTaskDto.title,
      completed: false
    };
    this.tasks.push(newTask);
    return newTask;
  }

  // PUT /tasks/:id
  @Put(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: any) {
    const task = this.tasks.find(t => t.id === parseInt(id));
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    Object.assign(task, updateTaskDto);
    return task;
  }

  // DELETE /tasks/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    const index = this.tasks.findIndex(t => t.id === parseInt(id));
    if (index === -1) {
      throw new NotFoundException('Task not found');
    }
    this.tasks.splice(index, 1);
    return { message: 'Task deleted' };
  }
}
```

### Сервисы — бизнес-логика

Сервисы содержат бизнес-логику и могут внедряться в контроллеры через Dependency Injection.

```typescript
// tasks.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()  // Помечаем как провайдер для DI
export class TasksService {
  private tasks = [
    { id: 1, title: 'Изучить NestJS', completed: false },
    { id: 2, title: 'Создать API', completed: false }
  ];

  findAll() {
    return this.tasks;
  }

  findOne(id: number) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  create(title: string) {
    const newTask = {
      id: this.tasks.length + 1,
      title,
      completed: false
    };
    this.tasks.push(newTask);
    return newTask;
  }

  update(id: number, updates: Partial<{ title: string; completed: boolean }>) {
    const task = this.findOne(id);
    Object.assign(task, updates);
    return task;
  }

  remove(id: number) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    this.tasks.splice(index, 1);
  }
}
```

**Контроллер с внедрением сервиса:**

```typescript
// tasks.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  // Dependency Injection: NestJS автоматически создаст инстанс TasksService
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(parseInt(id));
  }

  @Post()
  create(@Body() createTaskDto: { title: string }) {
    return this.tasksService.create(createTaskDto.title);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: any) {
    return this.tasksService.update(parseInt(id), updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.tasksService.remove(parseInt(id));
    return { message: 'Task deleted' };
  }
}
```

### Модули — организация кода

Модуль группирует связанные компоненты (контроллеры, сервисы).

```typescript
// tasks.module.ts
import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  controllers: [TasksController],  // Контроллеры модуля
  providers: [TasksService],       // Провайдеры (сервисы) модуля
  exports: [TasksService]          // Экспортируем, если другие модули будут использовать
})
export class TasksModule {}
```

**Регистрируем модуль в корневом `app.module.ts`:**

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [TasksModule],  // Импортируем модуль задач
})
export class AppModule {}
```

### DTO и валидация с class-validator

DTO (Data Transfer Object) — классы для описания структуры данных с валидацией.

**Установка:**

```powershell
npm install class-validator class-transformer
```

**create-task.dto.ts:**

```typescript
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title: string;
}
```

**Включение валидации глобально в `main.ts`:**

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Включаем глобальную валидацию
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,  // Удаляет лишние поля из DTO
    forbidNonWhitelisted: true,  // Выбрасывает ошибку при лишних полях
    transform: true  // Автоматически преобразует типы
  }));

  await app.listen(3000);
}
bootstrap();
```

**Использование DTO в контроллере:**

```typescript
@Post()
create(@Body() createTaskDto: CreateTaskDto) {
  return this.tasksService.create(createTaskDto.title);
}
```

Теперь если отправить запрос с невалидными данными:

```powershell
curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"AB"}'
```

Ответ:

```json
{
  "statusCode": 400,
  "message": ["Title must be at least 3 characters long"],
  "error": "Bad Request"
}
```

### Guards — защита маршрутов

Guards проверяют права доступа перед выполнением обработчика.

```typescript
// auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token || token !== 'Bearer secret-token') {
      throw new UnauthorizedException('Invalid token');
    }

    return true;  // Разрешить доступ
  }
}
```

**Применение Guard к маршруту:**

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

@Controller('tasks')
export class TasksController {
  @Get()
  @UseGuards(AuthGuard)  // Защищаем маршрут
  findAll() {
    return this.tasksService.findAll();
  }
}
```

Теперь запрос без токена вернёт `401 Unauthorized`.

---

## 5) Best Practices — валидация, логирование, конфигурация

### Валидация данных

**В Express (с Zod):**

```javascript
import express from 'express';
import { z } from 'zod';

const app = express();
app.use(express.json());

// Схема валидации
const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  completed: z.boolean().optional()
});

app.post('/tasks', (req, res, next) => {
  try {
    // Валидация
    const validated = createTaskSchema.parse(req.body);
    // Обработка...
    res.status(201).json({ id: 1, ...validated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
});
```

**В Fastify (встроенная JSON Schema валидация):**

```javascript
fastify.post('/tasks', {
  schema: {
    body: {
      type: 'object',
      required: ['title'],
      properties: {
        title: { type: 'string', minLength: 3 },
        completed: { type: 'boolean' }
      }
    }
  }
}, async (request, reply) => {
  // request.body уже провалидирован
  return { id: 1, ...request.body };
});
```

**В NestJS (class-validator):**

```typescript
// dto/create-task.dto.ts
import { IsString, MinLength, IsBoolean, IsOptional } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}

// tasks.controller.ts
@Post()
create(@Body() createTaskDto: CreateTaskDto) {
  // createTaskDto уже провалидирован
  return this.tasksService.create(createTaskDto);
}
```

### Логирование

**Express + Winston:**

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

// Middleware для логирования
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Логирование ошибок
app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({ error: 'Internal Server Error' });
});
```

**Fastify (встроенный Pino):**

```javascript
const fastify = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',  // Красивый вывод в консоль
      options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' }
    }
  }
});

fastify.get('/tasks', async (request, reply) => {
  request.log.info('Fetching tasks');
  return tasks;
});
```

**NestJS (встроенный Logger):**

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  findAll() {
    this.logger.log('Fetching all tasks');
    return this.tasks;
  }

  create(title: string) {
    this.logger.log(`Creating task: ${title}`);
    // ...
  }
}
```

### Конфигурация через .env

**Установка:**

```powershell
npm install dotenv
```

**.env:**

```plaintext
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
JWT_SECRET=super-secret-key
NODE_ENV=development
```

**Express:**

```javascript
import 'dotenv/config';

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DATABASE_URL;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**NestJS (@nestjs/config):**

```powershell
npm install @nestjs/config
```

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,  // Доступен во всех модулях
      envFilePath: '.env'
    }),
    TasksModule
  ],
})
export class AppModule {}
```

**Использование:**

```typescript
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TasksService {
  constructor(private configService: ConfigService) {}

  getDbUrl() {
    return this.configService.get<string>('DATABASE_URL');
  }
}
```

### Структура проекта

**Express (слоёная архитектура):**

```plaintext
src/
├── controllers/       # Обработчики HTTP-запросов
│   └── tasks.controller.js
├── services/          # Бизнес-логика
│   └── tasks.service.js
├── repositories/      # Работа с БД
│   └── tasks.repository.js
├── middlewares/       # Middleware
│   └── auth.middleware.js
├── routes/            # Маршруты
│   └── tasks.routes.js
├── models/            # Модели данных
│   └── task.model.js
├── utils/             # Утилиты
│   └── logger.js
└── app.js             # Точка входа
```

**NestJS (модульная архитектура):**

```plaintext
src/
├── tasks/
│   ├── dto/
│   │   ├── create-task.dto.ts
│   │   └── update-task.dto.ts
│   ├── entities/
│   │   └── task.entity.ts
│   ├── tasks.controller.ts
│   ├── tasks.service.ts
│   ├── tasks.module.ts
│   └── tasks.repository.ts
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── guards/
│       └── jwt-auth.guard.ts
├── common/
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── interceptors/
│   │   └── logging.interceptor.ts
│   └── pipes/
│       └── validation.pipe.ts
├── config/
│   └── database.config.ts
├── app.module.ts
└── main.ts
```

### Централизованная обработка ошибок

**Express:**

```javascript
// utils/app-error.js
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// middlewares/error-handler.js
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

// app.js
app.use(errorHandler);
```

**NestJS (Exception Filters):**

```typescript
// filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message
    });
  }
}

// main.ts
app.useGlobalFilters(new HttpExceptionFilter());
```

---

## 6) Практическое задание: Полноценное CRUD API с аутентификацией

Создайте REST API для управления задачами с следующими возможностями:

### Требования

**Функциональность:**

1. **Регистрация и аутентификация:**
   - `POST /auth/register` — регистрация пользователя (email, password).
   - `POST /auth/login` — вход (возвращает JWT-токен).

2. **CRUD задач (защищённые маршруты):**
   - `GET /tasks` — получить все задачи текущего пользователя.
   - `POST /tasks` — создать задачу (требуется JWT).
   - `PUT /tasks/:id` — обновить задачу (только свою).
   - `DELETE /tasks/:id` — удалить задачу (только свою).

**Валидация:**

- Email должен быть валидным.
- Пароль минимум 6 символов.
- Заголовок задачи минимум 3 символа.

**Обработка ошибок:**

- `400 Bad Request` для невалидных данных.
- `401 Unauthorized` для отсутствующего/неверного токена.
- `404 Not Found` для несуществующих ресурсов.
- `500 Internal Server Error` для неожиданных ошибок.

**Логирование:**

- Логировать все входящие запросы.
- Логировать ошибки с stack trace.

**Конфигурация:**

- Порт, JWT secret, DATABASE_URL через `.env`.

### Пример реализации на Express

**package.json:**

```json
{
  "type": "module",
  "dependencies": {
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "zod": "^3.22.4",
    "dotenv": "^16.3.1",
    "winston": "^3.11.0"
  }
}
```

**.env:**

```plaintext
PORT=3000
JWT_SECRET=your-secret-key-here
```

**src/app.js (основной файл):**

```javascript
import express from 'express';
import 'dotenv/config';
import authRoutes from './routes/auth.routes.js';
import tasksRoutes from './routes/tasks.routes.js';
import { errorHandler } from './middlewares/error-handler.js';
import { logger } from './utils/logger.js';

const app = express();

app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Маршруты
app.use('/auth', authRoutes);
app.use('/tasks', tasksRoutes);

// Обработка ошибок
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`✅ Server running on http://localhost:${PORT}`);
});
```

**Запуск:**

```powershell
npm install
node src/app.js
```

**Тестирование:**

```powershell
# Регистрация
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123"}'

# Вход
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123"}'
# Ответ: {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}

# Создать задачу (с токеном)
curl -X POST http://localhost:3000/tasks -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"title":"Изучить Node.js"}'

# Получить задачи
curl http://localhost:3000/tasks -H "Authorization: Bearer YOUR_TOKEN"
```

### Критерии оценки

- **Функциональность (40%):** Все эндпоинты работают корректно.
- **Валидация (20%):** Валидация данных через Zod/class-validator.
- **Безопасность (20%):** JWT-аутентификация, хеширование паролей.
- **Обработка ошибок (10%):** Централизованный обработчик, понятные сообщения.
- **Код (10%):** Чистый код, разделение слоёв (контроллер/сервис/репозиторий).

---

## Как собрать и запустить (Windows)

**Express/Fastify:**

```powershell
# Создать проект
npm init -y

# Установить зависимости
npm install express fastify dotenv winston zod

# Создать файл .env
echo "PORT=3000" > .env

# Запустить
node server.js
```

**NestJS:**

```powershell
# Установить CLI
npm install -g @nestjs/cli

# Создать проект
nest new my-nest-app

# Перейти в проект
cd my-nest-app

# Запустить dev-сервер
npm run start:dev
```

---

## Дополнительные материалы

- [Express.js Documentation](https://expressjs.com/ru/)
- [Fastify Documentation](https://fastify.dev/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [JWT.io](https://jwt.io/) — отладка JWT-токенов
- [Zod Documentation](https://zod.dev/) — валидация в TypeScript
- [Pino Logger](https://getpino.io/) — быстрое логирование

---

## Вопросы для самопроверки

1. Что такое Event Loop в Node.js и как он работает?
2. Когда выбрать Express, а когда Fastify или NestJS?
3. Что такое Middleware и как организовать конвейер обработки запросов?
4. Как реализовать валидацию данных в Express, Fastify и NestJS?
5. Что такое Dependency Injection и какие преимущества он даёт в NestJS?
6. Как организовать централизованную обработку ошибок?
7. Какие практики логирования следует применять в production?
8. Как защитить маршруты с помощью JWT-токенов?
9. В чём разница между контроллером, сервисом и репозиторием?
10. Как структурировать проект для масштабируемости?

---

**Итог:** Вы изучили три основных подхода к созданию бэкенда на Node.js — минималистичный Express, производительный Fastify и структурированный NestJS. Выбирайте фреймворк в зависимости от размера проекта, требований к производительности и предпочтений команды! 🚀
