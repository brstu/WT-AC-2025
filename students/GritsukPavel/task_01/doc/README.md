# Лабораторная работа 01: HTML/CSS — семантика, адаптивность и доступность

## Вариант: Сайт о футболе — правила, турниры, топ‑игроки и видео

### Описание проекта

Одностраничный сайт, посвящённый футболу.
Содержит разделы:
- Введение — почему футбол захватывает
- Краткие правила — состав, поле, время, нарушения
- Крупнейшие турниры — Чемпионат мира (FIFA), Лига чемпионов УЕФА, Чемпионат Европы
- Топ‑игроки — Месси, Роналду, Пеле
- Видео — видео с YouTube
- О сайте — цель ресурса и лицензия

Реализована семантическая разметка HTML5, адаптивная вёрстка (mobile‑first) и доступность (a11y).
Стиль оформления README соответствует учебному образцу.

---

### Структура проекта

- `index.html` — основная страница (семантическая вёрстка, разделы, доступность, встроенные видео)
- `styles.css` — стили: CSS‑переменные, Grid/Flex, медиа‑запросы
- `ball.jpg`, `penalty.jpg`, `messi.jpg`, `ronaldo.jpg`, `pele.jpg` — изображения
- Дополнительно: плавающая кнопка “Наверх” и клавиатурная навигация по меню

---

### Архитектура вёрстки

#### Семантические элементы HTML5

- `header`, `nav`, `main`, `section`, `article`, `footer`
- `role="banner"`, `aria-label` для навигации, `role="contentinfo"`
- `aria-labelledby` для связи секций с заголовками
- Иерархия заголовков: `h1 → h2 → h3`

#### Адаптивность (mobile‑first)

- **Mobile ≤600px:** одна колонка, компактные отступы
- **Tablet 601–1024px:** две колонки в блоке hero и сетке карточек
- **Desktop >1024px:** три колонки для карточек, увеличенный базовый размер шрифта, симметричные боковые поля

#### Flexbox и CSS Grid

- **Навигация:** `display: flex`, `gap`, перенос элементов на узких экранах
- **Карточки турниров и игроков:** `grid` с переключением количества колонок по брейкпоинтам
- **Hero:** CSS Grid с областями `title / media / text` (mobile → tablet/desktop)

### Медиа‑запросы (в `styles.css`)

Примеры в `styles.css`:

```css
@media (max-width: 600px) { /* mobile_styles */ }
@media (min-width: 601px) and (max-width: 1024px) { /* tablet_styles */ }
@media (min-width: 1025px) { /* desktop_styles */ }
```

## Доступность (a11y)

- **Skip link:** “Перейти к основному содержимому” для быстрого перехода с клавиатуры
- **Alt‑тексты:** у всех img — описательные alt
- **Видимый фокус:** outline 3px контрастного цвета, outline‑offset
- **Контраст:** усиленный цвет ссылок для достижения ≥ 4.5:1
- **Медиа‑семантика:** figure + figcaption, title у iframe
- **Безопасность внешних ссылок:** target="_blank" + rel="noopener"

## Качество и валидность

Ниже приведены результаты проверок качества и валидности, полученные для текущей версии сайта.

| Инструмент | Результат |
|---|---|
| Lighthouse | Accessibility: **95**, Best Practices: **92** |
| W3C HTML Validator | **0 ошибок** |
| W3C CSS Validator | **0 ошибок** |

## Скриншоты отчёта

| Описание | Скриншот |
|---|---|
| Lighthouse: Accessibility | [![Accessibility](report/lighthouse-accessibility.png)](report/lighthouse-accessibility.png) |
| Lighthouse: Best Practices | [![Best Practices](report/lighthouse-best-practices.png)](report/lighthouse-best-practices.png) |
| HTML Validator | [![HTML](report/html-validator.png)](report/html-validator.png) |
| CSS Validator | [![CSS](report/css-validator.png)](report/css-validator.png) |
| Mobile (≤600px) | [![Mobile](report/mobile.png)](report/mobile.png) |
| Tablet (601–1024px) | [![Tablet](report/tablet.png)](report/tablet.png) |
| Desktop (>1024px) | [![Desktop](report/desktop.png)](report/desktop.png) |
