# Лекция 04-05. CSS: история, основы, селекторы, каскад, блочная модель, Flexbox, Grid, адаптивность

## План

1. История и эволюция CSS
2. Что такое CSS и как подключать
3. Каскад, наследование, специфичность
4. Селекторы (базовые, атрибутов, псевдоклассы, псевдоэлементы)
5. Единицы измерения и цвета
6. Блочная модель (content, padding, border, margin, box-sizing)
7. Display и поток документа
8. Позиционирование (static, relative, absolute, fixed, sticky, z-index)
9. Flexbox: одномерные макеты
10. Grid: двухмерные сетки
11. Адаптивность: media queries, responsive принципы
12. Препроцессоры (Sass кратко) и переменные CSS
13. Частые казусы из практики и история ошибок
14. Практика и задания (многоуровневые)

**Практика (общее):** сверстать адаптивный макет страницы (шапка, навигация, контент 2 колонки, подвал) с использованием семантических тегов HTML5 + Flex/Grid + адаптив.

**Чтение:**

- MDN: CSS Basics, Cascade and Inheritance, Flexbox, Grid, Box Model
- css-tricks.com (Flexbox Guide, Grid Guide)
- caniuse.com (совместимость фич)

---

## 1. История и эволюция CSS

CSS (Cascading Style Sheets) впервые предложен Хоконом Виум Ли (Håkon Wium Lie) в 1994. Цель — отделить структуру (HTML) от представления.  
Если HTML — это скелет + текст вашего документа, то CSS — это одежда, макияж, освещение сцены и иногда легкие спецэффекты. Без CSS страница выглядит как ученическая тетрадь. С CSS — как лендинг, который пытается продать вам что угодно (иногда слишком настойчиво).

Ключевые вехи:

- **CSS1 (1996)**: "Здравствуйте, я умею красить и расставлять отступы".
- **CSS2 (1998)**: "Добавим позиционирование и немного слоёности".
- **Эра табличной верстки**: разработчики: *"Мы сделаем макет с 12 колонками... через `<table>`"*. Браузеры: *"Ну ладно"*.
- **CSS2.1**: уборка после вечеринки: исправление двусмысленностей.
- **CSS3 (модули)**: вместо огромного монолита — набор независимых блоков. Можно развивать Grid, не трогая Selectors.
- **Современность**: переменные, Grid, анимации, контейнерные запросы. CSS стал более декларативным и мощным, иногда даже пугающе.

### Забавный взгляд на эволюцию

- Раньше: "Сделай кнопку зелёной" → 5 строк.
- Теперь: "Сделай кнопку тёмной, но не слишком, адаптивной, с плавным переходом, доступной для screen reader, учитывающей prefers-reduced-motion" → 50 строк + переменные.

### Казусы / эволюционные уроки 

- Табличная верстка → сложная поддержка → переход к блокам + CSS layout.
- IE box model bug (до стандартизации): ширина считалась иначе → появился `box-sizing`.
- Float-based layout: костыль до появления Flexbox/Grid.
- Vendor prefixes: `-webkit-`, `-moz-`, `-ms-` → временное решение, потом стандартизация.

> Аналогия: развитие CSS — как замена самодельных полок в гараже на модульную систему хранения: сначала все держится на честном слове и скотче, потом вы вводите стандарты и порядок.

### Мини-таблица: почему новые технологии пришли

| Проблема | Временное решение | Современный инструмент |
| -------- | ----------------- | ---------------------- |
| Горизонтальное меню | floats | Flexbox |
| Сложная сетка | nested floats / tables | CSS Grid |
| Повторяющиеся значения | дублирование | CSS переменные / Sass |
| Адаптивность | отдельные m. сайты | Media queries / fluid units |

---

## 2. Что такое CSS и как подключать

Способы подключения:

1. Внешний файл: `<link rel="stylesheet" href="styles.css">` (рекомендуется).
2. Встроенный блок: `<style>h1 {color:red;}</style>`.
3. Инлайново: `<h1 style="color:red">` (избегать для структуры).

Пример структуры:

```html
<head>
  <meta charset="UTF-8">
  <title>CSS пример</title>
  <link rel="stylesheet" href="styles.css">
</head>
```

---

## 3. Каскад, наследование, специфичность

Каскад = кто победит:

1. Важность (user-agent < пользовательские стили < авторские < !important)
2. Специфичность (inline > #id > .class > тег)
3. Порядок объявления (последний выигрывает)

Пример специфичности:

```css
p { color: black; }      /* 0-0-0-1 */
.highlight { color: blue; } /* 0-0-1-0 */
#intro { color: green; }    /* 0-1-0-0 */
```

Если элемент `<p id="intro" class="highlight">`, цвет будет зелёным.

Наследуются: `font-family`, `color`, `line-height`. Не наследуются: `margin`, `padding`, `border`.

---

## 4. Селекторы

Селектор — это часть CSS‑правила, которая «находит» элементы в дереве документа, к которым применяются стили.

Анатомия правила:
```css
/* селектор */      /* декларации */
.card > h3 + p {     margin-top: 0; color: #333; }
```

Ключевые идеи:
- Селекторы описывают, какие элементы выбрать; декларации описывают, как их оформить.
- Комбинаторы задают связи между элементами:
  - Пробел — потомок: `nav a`
  - `>` — прямой ребёнок: `ul > li`
  - `+` — сосед сразу после: `h1 + p`
  - `~` — любые следующие братья: `h1 ~ p`
- Группировка позволяет применить одни стили к разным селекторам: `.btn, .link { color: var(--accent); }`
- Универсальный селектор выбирает всё: `* { box-sizing: border-box; }`

Селекторы атрибутов (гибко находят по значениям):
```css
/* точное совпадение */
input[type="email"] {}

/* начинается с */
a[href^="https://"] {}

/* заканчивается на */
a[href$=".pdf"] {}

/* содержит подстроку */
img[alt*="лого"] {}

/* регистронезависимо (флаг i) */
[data-state="open" i] {}
```

Псевдоклассы — состояния и положение в дереве:
```css
/* интерактивные состояния */
a:hover {}
button:focus-visible {}
input:disabled {}
input:required:invalid { border-color: #e00; }

/* структурные */
li:nth-child(odd) {}
li:nth-of-type(2n) {}
p:first-of-type {}
p:last-child {}

/* логические */
.item:not(.active) {}
:is(article, section) h2 { margin-top: 0; }
/* :where как :is, но без специфичности */
.where-demo :where(h1, h2) { color: #444; }

/* родительский (совр. браузеры) */
.card:has(img) { padding-top: 0; }
```

Псевдоэлементы — «виртуальные» части:
```css
.title::first-line { text-transform: uppercase; }
.note::before { content: "ℹ "; color: #0a74d9; }
.list li::marker { color: #888; }
input::placeholder { color: #999; }
::selection { background: #fffb91; }
```
Замечание: для `::before/::after` обычно нужен `content`, даже пустой: `content: ""`.

Практические шаблоны:
```css
/* Удобный клик по label */
label:has(input[type="checkbox"]) { cursor: pointer; }

/* Внешние ссылки с индикатором */
a[href^="http"]:not([href*="example.com"])::after { content: " ↗"; font-size: .9em; }

/* Зебра-таблица */
tbody tr:nth-child(even) { background: #f7f7f7; }
```

Специфичность и поддерживаемость (см. раздел 3):
- Предпочитайте классы; избегайте избыточных цепочек и id.
- Используйте `:is()`/`:where()` для упрощения длинных селекторов.
- Старайтесь, чтобы селектор отражал смысл (структуру/состояние), а не «случайную» вложенность.

Ниже в файле — краткий справочник по видам селекторов и примеры.

- По тегу: `div`, `p`
- По классу: `.card`
- По id: `#main`
- Комбинированные: `article p`, `ul > li`, `h1 + p`, `h1 ~ p`
- Атрибутов: `input[type="email"]`, `a[target="_blank"]`
- Псевдоклассы: `a:hover`, `:focus`, `:nth-child(2)`, `:first-of-type`
- Псевдоэлементы: `::before`, `::after`, `::first-line`

Пример псевдоэлемента:

```css
.button::after { content: ' →'; }
```

---

## 5. Единицы измерения и цвета

Единицы:

- Абсолютные: `px`
- Относительные: `%`, `em`, `rem`, `vw`, `vh`, `fr` (в Grid)
- Новое: `lvh`, `svh`, `dvh` (динамическая высота в мобильных)

Цвета: `#333`, `rgba(0,0,0,.5)`, `hsl(200 50% 40%)`, `currentColor`, `transparent`.

Совет: базовый размер шрифта задавайте на `html { font-size: 16px; }`, масштабируйте через `rem`.

---

## 6. Блочная модель (Box Model)

Элемент: content → padding → border → margin.  
Схема: см. статью MDN [The box model](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model)

Пример:

```css
.box {
  width: 300px;
  padding: 20px;
  border: 2px solid #444;
  margin: 10px;
  background: #fafafa;
}
```

Проблема старой ширины: если добавить padding + border — фактическая ширина растёт. Решение:

```css
* { box-sizing: border-box; }
```

---

## 7. Display и поток документа

Типы:

- `block` (занимает всю ширину, переносится с новой строки)
- `inline` (только содержимое, нельзя задать width/height)
- `inline-block` (как inline, но можно размеры)
- `none` (исключает из потока)
- `flex`, `grid`, `contents`, `list-item`

Пример наглядности:

```css
.inline-demo span { display: inline-block; width: 60px; border: 1px solid #ccc; }
```

---

## 8. Позиционирование

- `static` — по умолчанию.
- `relative` — смещение без выхода из потока.
- `absolute` — позиционируется относительно ближайшего позиционированного родителя.
- `fixed` — относительно окна браузера.
- `sticky` — комбинирует relative + фиксирование при прокрутке.

Пример:

```css
.parent { position: relative; }
.badge { position: absolute; top: 0; right: 0; }
```

`z-index`: работает только для позиционированных элементов (кроме static).

---

## 9. Flexbox

Контейнер: `display: flex;`  
Основные свойства контейнера: `flex-direction`, `justify-content`, `align-items`, `flex-wrap`, `gap`.  
Элементы: `flex:`, `align-self`, `order`.

Пример:

```css
.row { display: flex; gap: 1rem; }
.row > div { flex: 1; background: #eee; padding: 1rem; }
```

Ось main / cross: зависит от `flex-direction`.

Для выравнивания по центру полностью:

```css
.center { display: flex; justify-content: center; align-items: center; }
```

---

## 10. CSS Grid

Контейнер: `display: grid;`

Определение колонок / строк:

```css
.grid { display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 1rem; }
```

Либо автоадаптивно:

```css
.grid-auto { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
```

Размещение элементов: `grid-column: 1 / 3;`.

Grid vs Flexbox: Flex — одномерный поток, Grid — двумерная сетка.

---

## 11. Адаптивность

Инструменты:

- `@media` (ширина, плотность пикселей, prefers-color-scheme)
- Процентные ширины, `max-width`, `min()` / `clamp()`
- Мобильный мета-тег: `<meta name="viewport" content="width=device-width, initial-scale=1">`

Пример:

```css
@media (max-width: 600px) {
  .menu { flex-direction: column; }
}
```

Советы:

1. Mobile-first: сначала стили для маленького экрана.
2. Избегайте фиксированных высот.
3. Тестируйте в DevTools (responsive mode).

---

## 12. Переменные CSS и препроцессоры

Переменные CSS:

```css
:root { --accent: #0a74d9; --radius: 8px; }
.button { background: var(--accent); border-radius: var(--radius); }
```

Преимущества: динамическая тема, переиспользование.

Sass (пример):

```scss
$accent: #0a74d9;
.button { background: $accent; }
```

---

## 13. Частые казусы и ошибки

| Казус | Пример плохого кода | Как правильно |
| ----- | ------------------- | ------------- |
| Использование `<br>` для отступов | `<p>Текст<br><br>Еще</p>` | Использовать `margin-bottom` |
| Инлайновые стили засоряют HTML | `<div style="color:red;font-size:14px">` | Вынести в `.error {}` |
| Жесткая ширина ломает адаптив | `.card { width: 400px; }` | `max-width: 400px; width: 100%;` |
| Float для центрирования | `.box { float: left; }` | Flexbox / `margin: 0 auto;` |
| Забыт `box-sizing` | Расчет ширины усложнен | `* { box-sizing: border-box; }` |
| Магические числа | `top: 37px;` | Использовать относительные единицы / выравнивание |
| Отсутствие contrast | Светло-серый на белом | Проверить через Lighthouse / contrast checker |

### Мини казус: IE box model

Старые браузеры считали `width` вместе с padding и border. Сейчас используем:

```css
* { box-sizing: border-box; }
```

### Казус: clearfix эпоха

Раньше для очистки float писали:

```css
.clearfix::after { content: ""; display: block; clear: both; }
```

Сейчас чаще заменено на Flex / Grid.

### Казус: specificity war

Плохо:

```css
#app .container .header .nav ul li a { color: red; }
```

Лучше:

```css
.nav a { color: red; }
```

Правило: чем короче и семантичнее селектор — тем проще поддержка.

---

## 14. Практика и задания

Уровень 1 (начальный):

1. Подключите внешний файл стилей.
2. Задайте шрифты и базовые цвета.
3. Реализуйте двухколоночный макет на Flexbox.

Уровень 2 (продвинутый):

1. Добавьте адаптивность: при ширине < 700px колонки в столбец.
2. Сделайте сетку карточек (минимум 6) на Grid с автоадаптацией.
3. Добавьте dark theme переключатель (через класс + CSS переменные).

Уровень 3 (исследовательский):

1. Реализуйте sticky header.
2. Используйте `clamp()` для размера заголовка.
3. Добавьте анимацию появления карточек (transition + transform).

Дополнительно:

- Проверьте Lighthouse (Performance, Accessibility).
- Включите prefers-color-scheme поддержку.

---

**Иллюстрации / ссылки:**

- Box model схема: [MDN: The box model](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model)
- Flexbox визуализация: [Flex Cheatsheet](https://yoksel.github.io/flex-cheatsheet/)
- Grid визуализация: [Grid by Example](https://gridbyexample.com/)
- Специфичность визуально: [Specifishity](https://specifishity.com/)
- Цветовые контрасты: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**Итоговые тезисы:**

1. Разделяйте ответственность: структура (HTML), стили (CSS), логика (JS).
2. Используйте современные layout-инструменты: Flexbox + Grid.
3. Минимизируйте специфичность — думайте масштабируемо.
4. Адаптивность и доступность — не опция, а базовый стандарт.
5. Инструменты (DevTools, линтеры, форматтеры) экономят часы времени.

---

**Мини чеклист перед сдачей лабораторной:**

- Есть внешний файл стилей
- Не используется `<br>` для отступов
- Включен `box-sizing: border-box;`
- Макет адаптивен (мобильное отображение проверено)
- Текст читабелен (контраст, размер)
- Нет избыточных id-селекторов
- Использованы семантические элементы HTML5 (header, main, footer)

---

**Для любознательных:**

- Container Queries
- Subgrid (часть современных браузеров)
- CSS Houdini (кастомные свойства уровня движка)
