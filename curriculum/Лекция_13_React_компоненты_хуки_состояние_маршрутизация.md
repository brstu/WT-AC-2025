# Лекция 13. React: компоненты, хуки, состояние, маршрутизация — развёрнуто

Цель лекции — дать не только набор приёмов и API, но и интуицию: почему React устроен так, как устроен, какие паттерны действительно помогают в реальных приложениях, и какие ошибки чаще всего приводят к багам или ухудшению производительности.

Краткая дорожная карта:

1. Зачем React и общая парадигма (декларативность, однонаправленный поток данных).
2. Компоненты и JSX: структура, props, список/ключи, события, управляемые и неуправляемые формы.
3. Состояние и хуки: `useState`, `useEffect`, `useRef`, мемоизация, и как писать кастомные хуки.
4. Поднятие состояния, Context API и композиция: где заканчивается «локальное» и начинается «глобальное».
5. Работа с данными и сервером: fetch, AbortController и TanStack Query (React Query).
6. Маршрутизация: React Router (v6+), nested routes, lazy loading, params.
7. Производительность и отладка: когда оптимизировать, обычные анти‑паттерны и инструменты.
8. Практика: требования и подсказки для мини‑проекта «Todo + Router».

---

## 1. Зачем React — короткая интуиция

React даёт декларативную модель построения UI: вы описываете, как интерфейс должен выглядеть в зависимости от состояния, а React заботится о преобразовании этой декларации в изменения DOM. Вместо последовательных императивных инструкций («поменяй класс, добавь элемент, убери текст») React позволяет держать единую модель состояния и перерисовывать UI на её основе.

Плюсы модели:

- Чёткость мышления: UI = f(state).
- Композиция: интерфейс строится из маленьких компонентов, которые легко тестировать и переиспользовать.
- Большая экосистема (router, state managers, testing, tooling).

Однако декларативность не снимает ответственности: важно правильно разделять состояние и оптимизировать горячие места (см. раздел про перформанс).

---

## 2. Компоненты и JSX — правила и практики

Компонент в современной практике — это функция (Function Component). Она принимает props и возвращает JSX. JSX — это всего лишь синтаксический сахар для вызовов React.createElement.

Пример простого компонента:

```jsx
export function Hello({ name }) {
  return <h1>Привет, {name}</h1>
}
```

Принципы проектирования компонентов:

- Делайте компоненты маленькими и понятными — один компонент = одна ответственность.
- Разделяйте контейнеры (логика) и презентационные компоненты. Контейнеры вытягивают данные и передают нужные props в презентационные компоненты.
- Используйте «детские» props (`children`) для композиции.

Списки и ключи — почему ключи важны

Ключи (`key`) помогают React соотнести элементы списка между рендерами. Неправильные ключи (например, индекс массива) приводят к нежелательной перезаписи DOM и багам в управляемых полях.

```jsx
function List({ items }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  )
}
```

События и обработчики

React нормализует события; обработчики передаются как функции в JSX. Избегайте создания новых функций в горячих местах без необходимости — это влияет на мемоизацию.

Управляемые vs неуправляемые формы

- Управляемая форма: значение поля хранится в состоянии компонента (`value` + `onChange`). Хороша для валидации, динамики и однозначного контроля.
- Неуправляемая: используем ref для прямого доступа к DOM (быстрее для простых случаев).

Пример управляемой формы:

```jsx
import { useState } from 'react'

function Form() {
  const [text, setText] = useState('')
  return (
    <form onSubmit={e => { e.preventDefault(); console.log(text); setText('') }}>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button>OK</button>
    </form>
  )
}
```

---

## 3. Состояние и хуки — как думать о них

Локальное состояние: `useState`

`useState` хранит локальное состояние в компоненте. Для сложных обновлений используйте функциональную форму setState(prev => ...).

```jsx
const [count, setCount] = useState(0)
setCount(prev => prev + 1)
```

Побочные эффекты: `useEffect`

`useEffect` служит для синхронизации с внешним миром (fetch, подписки, таймеры). Важное правило — укажите зависимости в массиве, чтобы эффект запускался только при изменении нужных значений, и обязательно очищайте ресурсы в return для отписки/abort.

```jsx
useEffect(() => {
  const id = setInterval(tick, 1000)
  return () => clearInterval(id)
}, []) // пустой массив — запуск один раз
```

Типичные ошибки с `useEffect`:

- Пропущенные зависимости ⇒ баги и stale closures.
- Частые эффекты без мемоизации ⇒ лишние запросы.

Refs и мутируемые объекты: `useRef`

`useRef` позволяет хранить мутабельные значения, которые не должны вызывать ререндер. Как правило, используется для доступа к DOM или хранения «последнего значения» между рендерами.

Мемоизация: `useMemo` и `useCallback`

`useMemo` кеширует вычисление, `useCallback` — функцию. Их применение оправдано, когда вычисление/функция тяжёлая или передаётся глубоко вниз и вызывает лишние рендеры.

Кастомные хуки

Кастомный хук — это функция, начинающаяся с `use`, которая инкапсулирует поведение (fetch, подписки, синхронизация с localStorage) и возвращает данные/методы. Это способ реюза логики.

Пример хука для задач:

```jsx
import { useEffect, useState } from 'react'

function useTasks() {
  const [tasks, setTasks] = useState([])
  useEffect(() => {
    const ctrl = new AbortController()
    fetch('/api/tasks', { signal: ctrl.signal })
      .then(r => r.json()).then(setTasks).catch(() => {})
    return () => ctrl.abort()
  }, [])
  return { tasks, setTasks }
}
```

---

## 4. Поднятие состояния, Context и композиция

Когда состояние нужно нескольким компонентам, варианты:

1. Поднять состояние вверх (lifting state up) — передавать через props.
2. Использовать Context API для «глобальных» настроек (тема, авторизация, локаль).
3. Ввести отдельный стор (Redux, Zustand) для сложной логики и большого количества компонентов.

Context API удобно использовать для семантических значений, но не стоит сохранять в нём часто обновляющиеся данные без оптимизаций — это приведёт к частым перерисовкам всех подписчиков.

Простой пример Context для темы:

```jsx
import { createContext, useContext } from 'react'
const ThemeCtx = createContext('light')
export function useTheme() { return useContext(ThemeCtx) }
```

Композиция — предпочтительный способ переиспользования логики вместо наследования.

---

## 5. Работа с данными: fetch, AbortController и TanStack Query

Ниже — важные принципы работы с серверными данными:

- Отделяйте жизненный цикл данных от UI: используйте хуки/сторы для получения и кеширования данных.
- Всегда поддерживайте обработку ошибок, состояния загрузки и отмены запросов (AbortController).

TanStack Query (React Query) — библиотека, упрощающая кэширование, инвалидацию, повтор запросов и фоновые обновления. Рекомендуется для большинства CRUD‑сценариев вместо ручной реализации кеша.

Простой пример fetch с AbortController (внутри хука): см. `useTasks` выше — важно возвращать cleanup для abort.

---

## 6. Маршрутизация (React Router v6+): практические рекомендации

React Router v6 предоставляет декларативный API и поддержку nested routes, loaders и lazy‑loading. Основные моменты:

- Используйте `createBrowserRouter` и `RouterProvider` для определения маршрутов в одном месте.
- Для ленивой загрузки компонентов используйте `React.lazy` и `Suspense`.
- Route params и query: `useParams`, `useSearchParams`.

Пример минимальной конфигурации:

```jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/tasks', element: <Tasks /> },
  { path: '/tasks/:id', element: <TaskView /> },
])

export default function App() { return <RouterProvider router={router} /> }
```

Практический приём: выносите загрузку данных в loaders (v6.4+) для предзагрузки данных до рендера компонента.

---

## 7. Производительность, инструментирование и типичные ошибки

Когда оптимизировать?

- Сначала измеряйте (React DevTools, Profiler). Оптимизируйте узкие места.
- Оптимизация преждевременная — источник ошибок. Сначала сделайте корректно, затем профилируйте.

Типичные приёмы:

- `React.memo` для мемоизации компонент, которые часто получают те же props.
- `useCallback`/`useMemo` для стабилизации функций/значений, которые зависят от пропсов и передаются глубже.
- Виртуализация списков (react-window/react-virtual) для длинных списков.

Анти‑паттерны:

- Частая рекреация объектов/функций в props → лишние перерисовки.
- Большой Context с часто меняющимися значениями.

Suspense и concurrent features

React 18 представил concurrent rendering и улучшил взаимодействие с Suspense. Suspense хорошо работает для ленивой загрузки и для экспериментальных подходов к data fetching (Server Components / SSR + Suspense). Используйте осторожно и тестируйте поведение на медленных сетях.

Error Boundaries

