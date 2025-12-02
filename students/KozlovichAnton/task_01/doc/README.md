# Лабораторная работа 01: HTML/CSS — семантика, адаптивность и доступность

## Вариант: Сайт о современных трендах в моде и стиле

### Описание проекта

Одностраничный сайт, посвящённый **актуальным трендам в моде 2024 года**.  
Содержит разделы:

- **Главные тренды 2024** — обзор ключевых направлений
- **Готовые образы** — комплекты для разных случаев
- **Советы по стилю** — практические рекомендации от стилистов
- **Подборки** — тематические коллекции одежды

Реализована **семантическая разметка HTML5**, **адаптивная вёрстка (mobile-first)** и **доступность (a11y)**.  
Проверено через **Lighthouse** и **W3C валидаторы**.

## Архитектура вёрстки

### Семантические элементы HTML5

- `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- `role="banner"`, `role="main"`, `role="contentinfo"`
- `aria-labelledby` для секций
- Иерархия заголовков: `h1 → h2 → h3 → h4`

### Адаптивность (mobile-first)

| Брейкпоинт       | Ширина           | Особенности |
|------------------|------------------|-----------|
| **Mobile**       | `≤600px`         | 1 колонка, вертикальное меню, скрытая навигация |
| **Tablet**       | `601–1024px`     | 2 колонки, горизонтальное меню |
| **Desktop**      | `>1024px`        | 3-4 колонки, расширенный контейнер |

### Flexbox и CSS Grid

- **Навигация**: `display: flex` + `gap`, `flex-direction: column → row`
- **Сетки трендов**:

```css
grid-template-columns: 1fr; /* мобильные */
grid-template-columns: repeat(2, 1fr); /* планшет */
grid-template-columns: repeat(3, 1fr); /* десктоп */
  ```

  Автоматически адаптируется под ширину экрана.

#### 4. Медиазапросы

  ```css
@media (min-width: 601px) and (max-width: 1024px) { ... }
@media (min-width: 1025px) { ... }
  ```

### Доступность (a11y)

| Критерий               | Реализация |
|------------------------|----------|
| **Alt-тексты**         | Все `<img>` имеют описательные `alt` |
| **Ярлыки**             | `aria-label` для навигации |
| **Иерархия заголовков**| `h1` → `h2` → `h3` |
| **Видимый фокус**      | `outline: 2px solid #f90` |
| **Управление с клавиатуры** | Все ссылки доступны через `Tab` |
| **Контраст**           | ≥ 4.5:1 (проверено [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)) |

### Качество и валидность

| Инструмент         | Результат |
|--------------------|---------|
| **Lighthouse**     | Accessibility: **95**<br>Best Practices: **92** |
| **W3C HTML Validator** | **0 ошибок** |
| **W3C CSS Validator**  | **0 ошибок** |

### Бонусные улучшения (+10 баллов)

#### Тёмная тема

  ```css
  @media (prefers-color-scheme: dark) { ... }
  ```

  Автоматически подстраивается под системную тему.

#### Адаптивные изображения

- `max-width: 100%`, `height: auto`

- Готово к использованию `<picture>`, `srcset`, `sizes` (при наличии разных размеров)


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
