# Лекция 18. UI/UX: дизайн-системы, доступность (a11y), производительность

Цель лекции — понять, что хороший пользовательский интерфейс — это не только красивый дизайн, но и продуманный UX, доступность для всех пользователей (включая людей с ограниченными возможностями), и высокая производительность. Мы изучим принципы проектирования интерфейсов, дизайн-системы как инструмент консистентности, стандарты доступности (WCAG, ARIA), метрики производительности (Core Web Vitals) и инструменты для их измерения.

Короткая карта тем:

1. UX-принципы — иерархия, консистентность, обратная связь, ошибкоустойчивость.
2. Дизайн-системы и токены — как обеспечить единый стиль и масштабируемость.
3. Доступность (a11y) — WCAG, семантическая HTML, ARIA, клавиатурная навигация, контрасты.
4. Core Web Vitals — метрики производительности UX: LCP, CLS, INP.
5. Инструменты — Lighthouse, Axe, DevTools Performance, Web Vitals.
6. Практика — чек-лист a11y, оптимизация проекта по Lighthouse.

Чтение:

- WCAG (обзор): <https://www.w3.org/WAI/standards-guidelines/wcag/>
- MDN Accessibility: <https://developer.mozilla.org/ru/docs/Web/Accessibility>
- Web.dev Core Web Vitals: <https://web.dev/vitals/>
- Material Design (Google): <https://m3.material.io/>
- Ant Design: <https://ant.design/>

---

## 1) UX-принципы — фундамент хорошего интерфейса

Хороший UX (User Experience) — это не случайность, а результат применения проверенных принципов проектирования. Даже если вы не дизайнер, понимание этих принципов поможет вам создавать интуитивные интерфейсы.

### Визуальная иерархия

**Суть:** Важные элементы должны быть заметнее второстепенных.

**Инструменты:**

- **Размер:** Заголовки крупнее текста, основная кнопка крупнее второстепенной.
- **Цвет и контраст:** Яркие, контрастные элементы привлекают внимание.
- **Позиция:** Верхняя часть экрана и левая сторона (для LTR языков) — зоны с высоким вниманием.
- **Белое пространство (whitespace):** Даёт элементам "дышать", упрощает восприятие.

**Пример плохой иерархии:**

```html
<button>Отмена</button>
<button>Удалить</button>
```

Обе кнопки одинаковы — пользователь не понимает, какая важнее.

**Пример хорошей иерархии:**

```html
<button class="btn-secondary">Отмена</button>
<button class="btn-danger">Удалить</button>
```

"Удалить" выделена цветом (красный), сигнализируя об опасности и важности действия.

### Консистентность (последовательность)

**Суть:** Одинаковые элементы должны выглядеть и вести себя одинаково во всём приложении.

**Почему важно:**

- Пользователи быстрее учатся интерфейсу.
- Снижается когнитивная нагрузка.
- Упрощается разработка (переиспользуемые компоненты).

**Примеры консистентности:**

- Все кнопки имеют одинаковую форму, радиус скругления, отступы.
- Иконки одного стиля (outline или filled, но не вперемешку).
- Все формы используют одинаковую валидацию и стили ошибок.

**Антипаттерн:** В одной части сайта кнопка "Сохранить" синяя, в другой — зелёная, в третьей — текстовая ссылка.

### Обратная связь (feedback)

**Суть:** Интерфейс должен реагировать на действия пользователя.

**Примеры:**

- **Ховер-эффекты:** Кнопка меняет цвет при наведении → пользователь понимает, что она кликабельна.
- **Состояние загрузки:** После клика на кнопку "Отправить" появляется спиннер или кнопка становится неактивной → пользователь знает, что запрос обрабатывается.
- **Успешные/ошибочные действия:** После сохранения — уведомление "Сохранено", после ошибки — сообщение "Не удалось сохранить".
- **Валидация форм:** Подсветка ошибочных полей в реальном времени.

**Антипаттерн:** Кнопка "Отправить" кликается, но ничего не происходит — пользователь кликает снова и снова, создавая дубликаты запросов.

### Ошибкоустойчивость (forgiveness)

**Суть:** Интерфейс должен предотвращать ошибки и позволять их легко исправлять.

**Инструменты:**

- **Подтверждение опасных действий:** Перед удалением — модальное окно "Вы уверены?"
- **Undo/Redo:** Возможность отменить действие (например, Gmail: "Письмо отправлено. Отменить").
- **Автосохранение:** Черновики в формах, чтобы пользователь не потерял данные.
- **Понятные сообщения об ошибках:** Не "Error 500", а "Не удалось загрузить данные. Попробуйте позже."

**Пример:**

```tsx
function DeleteButton({ onDelete }: { onDelete: () => void }) {
  const [showConfirm, setShowConfirm] = useState(false)

  if (showConfirm) {
    return (
      <div>
        <p>Удалить задачу?</p>
        <button onClick={onDelete}>Да, удалить</button>
        <button onClick={() => setShowConfirm(false)}>Отмена</button>
      </div>
    )
  }

  return <button onClick={() => setShowConfirm(true)}>Удалить</button>
}
```

---

## 2) Дизайн-системы и токены — основа масштабируемого UI

Дизайн-система — это набор правил, компонентов и стандартов, которые обеспечивают консистентность интерфейса во всём продукте (и даже в нескольких продуктах одной компании).

### Что входит в дизайн-систему