Error Boundary позволяет перехватывать ошибки во время рендера и показывать запасной UI.

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(err, info) { console.error(err, info) }
  render() { return this.state.hasError ? <h2>Ошибка</h2> : this.props.children }
}
```

---

## 8. Тестирование и доступность

Тесты: React Testing Library + Jest (или Vitest). Тестируйте поведение (user events), а не реализацию. Моки для сетевых запросов и инкапсуляция сложной логики в хук/утилиту упрощают тесты.

Accessibility (A11y): используйте semantic HTML, aria‑атрибуты и инструменты типа axe для проверки.

---

## Мини‑проект: «React Todo + Router» — развёрнутое задание

Требования и подсказки:

1. Компонентная структура:
   - `App` (роутер)
   - `Header`, `Footer`
   - `TasksPage` (контейнер) → использует `useTasks` хук
   - `TaskList`, `TaskItem`, `TaskForm`
   - `About` (статическая страница)

2. Функциональность:
   - Добавление/редактирование/удаление задач.
   - Пометка выполнения (toggle).
   - Фильтры: все/активные/выполненные через роут (например, `/tasks?filter=active`).
   - Сохранение в `localStorage` (в хукe `useTasks` добавить эффект, который синхронизирует состояние).

3. Работа с сервером (опционально):
   - Имплементируйте загрузку/сохранение через fetch; при этом добавьте обработку отмены (AbortController) и состояния загрузки.
   - Если используете TanStack Query, реализуйте кэширование и инвалидацию после записи.

4. Производительность и UX:
   - Добавьте debounce для поиска/фильтрации, чтобы снизить частоту операций.
   - Используйте `React.memo` для `TaskItem`.

5. Тесты:
   - Напишите тесты на ключевые сценарии: добавление задачи, переключение completion, фильтрация.

---

## Как собрать и запустить (Windows)

Требования: Node.js 18+. Быстрая последовательность команд:

```powershell
npm create vite@latest my-react -- --template react
cd my-react
npm i
npm run dev
```

Откройте [http://localhost:5173](http://localhost:5173).

---

## Вопросы для самопроверки

- Чем отличаются состояние компонента и пропсы? Когда поднять состояние вверх?
- Какие частые ошибки с `useEffect` приводят к багам? Как работать с зависимостями?
- Когда стоит применять Context, а когда — отдельный стор (Redux/Zustand)?
- Какие приёмы помогают оптимизировать производительность списков?

Примечание: для глубокой проработки есть смысл пройти примеры в официальной документации и реализовать мини‑проект; многие детали (Server Components, Suspense for Data Fetching) развиваются — следите за релизами React и TanStack.

Компонент — функция, возвращающая дерево JSX. Пропсы — неизменяемые входные данные.

```jsx
export function Hello({ name }) {
  return <h1>Привет, {name}</h1>
}
```

Списки и ключи:

```jsx
function List({ items }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  )
}
```

Управляемые формы:

```jsx
import { useState } from 'react'

function Form() {
  const [text, setText] = useState('')
  return (
    <form onSubmit={e => { e.preventDefault(); console.log(text); setText('') }}>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button>OK</button>
    </form>
  )
}
```

## 2. Состояние и хуки

- `useState` — локальное состояние.
- `useEffect` — синхронизация с внешним миром, побочные эффекты и очистка.
- `useMemo`/`useCallback` — мемоизация вычислений/колбэков.
- `useRef` — мутабельные ссылки и доступ к DOM.
- Кастомные хуки — реюз логики.

```jsx
import { useEffect, useState } from 'react'

function useTasks() {
  const [tasks, setTasks] = useState([])
  useEffect(() => {
    const ctrl = new AbortController()
    fetch('/api/tasks', { signal: ctrl.signal })
      .then(r => r.json()).then(setTasks).catch(() => {})
    return () => ctrl.abort()
  }, [])
  return { tasks, setTasks }
}
```

## 3. Контекст и композиция

Context API для глобальных настроек/состояния, избегая глубокого проп-дриллинга.

```jsx
import { createContext, useContext } from 'react'
const ThemeCtx = createContext('light')
function useTheme() { return useContext(ThemeCtx) }
```

## 4. Маршрутизация (React Router)

```jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/tasks', element: <Tasks /> },
])

export default function App() { return <RouterProvider router={router} /> }
```

## 5. Работа с данными и перформанс

- fetch + AbortController, обработка ошибок/состояний.
- TanStack Query: кэш, инвалидация, повтор запросов.
- Мемоизация и `React.memo` для снижения повторных рендеров.
- Error Boundaries для перехвата ошибок рендера.

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(err, info) { console.error(err, info) }
  render() { return this.state.hasError ? <h2>Ошибка</h2> : this.props.children }
}
```

## Мини‑проект: «React Todo + Router»

Требования:

- Список задач (добавление/переключение/удаление), фильтры (все/активные/выполненные).
- Маршруты: `/` и `/about`; хранение в `localStorage`.
- Разнести компоненты, использовать кастомный хук `useTasks`.

---

## Как собрать и запустить (Windows)

Требования: Node.js 18+.

```powershell
npm create vite@latest my-react -- --template react
cd my-react
npm i
npm run dev
```

Откройте [http://localhost:5173](http://localhost:5173).

---

## Вопросы для самопроверки

- Чем отличаются состояние компонента и пропсы?
- Когда использовать `useEffect`, а когда достаточно вычисляемых значений?
- Как работают ключи в списках и зачем они нужны?
- Что такое Error Boundary и когда он нужен?
