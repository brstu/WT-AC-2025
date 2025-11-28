# Лекция 19. Анимации и визуализация: CSS, Canvas, SVG, D3.js

Цель лекции — освоить различные способы создания анимаций и визуализации данных в вебе: от простых CSS-переходов до сложных интерактивных графиков на D3.js. Вы научитесь выбирать правильный инструмент для каждой задачи, создавать производительные анимации и соблюдать принципы доступности.

Короткая карта тем:

1. Когда и зачем нужны анимации — UX-принципы, easing, duration, задержки.
2. CSS-анимации и переходы — transition, @keyframes, transform, оптимизация производительности.
3. Canvas 2D — рисование графики, анимации, игры, оптимизация.
4. SVG — векторная графика, масштабируемость, анимации, интерактивность.
5. D3.js — привязка данных к DOM, масштабы, оси, создание графиков.
6. Производительность и доступность — 60 FPS, prefers-reduced-motion, респект к пользователю.

Чтение:

- MDN CSS Animations: <https://developer.mozilla.org/ru/docs/Web/CSS/CSS_Animations>
- MDN Canvas API: <https://developer.mozilla.org/ru/docs/Web/API/Canvas_API>
- D3.js: <https://d3js.org/>
- Web Animations API: <https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API>
- Anime.js (библиотека анимаций): <https://animejs.com/>

---

## 1) Когда и зачем нужны анимации — UX-принципы

### Роль анимаций в UX

Анимации — это не украшательство, а инструмент коммуникации с пользователем:

**Привлечение внимания:**
- Новое уведомление появляется с плавным fade-in → пользователь замечает изменение.
- Важная кнопка слегка пульсирует → привлекает взгляд к CTA (Call To Action).

**Обратная связь:**
- Кнопка анимируется при клике → пользователь понимает, что действие выполнено.
- Loader показывает, что запрос обрабатывается → снижает тревожность ожидания.

**Плавность переходов:**
- При переключении вкладок контент плавно сдвигается → пользователь понимает пространственные отношения.
- Модальное окно появляется с анимацией → менее резкое изменение экрана.

**Объяснение поведения системы:**
- Элемент "выезжает" из-за экрана → понятно, откуда он пришёл.
- Удаляемый элемент "улетает" в корзину → визуальная метафора.

### Принципы хорошей анимации

#### 1. Duration (длительность)

- **Быстро (100-200 мс):** Ховер-эффекты, мелкие UI-изменения.
- **Средне (200-400 мс):** Переходы между состояниями, модальные окна.
- **Медленно (400-600 мс):** Крупные трансформации, смена страниц.
- **Очень медленно (600+ мс):** Обычно слишком долго, пользователь теряет интерес.

**Правило:** Чем крупнее элемент и больше расстояние перемещения, тем дольше анимация.

#### 2. Easing (функции смягчения)

Easing определяет, как меняется скорость анимации от начала к концу.

- **linear:** Постоянная скорость — выглядит механично и неестественно.
- **ease-in:** Медленно начинается, ускоряется к концу — подходит для элементов, уходящих с экрана.
- **ease-out:** Быстро начинается, замедляется к концу — **самый частый выбор**, естественное ощущение.
- **ease-in-out:** Плавно начинается и заканчивается — подходит для зацикленных анимаций.
- **cubic-bezier:** Кастомные кривые для уникального ощущения.

```css
/* Примеры easing */
.ease-out { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.bounce { transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55); }
```

**Инструмент:** <https://cubic-bezier.com> — интерактивный редактор easing-функций.

#### 3. Delay (задержка)

Задержка перед началом анимации. Полезна для создания последовательных анимаций (staggered).

```css
.item:nth-child(1) { animation-delay: 0s; }
.item:nth-child(2) { animation-delay: 0.1s; }
.item:nth-child(3) { animation-delay: 0.2s; }
```

### Когда НЕ использовать анимации

- **Критичные действия:** Не анимируйте подтверждение удаления — пользователь должен сразу увидеть результат.
- **Частые действия:** Если пользователь кликает 100 раз, анимация станет раздражающей.
- **Медленные устройства:** Тяжёлые анимации на слабых устройствах приводят к лагам.
- **Пользователь отключил анимации:** Уважайте `prefers-reduced-motion`.

---

## 2) CSS-анимации и переходы — простые и производительные

CSS-анимации — самый простой и производительный способ анимировать элементы, потому что браузер может оптимизировать их на уровне композитора (без перерасчёта layout/paint).

### Transitions — плавные переходы между состояниями

`transition` применяется автоматически при изменении CSS-свойства.

```css
.button {
  background: #3b82f6;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  /* Анимируем все изменяемые свойства */
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

**Результат:** Кнопка плавно "поднимается" при наведении и "нажимается" при клике.

**Синтаксис transition:**

```css
transition: <property> <duration> <timing-function> <delay>;
```

**Примеры:**

```css
/* Анимировать все свойства */
transition: all 0.3s ease;

/* Анимировать только transform */
transition: transform 0.3s ease;

/* Несколько свойств с разными параметрами */
transition: transform 0.3s ease, opacity 0.5s linear 0.1s;
```

### @keyframes — многоступенчатые анимации

Для сложных анимаций с несколькими ключевыми кадрами используйте `@keyframes`.

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert {
  animation: fadeInUp 0.4s ease-out;
}
```

**Анимация с промежуточными кадрами:**

```css
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.notification-badge {
  animation: pulse 1.5s ease-in-out infinite;
}
```

**Свойства animation:**

```css
animation: <name> <duration> <timing-function> <delay> <iteration-count> <direction> <fill-mode> <play-state>;
```

Примеры:

```css
/* Бесконечная анимация */
animation: spin 2s linear infinite;

/* Анимация только один раз */
animation: slideIn 0.5s ease-out;

/* Анимация туда-обратно */
animation: bounce 1s ease-in-out infinite alternate;

/* Остановить анимацию */
animation-play-state: paused;
```

### Производительность: анимируйте только transform и opacity

**Почему transform и opacity быстрые:**

Браузер может анимировать их на GPU (Graphics Processing Unit) без пересчёта layout или paint — только композитинг.

**Медленные свойства (вызывают reflow/repaint):**

- `width`, `height`, `top`, `left`, `margin`, `padding` → пересчёт layout
- `background-color`, `color`, `border` → repaint

**Пример плохой анимации:**

```css
/* ПЛОХО: вызывает reflow на каждом кадре */
.box {
  transition: width 0.3s, height 0.3s, left 0.3s;
}
.box:hover {
  width: 200px;
  height: 200px;
  left: 100px;
}
```

**Хорошая альтернатива:**

```css
/* ХОРОШО: только transform, работает на GPU */
.box {
  transition: transform 0.3s;
}
.box:hover {
  transform: translate(100px, 0) scale(2);
}
```

### will-change — подсказка браузеру

`will-change` говорит браузеру, что свойство скоро будет анимироваться, и он может подготовиться (например, создать отдельный композитный слой).

```css
.animatable {
  will-change: transform, opacity;
}
```

**Осторожно:** Не используйте `will-change` везде — это расходует память. Применяйте только к элементам, которые действительно будут анимироваться.

**Правильное использование:**

```js
element.addEventListener('mouseenter', () => {
  element.style.willChange = 'transform'
})

element.addEventListener('mouseleave', () => {
  element.style.willChange = 'auto' // Освобождаем ресурсы
})
```

---

## 3) Canvas 2D — рисование графики на лету

Canvas — это HTML-элемент для программного рисования 2D/3D графики. В отличие от DOM-элементов или SVG, Canvas работает на уровне пикселей (растровая графика).

### Когда использовать Canvas

- **Игры:** Постоянная перерисовка, много объектов.
- **Визуализация данных в реальном времени:** Графики, мониторинг.
- **Генеративное искусство и эффекты:** Частицы, шейдеры.
- **Обработка изображений:** Фильтры, кропинг.

**Не подходит для:** Статичный UI, доступный контент (Canvas не семантичен для screen readers).

### Базовый пример: рисование фигур

```html
<canvas id="myCanvas" width="400" height="300"></canvas>
```

```js
const canvas = document.getElementById('myCanvas')
const ctx = canvas.getContext('2d')

// Рисуем прямоугольник
ctx.fillStyle = 'tomato'
ctx.fillRect(10, 10, 100, 80) // x, y, width, height

// Рисуем круг
ctx.beginPath()
ctx.arc(200, 50, 30, 0, Math.PI * 2) // x, y, radius, startAngle, endAngle
ctx.fillStyle = 'dodgerblue'
ctx.fill()

// Рисуем линию
ctx.beginPath()
ctx.moveTo(10, 150)
ctx.lineTo(200, 150)
ctx.strokeStyle = 'green'
ctx.lineWidth = 3
ctx.stroke()

// Рисуем текст
ctx.font = '24px Arial'
ctx.fillStyle = 'black'
ctx.fillText('Hello Canvas!', 10, 200)
```

### Анимация на Canvas: requestAnimationFrame

Для плавной анимации используйте `requestAnimationFrame` — он вызывает функцию перед следующей перерисовкой экрана (~60 FPS).

```js
const canvas = document.getElementById('myCanvas')
const ctx = canvas.getContext('2d')

let x = 0

function draw() {
  // Очищаем canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Рисуем движущийся квадрат
  ctx.fillStyle = 'tomato'
  ctx.fillRect(x, 100, 50, 50)

  // Обновляем позицию
  x += 2
  if (x > canvas.width) x = -50

  // Запрашиваем следующий кадр
  requestAnimationFrame(draw)
}

draw()
```

### Производительность Canvas

**Проблема:** Если рисовать тысячи объектов каждый кадр, производительность упадёт.

**Решения:**

1. **Offscreen Canvas:** Рендерить в отдельный canvas в памяти, затем копировать на видимый canvas.

```js
const offscreen = document.createElement('canvas')
offscreen.width = canvas.width
offscreen.height = canvas.height
const offCtx = offscreen.getContext('2d')

// Рисуем на offscreen
offCtx.fillRect(...)

// Копируем на основной canvas
ctx.drawImage(offscreen, 0, 0)
```

2. **Слои:** Разделить статичный фон и динамические объекты на разные canvas, перерисовывать только изменившиеся.

3. **Ограничение области перерисовки:** Вместо `clearRect(0, 0, width, height)` очищайте только изменённую область.

### Пример: частицы

```js
class Particle {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.vx = (Math.random() - 0.5) * 2
    this.vy = (Math.random() - 0.5) * 2
    this.radius = Math.random() * 3 + 1
  }

  update() {
    this.x += this.vx
    this.y += this.vy
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1
  }

  draw(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(59, 130, 246, 0.8)'
    ctx.fill()
  }
}

const particles = []
for (let i = 0; i < 100; i++) {
  particles.push(new Particle(
    Math.random() * canvas.width,
    Math.random() * canvas.height
  ))
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  particles.forEach(p => {
    p.update()
    p.draw(ctx)
  })

  requestAnimationFrame(animate)
}

animate()
```

---

## 4) SVG — векторная масштабируемая графика

SVG (Scalable Vector Graphics) — это XML-формат для векторной графики. В отличие от Canvas (растр), SVG сохраняет чёткость при любом масштабе.

### Когда использовать SVG

- **Иконки и логотипы:** Чёткость на Retina-экранах, легко стилизовать через CSS.
- **Графики и диаграммы:** Доступные (можно добавить `<title>`, `<desc>`), интерактивные.
- **Иллюстрации:** Редактируемые в Figma/Illustrator.
- **Анимации:** CSS/JS анимации, морфинг форм.

**Преимущества над Canvas:**

- Масштабируемость без потери качества.
- Доступность (SVG — часть DOM).
- Легко стилизовать через CSS.
- Селективное взаимодействие (можно кликнуть на конкретный элемент).

**Недостатки:**

- Производительность падает при тысячах элементов (каждый элемент — DOM-нода).
- Сложные эффекты (фильтры, шейдеры) медленнее, чем в Canvas/WebGL.

### Базовый пример SVG

```html
<svg viewBox="0 0 200 200" width="200" height="200">
  <!-- Круг -->
  <circle cx="100" cy="100" r="50" fill="tomato" stroke="black" stroke-width="2" />

  <!-- Прямоугольник -->
  <rect x="10" y="10" width="80" height="60" fill="dodgerblue" rx="8" />

  <!-- Линия -->
  <line x1="10" y1="150" x2="190" y2="150" stroke="green" stroke-width="3" />

  <!-- Текст -->
  <text x="100" y="180" text-anchor="middle" font-size="16" fill="black">Hello SVG!</text>
</svg>
```

### viewBox — система координат

`viewBox="minX minY width height"` определяет внутреннюю систему координат, независимую от реального размера SVG.

```html
<!-- viewBox 0 0 100 100, но отображается как 200x200 px → всё увеличено вдвое -->
<svg viewBox="0 0 100 100" width="200" height="200">
  <circle cx="50" cy="50" r="40" fill="teal" />
</svg>
```

**Применение:** Создавайте иконки в viewBox 24x24, затем масштабируйте через width/height — они останутся чёткими.

### Path — сложные формы

`<path>` — самый мощный элемент SVG, позволяет рисовать любые формы.

```html
<svg viewBox="0 0 100 100" width="100" height="100">
  <!-- Треугольник -->
  <path d="M 50 10 L 90 90 L 10 90 Z" fill="gold" stroke="black" stroke-width="2" />
</svg>
```

**Команды path:**

- `M x y` — Move to (переместить карандаш)
- `L x y` — Line to (нарисовать линию)
- `C x1 y1 x2 y2 x y` — Cubic Bezier curve
- `Q x1 y1 x y` — Quadratic Bezier curve
- `A rx ry rotation large-arc sweep x y` — Arc (дуга)
- `Z` — Close path (замкнуть путь)

### Анимация SVG через CSS

SVG-элементы можно анимировать как обычные DOM-элементы:

```html
<svg viewBox="0 0 100 100" width="100" height="100">
  <circle class="animated-circle" cx="50" cy="50" r="40" fill="teal" />
</svg>

<style>
  .animated-circle {
    transition: fill 0.3s, transform 0.3s;
    transform-origin: center;
  }

  .animated-circle:hover {
    fill: tomato;
    transform: scale(1.2);
  }
</style>
```

### SMIL-анимации (встроенные в SVG)

SMIL (Synchronized Multimedia Integration Language) — встроенный в SVG способ анимации.

```html
<svg viewBox="0 0 200 100" width="200" height="100">
  <circle cx="50" cy="50" r="20" fill="dodgerblue">
    <animate
      attributeName="cx"
      from="50"
      to="150"
      dur="2s"
      repeatCount="indefinite"
    />
  </circle>
</svg>
```

**Примечание:** SMIL поддерживается, но современные подходы предпочитают CSS/JS анимации.

---

## 5) D3.js — Data-Driven Documents

D3.js — мощнейшая библиотека для визуализации данных. Она связывает данные с DOM-элементами и предоставляет инструменты для создания интерактивных графиков.

### Зачем нужен D3.js

- **Связывание данных с элементами:** Автоматически создаёт/обновляет/удаляет элементы при изменении данных.
- **Масштабы (scales):** Преобразует данные (например, 0-100) в пиксели (например, 0-500px).
- **Оси, легенды, переходы:** Встроенные инструменты для создания профессиональных графиков.
- **Гибкость:** В отличие от Chart.js, D3 даёт полный контроль над каждым элементом.

**Установка:**

```bash
npm install d3
```

Или через CDN:

```html
<script src="https://d3js.org/d3.v7.min.js"></script>
```

### Базовый пример: столбчатая диаграмма

```html
<svg id="chart" width="400" height="200"></svg>

<script>
  const data = [30, 80, 45, 60, 20, 90, 50];

  const svg = d3.select("#chart");
  const width = 400;
  const height = 200;
  const barWidth = width / data.length;

  // Создаём столбцы
  svg.selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", (d, i) => i * barWidth)
    .attr("y", d => height - d)
    .attr("width", barWidth - 2)
    .attr("height", d => d)
    .attr("fill", "steelblue");
</script>
```

**Что происходит:**

1. `d3.select("#chart")` — выбираем SVG-контейнер.
2. `.data(data)` — связываем массив данных с элементами.
3. `.join("rect")` — создаём `<rect>` для каждого элемента данных (если элементов больше, чем `<rect>`, создаёт новые; если меньше — удаляет лишние).
4. `.attr("y", d => height - d)` — позиционируем столбец (SVG координаты начинаются сверху, поэтому инвертируем).

### Scales — масштабы

Масштабы преобразуют данные в визуальные величины (пиксели, цвета).

```javascript
const data = [10, 50, 80, 120, 200];

// Линейный масштаб: входные данные 10-200 → выходные пиксели 0-400
const xScale = d3.scaleLinear()
  .domain([0, 200])  // диапазон данных
  .range([0, 400]);  // диапазон пикселей

console.log(xScale(10));   // 20 (10/200 * 400)
console.log(xScale(100));  // 200
console.log(xScale(200));  // 400
```

**Типы масштабов:**

- `scaleLinear()` — линейное преобразование (числа).
- `scaleOrdinal()` — категориальные данные (например, имена → цвета).
- `scaleTime()` — для временных данных.
- `scaleLog()`, `scalePow()` — логарифмический/степенной масштаб.

### Axes — оси координат

D3 автоматически создаёт оси с делениями и подписями.

```javascript
const svg = d3.select("#chart");
const margin = { top: 20, right: 20, bottom: 30, left: 40 };
const width = 400 - margin.left - margin.right;
const height = 200 - margin.top - margin.bottom;

const xScale = d3.scaleLinear().domain([0, 100]).range([0, width]);
const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);

// Создаём группу для графика (учитываем отступы)
const g = svg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Добавляем оси
g.append("g")
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(xScale));

g.append("g")
  .call(d3.axisLeft(yScale));
```

### Enter/Update/Exit — паттерн обновления данных

Когда данные меняются, D3 позволяет обработать три ситуации:

- **Enter:** Новые данные (нужно создать элементы).
- **Update:** Существующие данные (нужно обновить элементы).
- **Exit:** Удалённые данные (нужно удалить элементы).

```javascript
function updateChart(data) {
  const svg = d3.select("#chart");

  const bars = svg.selectAll("rect").data(data);

  // Enter: создаём новые столбцы
  bars.enter()
    .append("rect")
    .attr("x", (d, i) => i * 30)
    .attr("width", 25)
    .merge(bars)  // объединяем с существующими
    // Update: обновляем высоту
    .transition()
    .duration(500)
    .attr("y", d => 200 - d)
    .attr("height", d => d);

  // Exit: удаляем лишние столбцы
  bars.exit()
    .transition()
    .duration(500)
    .attr("height", 0)
    .remove();
}

// Первоначальные данные
updateChart([30, 80, 45, 60]);

// Обновляем данные через 2 секунды
setTimeout(() => updateChart([50, 120, 30]), 2000);
```

### Transitions — анимации в D3

D3 предоставляет `.transition()` для плавных изменений.

```javascript
svg.selectAll("circle")
  .data(data)
  .join("circle")
  .attr("cx", (d, i) => i * 50)
  .attr("cy", 100)
  .attr("r", 0)
  .attr("fill", "tomato")
  .transition()
  .duration(800)
  .delay((d, i) => i * 100)  // последовательное появление
  .attr("r", d => d);
```

---

## 6) Производительность и доступность анимаций

### Производительность: целевые 60 FPS

Браузер перерисовывает экран 60 раз в секунду (60 FPS). Каждый кадр должен отрисоваться за **16.67 мс** (1000 мс / 60).

**Пайплайн отрисовки:**

1. **JavaScript:** Вычисления, изменение DOM.
2. **Style:** Пересчёт CSS-стилей.
3. **Layout (Reflow):** Вычисление позиций и размеров элементов.
4. **Paint:** Растеризация элементов (пиксели).
5. **Composite:** Объединение слоёв на GPU.

**Самые быстрые свойства (только Composite):**
- `transform` (translate, scale, rotate)
- `opacity`

**Медленные свойства (Layout + Paint):**
- `width`, `height`, `top`, `left`
- `margin`, `padding`
- `display`

### Оптимизация: `will-change` и слои GPU

Свойство `will-change` сообщает браузеру, что элемент будет анимироваться, и браузер выносит его на отдельный GPU-слой.

```css
.animated-box {
  will-change: transform, opacity;
}

/* После окончания анимации очищайте will-change */
.animated-box.animation-finished {
  will-change: auto;
}
```

**Внимание:** Не применяйте `will-change` ко всем элементам — это расходует память GPU.

### Canvas: offscreen rendering и частичное обновление

Для Canvas с тысячами объектов:

```javascript
// Создаём offscreen canvas для статичного фона
const offscreenCanvas = document.createElement('canvas');
const offscreenCtx = offscreenCanvas.getContext('2d');
offscreenCanvas.width = canvas.width;
offscreenCanvas.height = canvas.height;

// Рисуем фон один раз
offscreenCtx.fillStyle = '#f0f0f0';
offscreenCtx.fillRect(0, 0, canvas.width, canvas.height);

// В основном цикле анимации
function animate() {
  // Копируем фон из offscreen
  ctx.drawImage(offscreenCanvas, 0, 0);

  // Рисуем только динамические объекты
  particles.forEach(p => p.draw(ctx));

  requestAnimationFrame(animate);
}
```