1. **Токены (design tokens)** — переменные для цветов, шрифтов, отступов, радиусов и т.д.
2. **Компоненты** — переиспользуемые UI-блоки (Button, Input, Card, Modal).
3. **Гайдлайны (guidelines)** — правила использования компонентов, тон общения, accessibility требования.
4. **Документация** — описание компонентов, примеры использования (часто в Storybook).

### Токены — абстракция над значениями

Токены позволяют заменить hardcoded значения (например, `#3b82f6`, `16px`) на семантические имена (`--color-primary`, `--space-4`).

**Пример: цветовые токены**

```css
:root {
  /* Базовые цвета */
  --color-blue-500: #3b82f6;
  --color-gray-900: #111827;
  --color-white: #ffffff;

  /* Семантические токены */
  --color-primary: var(--color-blue-500);
  --color-bg: var(--color-white);
  --color-text: var(--color-gray-900);
}

/* Темная тема */
[data-theme="dark"] {
  --color-bg: var(--color-gray-900);
  --color-text: var(--color-white);
}

button.primary {
  background: var(--color-primary);
  color: var(--color-bg);
}
```

**Преимущества:**

- **Централизованное управление:** Изменили `--color-primary` в одном месте — изменилось во всём приложении.
- **Тематизация:** Легко создать светлую/тёмную тему, просто переопределив токены.
- **Согласованность:** Все используют одни и те же значения.

**Типы токенов:**

- **Цвета:** primary, secondary, error, warning, success, text, background, border
- **Типографика:** font-family, font-size, font-weight, line-height
- **Spacing (отступы):** space-1 (4px), space-2 (8px), space-4 (16px), space-8 (32px) и т.д.
- **Радиусы:** radius-sm (4px), radius-md (8px), radius-lg (16px)
- **Тени:** shadow-sm, shadow-md, shadow-lg
- **Анимации:** duration-fast (150ms), duration-normal (300ms), easing (cubic-bezier)

**Пример: система отступов**

```css
:root {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
}

.card {
  padding: var(--space-4);
  margin-bottom: var(--space-6);
}

.button {
  padding: var(--space-2) var(--space-4);
}
```

### Компоненты — строительные блоки интерфейса

Дизайн-система включает библиотеку готовых компонентов с фиксированным API и стилями.

**Примеры компонентов:**

- **Базовые:** Button, Input, Checkbox, Radio, Select, Textarea
- **Навигация:** Header, Sidebar, Breadcrumb, Tabs, Pagination
- **Контент:** Card, List, Table, Avatar, Badge
- **Оверлеи:** Modal, Drawer, Tooltip, Popover, Dropdown
- **Обратная связь:** Alert, Toast, Spinner, Progress

**Пример: Button компонент**

```tsx
// Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled
}: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant} btn--${size}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
```

```css
/* Button.css */
.btn {
  font-family: var(--font-base);
  font-weight: 600;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--duration-fast);
}

.btn--primary {
  background: var(--color-primary);
  color: white;
}

.btn--secondary {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.btn--danger {
  background: var(--color-error);
  color: white;
}

.btn--sm { padding: var(--space-2) var(--space-3); font-size: 0.875rem; }
.btn--md { padding: var(--space-3) var(--space-4); }
.btn--lg { padding: var(--space-4) var(--space-6); font-size: 1.125rem; }
```

### Примеры дизайн-систем

- **Material Design (Google)** — <https://m3.material.io/>
- **Ant Design** — <https://ant.design/>
- **Chakra UI** — <https://chakra-ui.com/>
- **Radix UI (headless)** — <https://www.radix-ui.com/>
- **IBM Carbon** — <https://carbondesignsystem.com/>

---

## 3) Доступность (accessibility, a11y) — интерфейсы для всех

Доступность (accessibility, сокращённо a11y — "a" + 11 букв + "y") — это практика создания интерфейсов, которые может использовать любой человек, независимо от его физических или когнитивных способностей.

### Почему это важно

- **15-20% населения имеют ту или иную форму инвалидности:** Слепота, слабое зрение, глухота, моторные нарушения, когнитивные особенности.
- **Юридические требования:** Многие страны требуют соответствия WCAG для государственных и коммерческих сайтов.
- **SEO:** Семантичный HTML и доступность улучшают индексацию поисковыми системами.
- **Лучший UX для всех:** Хорошо структурированный, доступный интерфейс удобнее и для "обычных" пользователей.

### WCAG — стандарт доступности

**WCAG (Web Content Accessibility Guidelines)** — международный стандарт W3C, описывающий требования к доступности веб-контента.

**Уровни соответствия:**

- **A:** Минимальный уровень (базовые требования).
- **AA:** Средний уровень (рекомендуется для большинства сайтов).
- **AAA:** Высший уровень (для критичных сервисов, например, медицина, государственные услуги).

**Четыре принципа WCAG (POUR):**

1. **Perceivable (Воспринимаемость):** Контент должен быть доступен всем органам чувств.
   - Текстовые альтернативы для изображений (`alt`).
   - Субтитры для видео.
   - Достаточный контраст цветов.

2. **Operable (Управляемость):** Интерфейс должен быть доступен с клавиатуры, голосом, ассистивными технологиями.
   - Все функции доступны с клавиатуры (не только мышь).
   - Достаточное время для взаимодействия (не автоматически закрывающиеся уведомления за 1 секунду).
   - Отсутствие контента, вызывающего эпилептические приступы (мигающие элементы).

