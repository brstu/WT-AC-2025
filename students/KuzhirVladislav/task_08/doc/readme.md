# Министерство образования Республики Беларусь

<p align="center">Учреждение образования</p>
<p align="center">“Брестский Государственный технический университет”</p>
<p align="center">Кафедра ИИТ</p>
<br><br><br><br><br><br>
<p align="center"><strong>Лабораторная работа №8</strong></p>
<p align="center"><strong>По дисциплине:</strong> “Веб-технологии”</p>
<p align="center"><strong>Тема:</strong> Качество и деплой: тесты, Docker, CI/CD, Lighthouse</p>
<br><br><br><br><br><br>
<p align="right"><strong>Выполнил:</strong></p>
<p align="right">Студент 4 курса</p>
<p align="right">Группы АС-64</p>
<p align="right">Кужир В.В.</p>
<p align="right"><strong>Проверил:</strong></p>
<p align="right">Несюк А.Н.</p>
<br><br><br><br><br>
<p align="center"><strong>Брест 2025</strong></p>

---

## Цель работы

Настроить unit/integration/e2e тесты (по мере необходимости).
Подготовить Dockerfile и docker‑compose для локального запуска.
Собрать базовый pipeline в GitHub Actions.

---

### Вариант №36

## Ход выполнения работы

### 1. Структура проекта

.<br>
├── .github<br>
│ └── workflows<br>
│ └── ci.yml<br>
├── assets<br>
│ └── style.css<br>
├── components<br>
│ ├── Button.jsx<br>
│ ├── ErrorMessage.jsx<br>
│ ├── FormInput.jsx<br>
│ ├── Loader.jsx<br>
│ └── Nav.jsx<br>
├── e2e<br>
│ ├── add-museum.spec.js<br>
│ └── login.spec.js<br>
├── node_modules<br>
├── pages<br>
│ ├── Login.jsx<br>
│ ├── MuseumDetail.jsx<br>
│ ├── MuseumForm.jsx<br>
│ ├── MuseumsList.jsx<br>
│ ├── NotFound.jsx<br>
│ └── Register.jsx<br>
├── store<br>
│ ├── apiSlice.js<br>
│ ├── favoritesSlice.js<br>
│ └── store.js<br>
├── tests<br>
│ ├── Button.test.jsx<br>
│ ├── favoritesSlice.test.js<br>
│ └── MuseumsList.test.js<br>
├── .env<br>
├── .env.example<br>
├── App.jsx<br>
├── db.json<br>
├── docker-compose.yml<br>
├── Dockerfile<br>
├── index.html<br>
├── main.jsx<br>
├── package-lock.json<br>
├── package.json<br>
├── README.md<br>
├── router.jsx<br>
└── vite.config.js<br>

### 2. Реализованные элементы

- Тестирование: 2–3 unit, 1–2 integration/RTL или e2e (Cypress/Playwright).
- Docker: многостадийный Dockerfile; docker‑compose при наличии БД.
- CI/CD: workflow install → lint → test → build;
- опционально — сборка Docker‑образа и публикация.
- Качество: прогон Lighthouse (Performance/Accessibility/Best Practices/SEO) и скриншоты.

### 3. Скриншоты выполненой лабораторной работы

![alt text](image.png)

---

## Таблица критериев

👉 Для удобства проверки и выполнения вашей лабораторной работы составьте таблицу критериев опираясь на задание (обычно task_xx/readme.md)

<strong>Пример таблицы критериев:<br></strong>
_(можно использовать для Лабораторной работы №1)_

| Критерий                                  | Выполнено |
| ----------------------------------------- | --------- |
| Тесты                                     | ✅        |
| Контейнеризация                           | ✅        |
| CI (сборка/тесты)                         | ✅        |
| Качество интерфейса/показатели Lighthouse | ✅        |
| Качество кода/конфигураций                | ✅        |
| Документация/инструкции                   | ✅        |

### Дополнительные бонусы

| Бонус                                                | Выполнено |
| ---------------------------------------------------- | --------- |
| CD: автодеплой в Pages/Netlify/Vercel/Render/Fly.io. | ❌        |
| Мониторинг ошибок (Sentry) или логирование запросов. | ❌        |
| Проверка типов (TypeScript, strict).                 | ❌        |

---

## Вывод

Настроил unit/integration/e2e тесты (по мере необходимости).
Подготовил Dockerfile и docker‑compose для локального запуска.
Собрал базовый pipeline в GitHub Actions.