### Доступность: prefers-reduced-motion

Пользователи с вестибулярными нарушениями могут включить в ОС настройку "Уменьшить движение". Уважайте это!

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**В JavaScript:**

```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  // Запускаем анимацию только если пользователь не отключил движение
  element.classList.add('animate');
}
```

### Доступность SVG

SVG-элементы доступны скринридерам, но нужно добавить описания:

```html
<svg role="img" aria-labelledby="chart-title chart-desc">
  <title id="chart-title">Продажи за 2024 год</title>
  <desc id="chart-desc">Столбчатая диаграмма показывает рост продаж с января по декабрь</desc>
  <!-- График -->
</svg>
```

### Инструменты профилирования

- **Chrome DevTools → Performance:** Запишите анимацию, найдите долгие Layout/Paint.
- **FPS meter:** В DevTools → Settings → More tools → Rendering → FPS meter.
- **will-change overlay:** Rendering → Layer borders (зелёные границы = GPU-слой).

---

## 7) Практическое задание: Интерактивный дашборд

Создайте интерактивную панель визуализации данных, объединяющую все изученные техники.

### Требования

**Функциональность:**

1. **Столбчатая диаграмма (D3.js):** Отображает продажи по месяцам.
2. **Анимированный счётчик (CSS/JS):** Плавное увеличение цифры от 0 до целевого значения.
3. **Canvas-визуализация:** Анимированный график в реальном времени (например, температура).
4. **SVG-иконки:** Анимация при наведении (scale, fill).

**Интерактивность:**

- Кнопка "Обновить данные" загружает новые случайные данные с анимацией.
- Hover-эффекты на столбцах диаграммы (подсветка, тултип с точным значением).
- Кнопка "Пауза" останавливает Canvas-анимацию.

**Доступность и производительность:**

- Реализуйте `prefers-reduced-motion` (отключение всех анимаций).
- Используйте `transform`/`opacity` вместо `left`/`top`.
- Добавьте `aria-label` для SVG-иконок.
- Проверьте FPS через Chrome DevTools (должно быть 60 FPS).

### Пример структуры проекта

```
dashboard/
├── index.html
├── style.css
├── main.js
└── package.json
```

**index.html:**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Дашборд визуализации</title>
  <link rel="stylesheet" href="style.css">
  <script src="https://d3js.org/d3.v7.min.js"></script>
</head>
<body>
  <header>
    <h1>📊 Интерактивный дашборд</h1>
    <button id="update-btn">🔄 Обновить данные</button>
  </header>

  <main>
    <section class="card">
      <h2>Продажи за год</h2>
      <svg id="bar-chart" width="600" height="300"></svg>
    </section>

    <section class="card">
      <h2>Общая выручка</h2>
      <div class="counter" id="counter">0</div>
    </section>

    <section class="card">
      <h2>Температура (real-time)</h2>
      <canvas id="line-chart" width="600" height="200"></canvas>
      <button id="pause-btn">⏸️ Пауза</button>
    </section>
  </main>

  <script type="module" src="main.js"></script>
</body>
</html>
```

**main.js (пример логики):**

```javascript
// === D3.js Столбчатая диаграмма ===
function updateBarChart(data) {
  const svg = d3.select("#bar-chart");
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 600 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  svg.selectAll("*").remove(); // Очистка перед обновлением

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleBand()
    .domain(data.map((d, i) => i))
    .range([0, width])
    .padding(0.2);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data)])
    .range([height, 0]);

  g.selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", (d, i) => xScale(i))
    .attr("y", height)
    .attr("width", xScale.bandwidth())
    .attr("height", 0)
    .attr("fill", "steelblue")
    .on("mouseenter", function() {
      d3.select(this).attr("fill", "orange");
    })
    .on("mouseleave", function() {
      d3.select(this).attr("fill", "steelblue");
    })
    .transition()
    .duration(800)
    .attr("y", d => yScale(d))
    .attr("height", d => height - yScale(d));

  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  g.append("g").call(d3.axisLeft(yScale));
}

