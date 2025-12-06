# Каталог книг с рецензиями

SPA-приложение для управления каталогом книг с системой рецензий.
Вариант - 20.
Выполнил - Стельмашук И.А.

## Функциональность

- Просмотр списка книг с фильтрацией и поиском
- Детальная информация о книге
- Создание и редактирование книг
- Добавление рецензий с рейтингом
- Удаление книг и рецензий
- Адаптивный дизайн

## Технологии

- React 18 + TypeScript
- Vite (сборка)
- Redux Toolkit + RTK Query
- React Router v6
- React Hook Form + Zod (валидация)
- Tailwind CSS (стилизация)
- JSON Server (mock API)

## Запуск проекта

### 1. Клонирование и установка

```bash
git clone <repository-url>
cd book-catalog
npm install
```

### 2. Запуск сервера разработки

В двух терминалах:

```bash

# Терминал 1: Запуск JSON Server
npm run server

# Терминал 2: Запуск приложения
npm run dev
```

Приложение будет доступно по адресу: <http://localhost:3000>
API будет доступно по адресу: <http://localhost:3001>

### 3. Сборка для продакшена

```bash
npm run build
npm run preview
```

## Структура проекта

```text
src/
├── components/     # Переиспользуемые компоненты
├── features/       # Логика (API, слайсы)
├── pages/         # Страницы приложения
├── store/         # Конфигурация хранилища
├── utils/         # Вспомогательные функции
└── App.tsx        # Корневой компонент
```

## API Endpoints

GET /books - получить список книг
GET /books/:id - получить книгу по ID
POST /books - создать книгу
PUT /books/:id - обновить книгу
DELETE /books/:id - удалить книгу
GET /reviews?bookId=:id - получить рецензии для книги
POST /reviews - создать рецензию
DELETE /reviews/:id - удалить рецензию

## Переменные окружения

Создайте файл .env на основе .env.example:

```env
VITE_API_URL=http://localhost:3001
```

## Демо

[Ссылка](https://kulibini.github.io/Lab7/)
