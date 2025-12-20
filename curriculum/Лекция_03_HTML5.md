# Лекция 03. HTML5: структура, семантика, новые возможности

План:
- Базовая структура HTML5-документа
- Семантические теги: header, nav, main, article, section, aside, footer
- Формы, медиа, новые атрибуты и API

Практика: сверстать простую страницу с использованием семантических тегов и форм.

Чтение: MDN Web Docs (HTML5 Guide), htmlreference.io

## Материал для лекции

### 1. Структура HTML5-документа
**Теория:**  
- HTML5-документ начинается с `<!DOCTYPE html>`, далее идут теги `<html>`, `<head>`, `<body>`.
- В `<head>` размещаются метаданные: `<title>`, `<meta>`, `<link>`, `<script>`.
- В `<body>` — содержимое страницы: текст, изображения, формы, навигация.
- **Пример:**
  ```html
  <!DOCTYPE html>
  <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <title>Пример HTML5</title>
    </head>
    <body>
      <h1>Добро пожаловать!</h1>
      <p>Это пример базовой структуры HTML5.</p>
    </body>
  </html>
  ```

### 2. Семантические теги
**Теория:**  
- Семантические теги делают структуру страницы понятной для браузеров, поисковиков и людей.
- Основные теги:  
  - `<header>` — шапка сайта или раздела.
  - `<nav>` — навигация по сайту.
  - `<main>` — основное содержимое.
  - `<article>` — самостоятельный блок (статья, пост).
  - `<section>` — логический раздел.
  - `<aside>` — боковая информация (сайдбар, реклама).
  - `<footer>` — подвал сайта или раздела.
- **Пример:**
  ```html
  <header>
    <h1>Мой блог</h1>
    <nav>
      <a href="/">Главная</a>
      <a href="/about">О сайте</a>
    </nav>
  </header>
  <main>
    <article>
      <h2>Первая запись</h2>
      <p>Текст статьи...</p>
    </article>
    <aside>
      <h3>Сайдбар</h3>
      <p>Полезные ссылки</p>
    </aside>
  </main>
  <footer>
    &copy; 2024 Мой блог
  </footer>
  ```

### 3. Формы, медиа, новые возможности
**Теория:**  
- Формы: `<form>`, `<input>`, `<textarea>`, `<button>`, `<select>`, `<option>`.
- Новые типы `<input>`: email, url, date, range, color, number.
- Новые атрибуты: `placeholder`, `required`, `autofocus`, `pattern`.
- Медиа:  
  - `<img src="..." alt="...">` — изображение.
  - `<audio controls src="..."></audio>` — аудио.
  - `<video controls src="..."></video>` — видео.
- Новые API:  
  - Drag & Drop, LocalStorage, Geolocation, Canvas, SVG.
- **Пример формы:**
  ```html
  <form>
    <input type="email" placeholder="Ваш email" required>
    <input type="date">
    <button type="submit">Отправить</button>
  </form>
  ```
- **Пример видео:**
  ```html
  <video controls width="320">
    <source src="movie.mp4" type="video/mp4">
    Ваш браузер не поддерживает видео.
  </video>
  ```

### 4. Практические аспекты и задания
- Сверстайте страницу с header, nav, main, article, aside, footer.
- Добавьте форму обратной связи с валидацией.
- Вставьте видео и аудио с помощью тегов <video> и <audio>.
- Используйте новые атрибуты (placeholder, required, autofocus).

---

**Практика:**
- Сверстайте личную страницу с семантической разметкой и формой обратной связи.
- Для начального уровня:  
  - Используйте валидатор HTML для проверки кода.
  - Попробуйте добавить картинку и видео на страницу.