// === Анимированный счётчик ===
function animateCounter(targetValue) {
  const counter = document.getElementById("counter");
  const duration = 1000; // 1 секунда
  const startTime = performance.now();
  const startValue = 0;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentValue = Math.floor(startValue + progress * targetValue);

    counter.textContent = `${currentValue}₽`;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// === Canvas real-time график ===
const canvas = document.getElementById("line-chart");
const ctx = canvas.getContext("2d");
const dataPoints = [];
let isPaused = false;

function drawLineChart() {
  if (isPaused) return;

  // Добавляем новую точку
  dataPoints.push(Math.random() * 100);
  if (dataPoints.length > 100) dataPoints.shift();

  // Очищаем Canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Рисуем линию
  ctx.strokeStyle = "teal";
  ctx.lineWidth = 2;
  ctx.beginPath();
  dataPoints.forEach((val, i) => {
    const x = (i / 100) * canvas.width;
    const y = canvas.height - (val / 100) * canvas.height;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  requestAnimationFrame(drawLineChart);
}

// === Инициализация ===
document.getElementById("update-btn").addEventListener("click", () => {
  const randomData = Array.from({ length: 12 }, () => Math.floor(Math.random() * 100));
  updateBarChart(randomData);
  animateCounter(randomData.reduce((sum, val) => sum + val, 0) * 1000);
});

document.getElementById("pause-btn").addEventListener("click", () => {
  isPaused = !isPaused;
  document.getElementById("pause-btn").textContent = isPaused ? "▶️ Старт" : "⏸️ Пауза";
  if (!isPaused) drawLineChart();
});

// Первоначальная загрузка
updateBarChart([30, 50, 45, 60, 80, 70, 90, 85, 75, 95, 100, 110]);
animateCounter(95000);
drawLineChart();

// Поддержка prefers-reduced-motion
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.body.style.setProperty('--animation-duration', '0.01ms');
}
```

**style.css:**

```css
:root {
  --animation-duration: 0.5s;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --animation-duration: 0.01ms;
  }
}

body {
  font-family: system-ui, sans-serif;
  background: #f5f5f5;
  margin: 0;
  padding: 20px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform var(--animation-duration), background var(--animation-duration);
}

button:hover {
  transform: scale(1.05);
  background: #0056b3;
}

main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.counter {
  font-size: 48px;
  font-weight: bold;
  color: #28a745;
  text-align: center;
  margin-top: 20px;
}
```

### Критерии оценки

- **Функциональность (30%):** Все 4 визуализации работают корректно.
- **Анимации (25%):** Плавные переходы, используется `transform`/`opacity`.
- **Интерактивность (20%):** Hover-эффекты, кнопки обновления/паузы.
- **Доступность (15%):** `prefers-reduced-motion`, `aria-label` для SVG.
- **Производительность (10%):** 60 FPS в Chrome DevTools Performance.

---

## Как собрать и запустить (Windows)

```powershell
# Создать проект
npm create vite@latest dashboard -- --template vanilla
cd dashboard

# Установить зависимости
npm install d3

# Запустить dev-сервер
npm run dev
```

Откройте [http://localhost:5173](http://localhost:5173) в браузере.

---

## Дополнительные материалы

- [MDN: CSS Animations](https://developer.mozilla.org/ru/docs/Web/CSS/CSS_Animations)
- [MDN: Canvas API](https://developer.mozilla.org/ru/docs/Web/API/Canvas_API)
- [D3.js Documentation](https://d3js.org/)
- [Web Animations API](https://developer.mozilla.org/ru/docs/Web/API/Web_Animations_API)
- [Anime.js — лёгкая библиотека анимаций](https://animejs.com/)
- [GreenSock (GSAP) — профессиональная анимация](https://greensock.com/gsap/)
- [Cubic Bezier Tool](https://cubic-bezier.com/) — визуальный редактор timing-функций

---

## Вопросы для самопроверки

1. Какие CSS-свойства лучше всего анимировать с точки зрения производительности и почему?
2. В чём ключевые различия между Canvas и SVG? Когда использовать каждый из них?
3. Как работает паттерн Enter/Update/Exit в D3.js?
4. Что такое `requestAnimationFrame` и почему он лучше `setInterval` для анимаций?
5. Как реализовать поддержку `prefers-reduced-motion` в CSS и JavaScript?
6. Что такое `will-change` и когда его следует использовать?
7. Как профилировать производительность анимаций в Chrome DevTools?
8. Какие техники оптимизации Canvas можно применить для тысяч объектов?

---

**Итог:** Вы изучили современные подходы к созданию анимаций и визуализации данных в вебе — от простых CSS-переходов до интерактивных D3.js-графиков. Применяйте эти знания для создания красивых, производительных и доступных интерфейсов! 🎨📊
