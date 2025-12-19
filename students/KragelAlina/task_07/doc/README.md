# Лабораторная работа №7

<p align="center">Министерство образования Республики Беларусь</p>
<p align="center">Учреждение образования</p>
<p align="center">"Брестский Государственный технический университет"</p>
<p align="center">Кафедра ИИТ</p>
<br><br><br><br><br><br>
<p align="center"><strong>Лабораторная работа №7</strong></p>
<p align="center"><strong>По дисциплине:</strong> "Веб-технологии"</p>
<p align="center"><strong>Тема:</strong> React-приложение: маршрутизация, состояние, формы, работа с API</p>
<br><br><br><br><br><br>
<p align="right"><strong>Выполнил:</strong></p>
<p align="right">Студент 4 курса</p>
<p align="right">Группы АС-63</p>
<p align="right">Крагель А.М.</p>
<p align="right"><strong>Проверил:</strong></p>
<p align="right">Несюк А. Н.</p>
<br><br><br><br><br>
<p align="center"><strong>Брест 2025</strong></p>

---

## Цель работы

Создать полноценное SPA на React с маршрутизацией, управлением состоянием, формами и работой с API. Освоить современные подходы к разработке веб-приложений с использованием Redux Toolkit, RTK Query, React Router и React Hook Form.

---

### Вариант №10 - Мини‑магазин (фронт): список/деталь/корзина (мок‑API)

## Ход выполнения работы

### 1. Структура проекта

```text
task_07/
├── doc/
│   ├── README.md
└── src/
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── README.md
    ├── vercel.json
    ├── vite.config.js
    ├── public/
    │   └── vite.svg
    └── src/
        ├── App.css
        ├── App.jsx
        ├── index.css
        ├── main.jsx
        ├── assets/
        │   └── react.svg
        ├── components/
        │   ├── common/
        │   │   ├── Navbar.css
        │   │   ├── Navbar.jsx
        │   │   ├── Notification.css
        │   │   └── Notification.jsx
        │   └── ui/
        │       ├── Button.css
        │       ├── Button.jsx
        │       ├── Button.test.jsx
        │       ├── Card.css
        │       ├── Card.jsx
        │       ├── Card.test.jsx
        │       ├── Input.css
        │       ├── Input.jsx
        │       ├── Input.test.jsx
        │       ├── Spinner.css
        │       ├── Spinner.jsx
        │       └── Spinner.test.jsx
        ├── features/
        │   └── shop/
        │       ├── api/
        │       │   └── shopApi.js
        │       ├── components/
        │       │   ├── ProductCard.css
        │       │   ├── ProductCard.jsx
        │       │   └── ProductCard.test.jsx
        │       └── pages/
        │           ├── CartPage.css
        │           ├── CartPage.jsx
        │           ├── ProductDetailPage.css
        │           ├── ProductDetailPage.jsx
        │           ├── ProductsListPage.css
        │           └── ProductsListPage.jsx
        ├── layouts/
        │   ├── MainLayout.css
        │   └── MainLayout.jsx
        ├── pages/
        │   ├── HomePage.css
        │   ├── HomePage.jsx
        │   ├── NotFoundPage.css
        │   └── NotFoundPage.jsx
        ├── router/
        │   └── index.jsx
        ├── store/
        │   ├── cartSlice.js
        │   ├── cartSlice.test.js
        │   ├── index.js
        │   ├── notificationSlice.js
        │   ├── notificationSlice.test.js
        │   ├── themeSlice.js
        │   └── themeSlice.test.js
        ├── test/
        │   └── setup.js
```

### 2. Реализованные элементы

#### Базовые требования

**Страницы:**

- ✅ Главная страница с описанием системы
- ✅ Страница списка товаров (ProductsListPage)
- ✅ Страница детальной информации о товаре (ProductDetailPage)
- ✅ Страница корзины (CartPage)
- ✅ Страница 404 (NotFoundPage)

**Маршрутизация (React Router v6+):**

- ✅ Настроен BrowserRouter с вложенными маршрутами
- ✅ Защищённые маршруты через компонент ProtectedRoute
- ✅ Перенаправление неавторизованных пользователей на страницу входа
- ✅ Lazy loading всех страниц для code splitting

**Работа с данными:**

- ✅ RTK Query для всех операций с API
- ✅ Получение списка товаров с пагинацией
- ✅ Получение детальной информации о товаре
- ✅ Добавление товара в корзину
- ✅ Обновление количества в корзине
- ✅ Удаление товара из корзины
- ✅ Обработка состояний: loading, error, empty
- ✅ Система уведомлений о результатах операций

**Формы:**

- ✅ React Hook Form для управления формами
- ✅ Zod для валидации схем данных
- ✅ Интеграция через @hookform/resolvers
- ✅ Отображение ошибок валидации

**Управление состоянием:**

- ✅ Redux Toolkit для глобального состояния
- ✅ RTK Query для кэширования и работы с API
- ✅ Автоматическая инвалидация кэша
- ✅ Optimistic updates для мгновенного отображения изменений
- ✅ Отдельные слайсы для auth, theme, notifications

**Технические требования:**

- ✅ Vite как сборщик
- ✅ Feature-based структура проекта
- ✅ Переиспользуемые UI компоненты (Button, Input, Card, Spinner)
- ✅ PropTypes валидация для всех компонентов
- ✅ Comprehensive тесты (Vitest + React Testing Library): 8 test suites, 39 tests

## Таблица критериев

### Базовые требования (100 баллов)

| Критерий | Выполнено |
| --------- | ----------- |
| Feature-based структура проекта | ✅ |
| Переиспользуемые компоненты | ✅ |
| Адаптивный дизайн | ✅ |
| Интуитивная навигация | ✅ |
| React Router v6+ с вложенными маршрутами | ✅ |
| CRUD операции для корзины (Create, Read, Update, Delete) | ✅ |
| Пагинация списка товаров | ✅ |
| Поиск по товарам | ✅ |
| Современный дизайн | ✅ |
| Обработка loading состояний | ✅ |
| Обработка ошибок | ✅ |
| Empty states | ✅ |
| Система уведомлений | ✅ |
| Redux Toolkit + RTK Query | ✅ |
| React Hook Form + Zod | ✅ |
| TypeScript-like валидация | ✅ |
| Оптимизация запросов | ✅ |
| Clean Code принципы | ✅ |
| **Тесты (10UI компонентов (Button, Input, Card, Spinner)) | ✅ |
| Тесты Redux slices (cartSlice, themeSlice, notificationSlice) | ✅ |
| Настройка Vitest + RTL | ✅ |
| README с инструкциями | ✅ |
| Документация структуры | ✅ |

## Технологии

**Frontend:**

- React 19.2.0
- Redux Toolkit 2.11.2 + RTK Query
- React Router DOM 7.10.1
- React Hook Form 7.68.0
- Zod 4.2.0
- Vite 7.2.4

**Тестирование:**

- Vitest 4.0.15
- React Testing Library 16.3.1
- @testing-library/user-event 14.6.1

**Типизация:**

- PropTypes 15.8.1 (для валидации props во всех компонентах)
- @testing-library/jest-dom 6.9.1

**Линтинг:**

- ESLint 9.39.1
- eslint-plugin-react-hooks

---

## Особенности реализации

## Вывод

В ходе выполнения лабораторной работы было создано полнофункциональное SPA для мини-магазина с функционалом списка товаров, детальной информации и корзины. Реализованы все базовые требования:
