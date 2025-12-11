# Лекция 16. Сборщики и инструменты: Webpack, Vite, Babel, ESLint

Цель лекции — не просто перечислить инструменты, а дать практическую интуицию: зачем нужен сборщик, как выбирать между Webpack и Vite, где нужен Babel, почему ESLint важен, и какие оптимизации действительно улучшают поведение приложения в продакшене.

Короткая карта тем:

1. Задачи сборки и зачем они нужны.
2. Webpack — мотивация, базовая структура конфигурации и плагины.
3. Vite и современные dev‑сервисы: как они работают и чем отличаются от классических бандлеров.
4. Babel и стратегии полифилов/таргетов.
5. Инструменты качества кода: ESLint, Prettier и интеграция.
6. Оптимизация бандлов: code splitting, tree‑shaking, кэширование и анализ.
7. Практические задания и измерения.

---

## 1) Задачи сборки — что должен уметь инструмент

Сборщик решает несколько практических задач:

- Позволяет писать современный код (ESM, TypeScript, JSX) и доставлять его в старые браузеры через транспиляцию и полифилы.
- Объединяет модули в минимальное число файлов, чтобы уменьшить число сетевых запросов и время загрузки.
- Обрабатывает ассеты: CSS/SCSS/PostCSS, изображения, шрифты — генерирует оптимизированный output и тайминги загрузки (preload/prefetch hints).
- Поддерживает dev‑сервер с HMR (hot module replacement) для быстрой разработки.
- Обеспечивает source maps для отладки и инструменты анализа бандла для оптимизации.

Практическая мысль: выбор инструмента зависит от приоритетов команды — быстрое локальное развитие и простота (Vite) или гибкость, расширяемость и поддержка большого набора плагинов (Webpack).

---

## 2) Webpack — конфигурация и важные концепции

Webpack остаётся мощным и гибким инструментом, который даёт контроль над процессом сборки. Его основные элементы:

- entry: точки входа (может быть несколько). Каждый entry → свой чанк.
- loaders: трансформация файлов (Babel, css-loader, sass-loader и т.д.).
- plugins: расширение функционала (HtmlWebpackPlugin, DefinePlugin, MiniCssExtractPlugin).
- output: настройки имени файлов, path и шаблонов хеша.

Минимальная конфигурация:

```js
// webpack.config.js
const path = require('path')
module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: { filename: 'bundle.js', path: path.resolve(__dirname, 'dist') },
  module: {
    rules: [
      { test: /\.jsx?$/, use: 'babel-loader', exclude: /node_modules/ },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ]
  },
  devtool: 'source-map'
}
```

Советы по Webpack:

- Для production используйте `mode: 'production'` или `TerserPlugin` и `MiniCssExtractPlugin` для CSS.
- Настройка long‑term caching: output filename с `[contenthash]` и отдельный runtime chunk.
- Профилируйте сборку через `--profile` или `webpack-bundle-analyzer`.

---

## 3) Vite — современный дев-сервер и сборка на Rollup

Vite переосмысливает локальную разработку: вместо предварительной сборки всего приложения он использует нативные ESM модули в браузере и трансформирует файлы по запросу. Это даёт почти мгновенную первую загрузку dev‑сервера и быстрый HMR.

Ключевые отличия:

- Dev: esbuild/fastified трансформации, ESM on demand — быстрый старт.
- Build: Vite использует Rollup под капотом, т.е. production output — оптимизированный Rollup бандл.
- Плагин‑экосистема Rollup совместима, а конфиги проще для базовых сценариев.

Стандартный сценарий запуска Vite:

```powershell
npm create vite@latest my-app -- --template vanilla
cd my-app
npm i
npm run dev
```

Практические замечания:

- Vite отлично подходит для SPA и микрофронтендов, особенно если команда ценит скорость разработки.
- Для сложных кастомных пайплайнов Webpack всё ещё даёт более тонкий контроль.

---

## 4) Babel — транспиляция и полифилы

Babel переводит современный JS в код, понятный целевым браузерам. `@babel/preset-env` вместе с `browserslist` определяет набор трансформаций и какие полифилы вставлять.

Полифилы и стратегии:

- `useBuiltIns: 'usage'` — автоматически добавляет полифилы только там, где они использованы.
- `entry` — вручную импортировать `core-js` в точке входа.

Пример конфигурации:

```json
{
  "presets": [
    ["@babel/preset-env", { "useBuiltIns": "usage", "corejs": 3 }]
  ]
}
```

Советы:

- Указывайте `browserslist` в `package.json` для согласованного таргетинга в Babel, PostCSS и Autoprefixer.
- Для TypeScript используйте `@babel/preset-typescript` или компиляцию через `tsc` в зависимости от требований к type stripping и source maps.

---

## 5) ESLint, Prettier и качество кода

Linting — не эстетика, а предотвращение ошибок на ранней стадии. ESLint можно интегрировать в CI и редакторы, а Prettier обеспечивает единый стиль.

Пример минимального `.eslintrc`:

```json
{
  "extends": ["eslint:recommended", "plugin:react/recommended"],
  "env": { "browser": true, "es2022": true },
  "rules": { "no-unused-vars": "warn" }
}
```

Интеграция:

- Настройте `lint` скрипт в `package.json` и включите в CI (`npm run lint`).
- Включите автофикс `--fix` как часть precommit hook (husky + lint‑staged).

---

## 6) Оптимизация бандла: анализ, код сплиттинг, кеширование

Ключевые техники:

- Tree‑shaking: удаление неиспользуемого кода — требует ES module формата и минификатора, поддерживающего это.
- Code splitting: динамический `import()` для ленивой загрузки фичей; разделение vendor/chunk/runtime.
- Long‑term caching: включайте `[contenthash]` в имена файлов, отделяйте runtime чтобы не инвалидировать кэш на каждый билд.
- Анализ: используйте `webpack-bundle-analyzer` или `source-map-explorer` чтобы найти тяжёлые зависимости.

Пример динамического импорта:

```js
button.addEventListener('click', async () => {
  const { heavy } = await import('./heavy-module.js')
  heavy()
})
```

Практическая проверка: измерьте bundle size с помощью `npx source-map-explorer dist/*.js` и найдите крупные зависимости (например, lodash / moment) — замените на более лёгкие альтернативы или импортируйте конкретные функции.

---

## 7) Практика — задания и чек‑лист

Мини‑проект: Vite + ESLint + Babel / Webpack comparison

1) Поднять Vite‑проект и настроить ESLint + Prettier и husky+lint‑staged для автофиксации.
2) Добавить динамический импорт (создать heavy chunk) и убедиться, что он создаётся в `dist`.
3) Сделать аналогичную сборку через Webpack (минимальная конфигурация) и сравнить размеры бандлов (анализатор).
4) Оптимизировать: заменить тяжёлую зависимость, включить `contenthash` и проанализировать выгоду.

Инструменты для измерений:

- `webpack-bundle-analyzer` / `rollup-plugin-visualizer` — интерактивный анализ.
- `source-map-explorer` — разбор карт исходников и суммирование размеров модулей.
- Lighthouse — измерение реальной производительности страницы.

---

## Как собрать и запустить (Windows) — кратко

```powershell
npm create vite@latest tooling-demo -- --template vanilla
cd tooling-demo
npm i -D eslint @babel/core @babel/preset-env source-map-explorer
npm run dev
```

---

## Вопросы для самопроверки

- Чем Vite отличается от Webpack на этапе разработки и почему HMR быстрее?
- Как Babel использует `browserslist`, и когда нужны полифилы?
- Какие приёмы дают наибольший выигрыш в bundle size (tree‑shaking, dynamic import, замена зависимостей)?

Примечание: после выполнения практики полезно зафиксировать измерения до/после оптимизаций и подготовить краткий отчёт — это тренирует понимание причинно‑следственных связей сборки.