3. **Understandable (Понятность):** Контент и интерфейс должны быть понятны.
   - Понятный язык (простые формулировки).
   - Предсказуемое поведение (одинаковые действия дают одинаковый результат).
   - Помощь при вводе (валидация форм, подсказки).

4. **Robust (Надёжность):** Контент должен корректно работать с ассистивными технологиями.
   - Валидный HTML.
   - Правильное использование ARIA.

### Семантическая HTML — основа доступности

Используйте правильные HTML-теги вместо бессмысленных `<div>` и `<span>`.

**Плохо:**

```html
<div onclick="submit()">Отправить</div>
```

Проблемы:

- Screen reader не поймёт, что это кнопка.
- Недоступна с клавиатуры (нет фокуса).
- Нет встроенного поведения кнопки.

**Хорошо:**

```html
<button type="submit">Отправить</button>
```

**Семантические теги:**

- **Структура:** `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`
- **Формы:** `<label>`, `<input>`, `<textarea>`, `<select>`, `<button>`, `<fieldset>`, `<legend>`
- **Заголовки:** `<h1>` - `<h6>` (правильная иерархия)
- **Списки:** `<ul>`, `<ol>`, `<li>`
- **Ссылки:** `<a>` (не `<div onclick>`)
- **Изображения:** `<img>` с обязательным `alt`

**Пример правильной структуры:**

```html
<header>
  <nav aria-label="Основная навигация">
    <ul>
      <li><a href="/">Главная</a></li>
      <li><a href="/about">О нас</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Заголовок статьи</h1>
    <p>Текст статьи...</p>
  </article>
</main>

<footer>
  <p>&copy; 2025 Company</p>
</footer>
```

### Формы и связь label-input

Каждое поле ввода должно иметь связанный `<label>`.

**Хорошо:**

```html
<label for="email">Email</label>
<input id="email" type="email" aria-describedby="emailHelp" />
<small id="emailHelp">Мы не передаём почту третьим лицам</small>
```

**aria-describedby** связывает поле с дополнительным описанием (подсказкой).

**aria-required, aria-invalid:**

```html
<label for="password">Пароль</label>
<input
  id="password"
  type="password"
  aria-required="true"
  aria-invalid="false"
/>
<span role="alert" id="passwordError"></span>
```

При ошибке:

```js
input.setAttribute('aria-invalid', 'true')
document.getElementById('passwordError').textContent = 'Пароль слишком короткий'
```

### Альтернативный текст для изображений

**Информативные изображения:**

```html
<img src="chart.png" alt="График продаж за 2024 год показывает рост на 30%" />
```

**Декоративные изображения (не несут смысла):**

```html
<img src="divider.png" alt="" />
```

Пустой `alt=""` сигнализирует screen reader'у, что изображение декоративное и его можно пропустить.

**Изображения-ссылки:**

```html
<a href="/home">
  <img src="logo.png" alt="Логотип компании, вернуться на главную" />
</a>
```

### Клавиатурная навигация

Все интерактивные элементы должны быть доступны с клавиатуры:

- **Tab:** Переход между элементами.
- **Shift+Tab:** Переход назад.
- **Enter/Space:** Активация кнопки/ссылки.
- **Esc:** Закрытие модального окна.
- **Arrow keys:** Навигация в меню, слайдерах.

**Проблема: кастомные элементы без tabindex**

```html
<div onclick="open()">Открыть</div>
```

Недоступно с клавиатуры.

**Решение: используйте `<button>` или добавьте `tabindex="0"` и обработчики клавиш**

```html
<div role="button" tabindex="0" onclick="open()" onkeydown="handleKeyDown(event)">
  Открыть
</div>
```

```js
function handleKeyDown(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    open()
  }
}
```

**Но лучше просто:**

```html
<button onclick="open()">Открыть</button>
```

### Стили фокуса — не убирайте их!

Многие разработчики удаляют outline у кнопок/ссылок ради "красоты":

```css
/* ПЛОХО! */
button:focus {
  outline: none;
}
```

Это катастрофа для пользователей, использующих клавиатуру — они не видят, где находится фокус.

**Решение: сделайте кастомный, но заметный фокус:**

```css
button:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Или используйте :focus-visible (фокус только с клавиатуры) */
button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### ARIA (Accessible Rich Internet Applications)

ARIA — это набор атрибутов для улучшения доступности сложных интерфейсов (модальные окна, вкладки, аккордеоны).

**Правило №1 ARIA:** Не используйте ARIA, если есть семантический HTML-тег!

**Плохо:**

```html
<div role="button">Кнопка</div>
```

**Хорошо:**

```html
<button>Кнопка</button>
```

**Когда нужна ARIA:**

- Динамический контент (области с обновлениями).
- Кастомные виджеты (слайдеры, дейтпикеры).
- Модальные окна, вкладки, аккордеоны.

**Основные ARIA-атрибуты:**

- **role:** Определяет роль элемента (`button`, `dialog`, `tab`, `tabpanel`, `alert`).
- **aria-label:** Текстовая метка для элемента без видимого текста.
- **aria-labelledby:** Связывает элемент с его меткой (по ID).
- **aria-describedby:** Связывает элемент с описанием.
- **aria-hidden:** Скрывает элемент от screen reader'ов.
- **aria-live:** Объявляет об изменении контента (`polite`, `assertive`).
- **aria-expanded:** Состояние раскрытия (для аккордеонов, дропдаунов).
- **aria-disabled / aria-required / aria-invalid:** Состояние полей форм.

**Пример: модальное окно**

```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-desc"
>
  <h2 id="dialog-title">Удалить задачу?</h2>
  <p id="dialog-desc">Это действие нельзя отменить</p>
  <button>Удалить</button>
  <button>Отмена</button>
