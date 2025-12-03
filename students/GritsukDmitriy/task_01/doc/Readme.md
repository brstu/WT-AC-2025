# Лабораторная работа 01: HTML/CSS — семантика, адаптивность и доступность

## Вариант: Сайт "Мой идеальный геймерский сетап"*

### Описание проекта

Одностраничный сайт, посвящённый описанию идеального игрового сетапа.  
Содержит разделы:

- **Игровой ПК** 

- **Консоли** 

- **Аксессуары** 

- **Советы по апгрейду**


Реализована **семантическая разметка HTML5**, **адаптивная вёрстка (mobile-first)** и **доступность (a11y)**.  
Проверено через **Lighthouse** и **W3C валидаторы**.

### Архитектура вёрстки

#### 1. Семантические элементы HTML5

- `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- `aria-label="Основная навигация"` для навигационного меню 
- Иерархия заголовков: `h1 → h2 → h3`

#### 2. Адаптивность (mobile-first)

| Брейкпоинт       | Ширина           | Особенности |
|------------------|------------------|-----------|
| **Mobile**       | `≤600px`         | 1 колонка, вертикальное меню |
| **Tablet**       | `601–1024px`     | 2 колонки, горизонтальное меню |
| **Desktop**      | `>1024px`        | 3 колонки, расширенный контейнер |

#### 3. Flexbox и CSS Grid

- **Навигация**: `display: flex` + `flex-wrap`, `flex-direction: column → row`
- **Сетки карточек**:

  ```css
    .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  ```

  Автоматически адаптируется под ширину экрана.

#### 4. Медиазапросы

  ```css
  /* Мобильные устройства (≤600px) */
  @media (max-width: 600px) {
    .cards-grid { grid-template-columns: 1fr; }
    nav ul { flex-direction: column; }
  }

  /* Планшеты (601–1024px) */
  @media (min-width: 601px) and (max-width: 1024px) {
    .cards-grid { grid-template-columns: repeat(2, 1fr); }
  }

  /* Десктоп (>1024px) */
  @media (min-width: 1025px) {
    .cards-grid { grid-template-columns: repeat(3, 1fr); }
  }
  ```

### Доступность (a11y)

| Критерий               | Реализация |
|------------------------|----------|
| **Alt-тексты**         | Все `<img>` имеют описательные `alt` |
| **Ярлыки**             | `aria-label` для навигации |
| **Иерархия заголовков**| `h1` → `h2` → `h3` |
| **Видимый фокус**      | `outline: 2px solid #e94560 с outline-offset: 2px` |
| **Управление с клавиатуры** | Все ссылки доступны через `Tab` |
| **Контраст**           | ≥ 4.5:1 |

### Качество и валидность

| Инструмент         | Результат |
|--------------------|---------|
| **Lighthouse**     | Accessibility: **95**<br>Best Practices: **92** |
| **W3C HTML Validator** | **0 ошибок** |
| **W3C CSS Validator**  | **0 ошибок** |

#### Цветовая схема и дизайн

CSS переменные для единообразия:

  ```css
  :root {
    --primary-color: #1a1a2e;
    --secondary-color: #16213e;
    --accent-color: #0f3460;
    --highlight-color: #e94560;
    --text-color: #f1f1f1;
    --border-radius: 8px;
    --transition: all 0.3s ease;
  }
  ```

Эффекты и анимации:

- **Плавные переходы** (transition: all 0.3s ease)

- **Эффекты при наведении на карточки** (transform: translateY(-5px))

- **Тени для глубины** (box-shadow)

### Производительность:

- **Минимизирован CSS** - чистый код без избыточных стилей

- **Семантическая вёрстка** - улучшает SEO и доступность

- **Адаптивные изображения** - max-width: 100%, height: auto

- **Эффективные медиазапросы** - минимум переопределений стилей

#### Web Vitals

- **CLS** — 0 (стабильная сетка, без сдвигов)  
- **LCP** — оптимизировано (маленькие изображения, быстрый рендер)  
- **INP** — мгновенный отклик (без JS)

### Скриншоты отчёта

| Описание | Скриншот |
|---------|--------|
| Lighthouse: Accessibility | ![Accessibility](assets/lighthouse-accessibility.png) |
| Lighthouse: Best Practices | ![Best Practices](assets/lighthouse-bestpractices.png) |
| HTML Validator | ![HTML](assets/html-validator.png) |
| CSS Validator | ![CSS](assets/css-validator.png) |
| Mobile (≤600px) | ![Mobile](assets/mobile.png) |
| Tablet (601–1024px) | ![Tablet](assets/tablet.png) |
| Desktop (>1024px) | ![Desktop](assets/desktop.png) |
