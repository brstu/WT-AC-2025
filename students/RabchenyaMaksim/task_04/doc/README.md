# Лабораторная работа №4 — Заметки (SPA CRUD)

<p align="center">Учреждение образования</p>
<p align="center">“Брестский Государственный технический университет”</p>
<p align="center">Кафедра ИИТ</p>

<p align="center"><strong>Лабораторная работа №4</strong></p>
<p align="center"><strong>По дисциплине:</strong> “Веб‑технологии”</p>
<p align="center"><strong>Тема:</strong> “REST‑клиент SPA: список/детализация/CRUD, маршрутизация (без фреймворков)”</p>
<br><br><br><br><br><br>
<p align="right"><strong>Выполнил:</strong></p>
<p align="right">Студент 4 курса</p>
<p align="right">Группы АС-64</p>
<p align="right">Рабченя М. Ю.</p>
<p align="right"><strong>Проверил:</strong></p>
<p align="right">Несюк А.Н.</p>
<br><br><br><br><br>
<p align="center"><strong>Брест 2025</strong></p>

---

## Цель работы

- Реализовать простой SPA без фреймворков с маршрутами и состояниями загрузки/ошибок.
- Выполнить CRUD операции через REST‑подобный API (json-server / mock).

## Краткое описание проекта

- Название: **Заметки — SPA CRUD**
- Технологии: чистый JavaScript (ES modules), CSS, HTML
- Структура проекта: см. ниже

### Структура (основные файлы)

- [src/index.html](src/index.html) : точка входа приложения и подключение роутера.
- [src/style.css](src/style.css) : стили интерфейса.
- [src/db.json](src/db.json) : начальные данные для mock‑сервера (`json-server`).
- [src/modules/api.js](src/modules/api.js) : клиент для API (настроен на `http://localhost:3000/notes`).
- [src/modules/router.js](src/modules/router.js) : hash‑роутер с поддержкой динамических параметров и query.
- [src/modules/utils.js](src/modules/utils.js) : уведомления и индикатор загрузки.
- [src/modules/views/*.js](src/modules/views/) : представления — список, деталь, форма редактирования.

## Маршрутизация

- `#/items` — список заметок (поддержка поиска через query `search`).
- `#/items/:id` — просмотр детали заметки.
- `#/items/:id/edit` — редактирование заметки.
- `#/new` — создание новой заметки.

## API

- Клиент использует `src/modules/api.js` и по умолчанию направлен на `http://localhost:3000/notes`.
- Для локального запуска можно использовать `json-server` с файлом `src/db.json`.

Примеры endpoint'ов (json-server):
- GET `/notes` — список заметок
- GET `/notes/:id` — заметка по id
- POST `/notes` — создать заметку
- PATCH `/notes/:id` — обновить заметку
- DELETE `/notes/:id` — удалить заметку

## Запуск проекта (локально)

1. Открыть проект в VS Code.
1. Установить `json-server` (если хотите использовать mock API):

```powershell
npm install -g json-server
json-server --watch src/db.json --port 3000
```

1. Запустить Live Server или открыть `src/index.html` через любой статический сервер (или расширение Live Server в VS Code):

```powershell
# пример с live-server (если установлен глобально)
live-server src
```

1. Откройте в браузере `http://127.0.0.1:5500/` (или адрес Live Server). API должен быть доступен на `http://localhost:3000`.

Если вы не хотите запускать `json-server`, можно модифицировать `src/modules/api.js`, чтобы использовать `localStorage` или относительные пути.

## Особенности реализации

- Hash‑роутер реализован в `src/modules/router.js`, использует простую подстановку `:id` через RegExp.
- Вьюхи разделены: `listView`, `detailView`, `editView` — каждая отвечает за рендер и обработку событий.
- Есть простая система уведомлений (`src/modules/utils.js`) и индикатор загрузки.
- Поиск реализован через query-параметр `search` и сохраняется в hash.

## Проверка критериев

| Критерий | Выполнено |
|---|---:|
| Семантика / UX | ✅ |
| CRUD / маршрутизация | ✅ |
| Качество интерфейса | ✅ |
| Качество кода / модульность | ✅ |
| Тесты / валидность | частично (ручная проверка) |

## Запускные замечания и рекомендации

- Убедитесь, что `json-server` запущен на порту `3000`, либо поправьте `API_URL` в `src/modules/api.js`.
- Для быстрой демонстрации можно заменить API на `localStorage`‑реализацию или использовать `db.json` с `json-server`.
- Если нужно, могу добавить инструкции по деплою на GitHub Pages и исправление `API_URL` для демонстрации (например, переключение на mock внутри кода).