</div>
```

**Пример: живая область (уведомление)**

```html
<div role="status" aria-live="polite" id="notification"></div>
```

```js
document.getElementById('notification').textContent = 'Задача добавлена'
```

Screen reader автоматически объявит изменение.

### Контрастность цветов

WCAG требует минимальный контраст между текстом и фоном:

- **AA уровень:**
  - Обычный текст: 4.5:1
  - Крупный текст (18px+ или 14px+ жирный): 3:1

- **AAA уровень:**
  - Обычный текст: 7:1
  - Крупный текст: 4.5:1

**Инструменты проверки:**

- **WebAIM Contrast Checker:** <https://webaim.org/resources/contrastchecker/>
- **Chrome DevTools:** Проверка контраста в панели Elements → Accessibility.

**Плохо:**

```css
.text { color: #ccc; background: #fff; } /* Контраст: 1.6:1 — недостаточно */
```

**Хорошо:**

```css
.text { color: #333; background: #fff; } /* Контраст: 12.6:1 — AAA */
```

### Масштабирование текста

Пользователи должны иметь возможность увеличить текст до 200% без потери функциональности.

**Плохо:**

```css
body { font-size: 14px; } /* Фиксированные пиксели */
```

**Хорошо:**

```css
body { font-size: 1rem; } /* Относительные единицы — пользователь может изменить базовый размер в браузере */
```

---

## 4) Core Web Vitals — производительность как часть UX

Производительность — это не просто "скорость загрузки", а восприятие пользователем: насколько быстро он может начать взаимодействие с сайтом, насколько стабилен интерфейс, насколько быстро сайт реагирует на действия.

Google определил **Core Web Vitals** — три ключевые метрики производительности UX:

1. **LCP (Largest Contentful Paint)** — скорость загрузки основного контента.
2. **CLS (Cumulative Layout Shift)** — стабильность визуальной структуры.
3. **INP (Interaction to Next Paint)** — отзывчивость на взаимодействия.

Эти метрики влияют на ранжирование в Google (Core Web Vitals являются фактором ранжирования).

### LCP — Largest Contentful Paint (Загрузка основного контента)

**Что измеряет:** Время до отображения самого крупного видимого элемента в viewport (изображение, видео, крупный блок текста).

**Хорошие значения:**

- ✅ **Хорошо:** < 2.5 секунды
- ⚠️ **Требует улучшения:** 2.5 - 4 секунды
- ❌ **Плохо:** > 4 секунды

**Почему важно:** Пользователь воспринимает страницу загруженной, когда видит основной контент.

**Что влияет на LCP:**

- Медленный сервер (TTFB — Time to First Byte).
- Блокирующие ресурсы (CSS, JS).
- Тяжёлые изображения без оптимизации.
- Медленные шрифты.

**Как улучшить LCP:**

#### 1. Оптимизация изображений

**Проблема:** Огромные изображения (5MB, 4000x3000px) грузятся долго.

**Решения:**

- **Правильный формат:** WebP/AVIF вместо JPEG/PNG (на 30-50% меньше).
- **Responsive images:** Разные размеры для разных экранов.

```html
<img
  src="hero-800.webp"
  srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Hero image"
  loading="lazy"
/>
```

- **Сжатие:** Используйте инструменты (Squoosh, ImageOptim, TinyPNG).
- **Lazy loading:** Загружайте изображения за пределами viewport только при скролле.

```html
<img src="image.jpg" alt="Описание" loading="lazy" />
```

#### 2. Предзагрузка критичных ресурсов

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preload" href="/fonts/Inter.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/hero.webp" as="image" />
```

#### 3. Минимизация блокирующего CSS/JS

**Плохо:**

```html
<head>
  <link rel="stylesheet" href="styles.css" /> <!-- Блокирует рендеринг -->
  <script src="app.js"></script> <!-- Блокирует парсинг -->
</head>
```

**Хорошо:**

```html
<head>
  <!-- Критичный CSS inline -->
  <style>/* критичные стили для первого экрана */</style>

  <!-- Остальной CSS асинхронно -->
  <link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />

  <!-- JS с defer/async -->
  <script src="app.js" defer></script>
</head>
```

#### 4. CDN и кэширование

Используйте CDN для статических ресурсов, настройте долгое кэширование.

```nginx
# nginx пример
location ~* \.(jpg|jpeg|png|gif|webp|svg|woff2)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

### CLS — Cumulative Layout Shift (Стабильность макета)

**Что измеряет:** Насколько сильно элементы "прыгают" во время загрузки.

**Хорошие значения:**

- ✅ **Хорошо:** < 0.1
- ⚠️ **Требует улучшения:** 0.1 - 0.25
- ❌ **Плохо:** > 0.25

**Типичная проблема:**

Вы начинаете читать статью, вдруг сверху загружается баннер → всё содержимое смещается вниз. Вы пытаетесь кликнуть на кнопку, но в последний момент элемент сдвигается и вы кликаете на рекламу.

**Причины CLS:**

- Изображения без указания размеров (width/height).
- Динамически вставляемый контент (баннеры, уведомления) без резервирования места.
- Веб-шрифты, заменяющие системные (FOIT/FOUT).
- Iframe без размеров.

**Как улучшить CLS:**

#### 1. Указывайте размеры изображений

**Плохо:**

```html
<img src="photo.jpg" alt="Фото" />
```

Браузер не знает размер → резервирует 0px → после загрузки изображение "вытолкнет" контент вниз.

**Хорошо:**

```html
<img src="photo.jpg" alt="Фото" width="800" height="600" />
```

Или CSS:

```css
img {
  aspect-ratio: 16 / 9;
  width: 100%;
  height: auto;
}
```

#### 2. Резервируйте место для динамического контента

**Плохо:**

```jsx
{showBanner && <Banner />}
```

Баннер появляется → контент сдвигается.

**Хорошо:**

```jsx
<div style={{ minHeight: showBanner ? '80px' : '0' }}>
  {showBanner && <Banner />}
</div>
```

#### 3. Оптимизация шрифтов

**Проблема:** Шрифт загружается → текст меняет размер (FOUT — Flash of Unstyled Text).

**Решение: `font-display: swap` и `size-adjust`**

```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap; /* Показать системный шрифт, потом заменить */
  size-adjust: 105%; /* Подстроить размер, чтобы меньше "прыгало" */
}
```

**Или используйте системные шрифты:**

```css
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
```

### INP — Interaction to Next Paint (Отзывчивость на взаимодействия)

**Что измеряет:** Время от взаимодействия пользователя (клик, тап, ввод) до визуального ответа.

**Хорошие значения:**

- ✅ **Хорошо:** < 200 мс
- ⚠️ **Требует улучшения:** 200 - 500 мс
- ❌ **Плохо:** > 500 мс

**Типичная проблема:**

Вы кликаете на кнопку → ничего не происходит 2 секунды → вы кликаете снова → вдруг всё сработало дважды.

**Причины плохого INP:**

- Долгие синхронные задачи в JS (блокируют main thread).
- Тяжёлые вычисления при рендере (сложные списки без виртуализации).
- Неоптимизированные обработчики событий.

**Как улучшить INP:**

#### 1. Разбивайте длинные задачи

Если задача выполняется > 50 мс, браузер не может обработать пользовательский ввод.

**Плохо:**

```js
function processLargeData(data) {
  for (let item of data) {
    // Обрабатываем 10,000 элементов синхронно
    processItem(item)
  }
}
```

**Хорошо: используйте `requestIdleCallback` или батчинг**

```js
function processLargeDataInChunks(data, chunkSize = 100) {
  let index = 0

  function processChunk() {
    const end = Math.min(index + chunkSize, data.length)
    for (let i = index; i < end; i++) {
      processItem(data[i])
    }
    index = end

    if (index < data.length) {
      requestIdleCallback(processChunk)
    }
  }

  requestIdleCallback(processChunk)
}
```

#### 2. Используйте Web Workers для тяжёлых вычислений

**Проблема:** Парсинг большого JSON блокирует UI.

**Решение:**

```js
// worker.js
self.onmessage = (e) => {
  const data = JSON.parse(e.data)
  const result = processData(data)
  self.postMessage(result)
}

// main.js
const worker = new Worker('worker.js')
worker.postMessage(largeJSON)
worker.onmessage = (e) => {
  console.log('Результат:', e.data)
}
```

#### 3. Виртуализация списков

Если у вас список из 10,000 элементов, не рендерите их все сразу.

**Используйте библиотеки:**

- **react-virtual:** <https://github.com/TanStack/virtual>
- **react-window:** <https://github.com/bvaughn/react-window>

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualList({ items }: { items: string[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
  })

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index]}
          </div>
        ))}
      </div>
    </div>
  )
}
```

#### 4. Debounce и Throttle для частых событий

**Проблема:** Обработчик `onScroll` вызывается сотни раз в секунду.

**Решение:**

```ts
import { debounce } from 'lodash-es'

const handleSearch = debounce((query: string) => {
  fetchResults(query)
}, 300)

<input onChange={(e) => handleSearch(e.target.value)} />
```

### Восприятие скорости — психология производительности

Даже если реальная скорость не идеальна, можно улучшить **восприятие** скорости:

#### 1. Skeleton screens (скелетоны)

Вместо пустого экрана или спиннера показывайте "скелет" интерфейса.

```tsx
function ProductCard({ loading, product }) {
  if (loading) {
    return (
      <div className="card skeleton">
        <div className="skeleton-image" />
        <div className="skeleton-text" />
        <div className="skeleton-text short" />
      </div>
    )
  }

  return (
    <div className="card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.price}</p>
    </div>
  )
}
```

#### 2. Оптимистичные обновления (Optimistic UI)

Обновляйте UI сразу, не дожидаясь ответа сервера.

```tsx
function TodoList() {
  const [todos, setTodos] = useState([])

  const addTodo = async (text: string) => {
    const tempId = Date.now()
    const newTodo = { id: tempId, text, completed: false }

    // Оптимистично добавляем в UI
    setTodos([...todos, newTodo])

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify({ text }),
      })
      const savedTodo = await response.json()

      // Заменяем временный ID на реальный
      setTodos(todos.map(t => t.id === tempId ? savedTodo : t))
    } catch (error) {
      // Откатываем при ошибке
      setTodos(todos.filter(t => t.id !== tempId))
      alert('Ошибка сохранения')
    }
  }

  // ...
}
```

#### 3. Прогресс-индикаторы

Если загрузка занимает время, покажите прогресс.

```tsx
<ProgressBar value={uploadProgress} max={100} />
<p>Загружено {uploadProgress}%</p>
```

---

## 5) Инструменты для измерения и улучшения производительности и доступности

### Lighthouse — комплексная проверка качества

**Что это:** Встроенный в Chrome DevTools инструмент (также доступен как CLI и CI-интеграция).

**Что проверяет:**

- **Performance:** LCP, CLS, INP, FCP, TTI, Speed Index
- **Accessibility:** Контрасты, семантика, ARIA, alt-текст
- **Best Practices:** HTTPS, консольные ошибки, устаревшие API
- **SEO:** meta-теги, структура заголовков, robots.txt
- **PWA:** Service Worker, manifest, offline работа

**Как использовать:**

1. Откройте Chrome DevTools (F12).
2. Перейдите на вкладку **Lighthouse**.
3. Выберите категории (Performance, Accessibility).
4. Выберите устройство (Mobile / Desktop).
5. Нажмите **Analyze page load**.

Lighthouse сгенерирует отчёт с оценками (0-100) и рекомендациями по улучшению.

**Пример рекомендаций:**

- ⚠️ "Image elements do not have explicit width and height" → CLS
- ⚠️ "Links do not have a discernible name" → Accessibility
- ⚠️ "Does not use passive listeners to improve scrolling performance" → Performance

**CLI использование:**

```powershell
npm i -g lighthouse
lighthouse https://example.com --view
```

**CI интеграция (GitHub Actions):**

```yaml
- name: Run Lighthouse CI
  uses: treosh/lighthouse-ci-action@v9
  with:
    urls: |
      https://example.com
    uploadArtifacts: true
```

### Axe DevTools — автоматизированная проверка доступности

**Что это:** Расширение для Chrome/Firefox, проверяющее страницу на соответствие WCAG.

**Установка:** <https://www.deque.com/axe/devtools/>

**Как использовать:**

1. Установите расширение.
2. Откройте DevTools → вкладка **Axe DevTools**.
3. Нажмите **Scan**.

Axe найдёт проблемы с доступностью и предложит решения:

- Отсутствие `alt` у изображений.
- Низкий контраст текста.
- Кнопки без доступного имени.
- Неправильное использование ARIA.

**Интеграция в тесты:**

```ts
// jest + @axe-core/react
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

test('no a11y violations', async () => {
  const { container } = render(<App />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### Chrome DevTools Performance

**Что это:** Профайлер для анализа производительности во время взаимодействия с сайтом.

**Как использовать:**

1. DevTools → **Performance** (или Ctrl+Shift+E).
2. Нажмите **Record** (или Ctrl+E).
3. Взаимодействуйте со страницей (скролл, клики).
4. Остановите запись.

**Что смотреть:**

- **Long Tasks:** Задачи длиной > 50 мс (красные блоки) → оптимизировать.
- **Layout Shifts:** Визуальные сдвиги (синие полосы в Experience секции).
- **Main Thread:** Загруженность главного потока (scripting, rendering, painting).
- **Network Waterfall:** Последовательность загрузки ресурсов.

**Совет:** Используйте CPU throttling (6x slowdown) для симуляции медленных устройств.

### Web Vitals Extension

**Что это:** Расширение Chrome, показывающее Core Web Vitals в реальном времени.

**Установка:** <https://chrome.google.com/webstore> → "Web Vitals"

**Функции:**

- Overlay с LCP/CLS/INP на странице.
- Логирование в консоль.
- История метрик при навигации.

### WebPageTest — детальный анализ производительности

**Что это:** Онлайн-сервис для тестирования с разных локаций, устройств, сетевых условий.

**URL:** <https://www.webpagetest.org/>

**Возможности:**

- Тестирование с разных серверов (USA, Europe, Asia).
- Эмуляция 3G/4G.
- Filmstrip view (покадровая загрузка страницы).
- Waterfall график с детализацией каждого ресурса.
- Сравнение до/после оптимизации.

---

## 6) Мини-проект: «A11y + Core Web Vitals улучшения»

Цель: Взять учебный проект (Todo, блог, магазин) и провести полный аудит доступности и производительности, затем исправить проблемы.

### Этап 1: Baseline (Измерение текущего состояния)

1. **Запустите Lighthouse** (Mobile + Desktop):
   - Зафиксируйте оценки Performance, Accessibility, Best Practices.
   - Сохраните JSON-отчёт (`lighthouse --output=json`).

2. **Запустите Axe DevTools:**
   - Зафиксируйте количество проблем доступности (Critical/Serious/Moderate).

3. **Проверьте вручную:**
   - Попробуйте использовать сайт только с клавиатуры (Tab, Enter, Esc).
   - Включите screen reader (NVDA на Windows, VoiceOver на Mac) и попробуйте навигацию.

### Этап 2: Исправление доступности (a11y)

**Чек-лист:**

- [ ] Все изображения имеют `alt` (или `alt=""` для декоративных).
- [ ] Все формы имеют `<label>` связанные с `<input>`.
- [ ] Все интерактивные элементы доступны с клавиатуры (Tab).
- [ ] Видимые стили фокуса для всех интерактивных элементов.
- [ ] Контраст текста соответствует WCAG AA (4.5:1 для обычного текста).
- [ ] Семантические теги (`<button>`, `<nav>`, `<main>`, `<header>`, `<footer>`).
- [ ] Иерархия заголовков (`<h1>` → `<h2>` → `<h3>`, без пропусков).
- [ ] Модальные окна имеют `role="dialog"`, `aria-modal="true"`, trap focus.
- [ ] Динамический контент анонсируется (`aria-live` для уведомлений).

**Пример исправлений:**

```tsx
// Было
<div onClick={handleClick}>Кликни меня</div>

// Стало
<button onClick={handleClick}>Кликни меня</button>
```

```tsx
// Было
<input type="text" placeholder="Email" />

// Стало
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

```css
/* Было */
button:focus { outline: none; }

/* Стало */
button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Этап 3: Исправление производительности

**LCP оптимизация:**

- [ ] Оптимизируйте изображения (WebP, сжатие, responsive images).
- [ ] Добавьте `width` и `height` для изображений.
- [ ] Предзагрузите критичные ресурсы (`<link rel="preload">`).
- [ ] Используйте CDN для статики.
- [ ] Минифицируйте CSS/JS.

**CLS стабилизация:**

- [ ] Указывайте размеры для всех медиа (`width`, `height`, `aspect-ratio`).
- [ ] Резервируйте место для динамического контента.
- [ ] Оптимизируйте загрузку шрифтов (`font-display: swap`).

**INP улучшение:**

- [ ] Разбейте длинные задачи (> 50 мс) на части.
- [ ] Используйте виртуализацию для длинных списков.
- [ ] Debounce/throttle для частых событий (scroll, input).
- [ ] Переместите тяжёлые вычисления в Web Workers.

**Пример оптимизации изображений:**

```html
<!-- Было -->
<img src="hero.jpg" alt="Hero" />

<!-- Стало -->
<img
  src="hero-800.webp"
  srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Hero image"
  width="1200"
  height="600"
  loading="lazy"
/>
```

**Пример предзагрузки шрифтов:**

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preload" href="/fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossorigin />
```

### Этап 4: Повторное измерение

1. **Запустите Lighthouse снова** и сравните оценки.
2. **Запустите Axe** и убедитесь, что проблем стало меньше (или 0).
3. **Зафиксируйте результаты** в таблице:

| Метрика | До | После | Улучшение |
|---------|-------|--------|-----------|
| Performance Score | 65 | 92 | +27 |
| Accessibility Score | 78 | 100 | +22 |
| LCP | 3.8s | 1.9s | -1.9s |
| CLS | 0.25 | 0.05 | -0.20 |
| INP | 450ms | 180ms | -270ms |
| Axe Violations | 12 | 0 | -12 |

### Этап 5: Документация

Создайте краткий отчёт:

```markdown
# A11y + Performance Improvements

## Baseline
- Lighthouse Performance: 65/100
- Lighthouse Accessibility: 78/100
- LCP: 3.8s, CLS: 0.25, INP: 450ms
- Axe Violations: 12 (5 critical, 7 serious)

## Changes Made

### Accessibility
- Добавлены `alt` для всех изображений
- Все формы теперь имеют `<label>`
- Исправлены контрасты (все теперь > 4.5:1)
- Добавлены стили фокуса для кнопок и ссылок
- Модальное окно теперь с `role="dialog"` и trap focus

### Performance
- Конвертированы изображения в WebP (-60% размера)
- Добавлены `width`/`height` для изображений (CLS улучшение)
- Предзагрузка шрифтов через `<link rel="preload">`
- Виртуализация списка товаров (было 500 элементов в DOM, стало ~20)

## Results
- Lighthouse Performance: 92/100 (+27)
- Lighthouse Accessibility: 100/100 (+22)
- LCP: 1.9s (-1.9s), CLS: 0.05 (-0.20), INP: 180ms (-270ms)
- Axe Violations: 0 (-12)
```

---

## Как настроить окружение для проверки (Windows)

### Шаг 1: Установка расширений Chrome

```powershell
# Откройте Chrome Web Store и установите:
# 1. Axe DevTools - https://chrome.google.com/webstore (поиск "axe devtools")
# 2. Web Vitals - https://chrome.google.com/webstore (поиск "web vitals")
# 3. Lighthouse уже встроен в Chrome DevTools
```

### Шаг 2: Установка Lighthouse CLI (опционально)

```powershell
npm i -g lighthouse
lighthouse https://example.com --view --output=html
```

### Шаг 3: Установка библиотек для автоматизации

```powershell
# Для тестов доступности
npm i -D jest-axe @axe-core/react

# Для измерения Web Vitals в коде
npm i web-vitals
```

**Использование web-vitals:**

```tsx
// src/reportWebVitals.ts
import { onCLS, onINP, onLCP } from 'web-vitals'

function sendToAnalytics(metric) {
  console.log(metric)
  // Отправьте в Google Analytics или другую систему
}

onCLS(sendToAnalytics)
onLCP(sendToAnalytics)
onINP(sendToAnalytics)

// В main.tsx / index.tsx
import { reportWebVitals } from './reportWebVitals'
reportWebVitals()
```

### Шаг 4: Запуск проекта и проверка

```powershell
# Запустите dev-сервер
npm run dev

# Откройте http://localhost:5173 в Chrome
# DevTools → Lighthouse → Analyze page load
```

---

## Дополнительные ресурсы и чек-листы

### A11y чек-лист (краткий)

✅ **Структура и семантика**
- [ ] Используются семантические теги (`<button>`, `<nav>`, `<main>`, `<header>`, `<footer>`)
- [ ] Иерархия заголовков логична (`<h1>` → `<h2>` → `<h3>`)
- [ ] Формы имеют связанные `<label>`
- [ ] Все изображения имеют `alt` (или `alt=""` для декоративных)

✅ **Клавиатурная навигация**
- [ ] Все интерактивные элементы доступны через Tab
- [ ] Видимые стили фокуса (`:focus-visible`)
- [ ] Логичный порядок табуляции (`tabindex` не нарушает flow)
- [ ] Модальные окна trap focus (Esc закрывает)

✅ **ARIA**
- [ ] ARIA используется только там, где нет семантического HTML
- [ ] `role`, `aria-label`, `aria-labelledby` правильно применены
- [ ] Динамический контент анонсируется (`aria-live`)
- [ ] `aria-invalid`, `aria-required` для валидации форм

✅ **Визуал**
- [ ] Контраст текста ≥ 4.5:1 (WCAG AA)
- [ ] Кнопки/ссылки минимум 44x44px (touch targets)
- [ ] Текст масштабируется до 200% без потери функциональности
- [ ] Не только цветом передаётся информация (ошибки, статусы)

### Performance чек-лист

✅ **LCP**
- [ ] Изображения оптимизированы (WebP/AVIF, сжатие)
- [ ] Responsive images (`srcset`, `sizes`)
- [ ] Критичные ресурсы предзагружены (`<link rel="preload">`)
- [ ] CDN для статики
- [ ] Минификация CSS/JS

✅ **CLS**
- [ ] Размеры (`width`, `height`) для всех медиа
- [ ] Резервирование места для динамического контента
- [ ] `font-display: swap` для шрифтов
- [ ] Нет вставок контента после загрузки (баннеры, реклама)

✅ **INP**
- [ ] Нет long tasks (> 50 мс) в Performance профайлере
- [ ] Виртуализация для длинных списков
- [ ] Debounce/throttle для частых событий
- [ ] Web Workers для тяжёлых вычислений
- [ ] `requestIdleCallback` для неприоритетных задач

---

## Вопросы для самопроверки

1. **Назовите четыре основных принципа UX-дизайна.**
   - Визуальная иерархия, консистентность, обратная связь, ошибкоустойчивость.

2. **Что такое дизайн-токены и зачем они нужны?**
   - Переменные для цветов, отступов, шрифтов и т.д. Обеспечивают консистентность, упрощают тематизацию и изменения.

3. **Какие три метрики входят в Core Web Vitals?**
   - **LCP** (Largest Contentful Paint) — скорость загрузки основного контента.
   - **CLS** (Cumulative Layout Shift) — стабильность макета.
   - **INP** (Interaction to Next Paint) — отзывчивость на взаимодействия.

4. **Как улучшить LCP?**
   - Оптимизировать изображения (WebP, сжатие, responsive), предзагрузить критичные ресурсы, использовать CDN, минифицировать CSS/JS.

5. **Что такое WCAG и какие уровни соответствия существуют?**
   - Web Content Accessibility Guidelines — стандарт доступности. Уровни: A (базовый), AA (рекомендуемый), AAA (высший).

6. **Почему важна семантическая HTML для доступности?**
   - Screen reader'ы используют семантику для понимания структуры и назначения элементов. `<button>` понятен, `<div onclick>` — нет.

7. **Что такое aria-live и когда его использовать?**
   - Атрибут для анонсирования динамических изменений (уведомления, статусы). Screen reader автоматически объявит изменение. Используйте для важных обновлений (ошибки, успешные действия).

8. **Как проверить контрастность цветов?**
   - WebAIM Contrast Checker, Chrome DevTools (Elements → Styles → цвет → контрастность), Axe DevTools.

9. **Что такое CLS и как его минимизировать?**
   - Cumulative Layout Shift — метрика сдвигов макета. Минимизировать: указывать размеры медиа, резервировать место для динамического контента, оптимизировать шрифты.

10. **Зачем нужна виртуализация списков?**
    - Рендерить только видимые элементы, а не все 10,000. Улучшает INP и общую производительность.

---

## Дополнительное чтение

- **W3C WCAG 2.1:** <https://www.w3.org/WAI/WCAG21/quickref/> — полный справочник требований.
- **MDN Accessibility:** <https://developer.mozilla.org/ru/docs/Web/Accessibility> — руководства на русском.
- **Web.dev:** <https://web.dev/learn/> — курсы по Performance, Accessibility, PWA.
- **A11y Project:** <https://www.a11yproject.com/> — ресурсы и чек-листы по доступности.
- **Material Design Guidelines:** <https://m3.material.io/> — пример полноценной дизайн-системы.
- **Inclusive Components:** <https://inclusive-components.design/> — примеры доступных компонентов.

---

## Резюме

- **UX-принципы** (иерархия, консистентность, обратная связь, ошибкоустойчивость) — фундамент хорошего интерфейса.
- **Дизайн-системы** обеспечивают консистентность через токены, компоненты и гайдлайны.
- **Доступность (a11y)** — это не "дополнительная фича", а обязательное требование для качественного продукта. Используйте семантический HTML, ARIA только при необходимости, проверяйте контрасты и клавиатурную навигацию.
- **Core Web Vitals** (LCP, CLS, INP) измеряют реальный пользовательский опыт. Оптимизируйте изображения, стабилизируйте макет, разбивайте длинные задачи.
- **Инструменты** (Lighthouse, Axe, DevTools Performance) помогают автоматизировать проверку и найти проблемы до релиза.

**Практический совет:** Включите Lighthouse и Axe в CI/CD пайплайн — это предотвратит регрессию производительности и доступности. Делайте аудиты регулярно, а не только перед релизом.
