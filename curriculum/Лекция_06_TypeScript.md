# Лекция 06. TypeScript: основы, типы, дженерики, конфигурация, интеграция

План:

1. Зачем TypeScript: проблемы JS на проектах, преимущества статической типизации.
1. Базовые типы: примитивы, литеральные типы, массивы/кортежи.
1. Объектные типы: interface vs type, расширение, пересечения.
1. Союзы и пересечения: union/intersection; сужение типов (narrowing).
1. Функции: аннотации параметров/возврата, параметры по умолчанию/опциональные, перегрузки, this, функции‑утверждения (type predicates).
1. Классы: модификаторы доступа, implements/extends, поля инициализации, параметр свойства в конструкторе.
1. Дженерики: функции, интерфейсы, классы; ограничения (extends), значения по умолчанию.
1. Полезные утилиты: Partial, Pick, Omit, Readonly, Record, ReturnType, Parameters и др.; as const, satisfies.
1. Специальные типы: any, unknown, never, void, null/undefined и strictNullChecks.
1. Дискриминируемые объединения; контроль потока; защитники типов (typeof/in/instanceof/пользовательские).
1. Конфигурация: tsconfig.json — цели (target), модули (module), пути (paths), strict, noImplicitAny, sourceMap.
1. Интеграция: tsc, ts-node, Vite (vanilla-ts), ESLint + @typescript-eslint, Prettier.
1. Типизация DOM/Fetch/async‑await, работа с внешними типами (DefinitelyTyped).

Практика:

- Переписать небольшое JS‑приложение (ToDo) на TypeScript: описать модели, функции, состояния (loading/success/error).
- Создать дженерик для пагинированного ответа API; написать пользовательский type guard.
- Настроить strict режим и исправить ошибки типизации.
- Собрать mini‑проект через Vite (шаблон vanilla‑ts) и запустить dev‑сервер.

Чтение:

- [TypeScript Handbook (RU, официальный сайт)](https://www.typescriptlang.org/ru/docs/handbook/intro.html)
- [TypeScript: Официальная документация (RU)](https://www.typescriptlang.org/ru/docs/)
- [Современный учебник JavaScript: разделы по TypeScript](https://learn.javascript.ru/typescript)
- [Vite (RU): руководство](https://ru.vitejs.dev/guide/)

Иллюстрации:

- [Логотип TypeScript (Wikimedia)](https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg "Логотип TS")

---

## Материал для лекции

### 1. Зачем TypeScript

- Статическая типизация помогает ловить ошибки на этапе разработки, улучшает автодополнение и рефакторинг, документирует API.
- TS — надстройка над JS: компилируется в обычный JavaScript; можно постепенно вводить типы в существующий проект.

Мини‑пример выгоды:

```ts
// Без TS легко ошибиться в имени поля
function printUser(u: { name: string; age: number }) {
  console.log(`${u.name} (${u.age})`)
}
// printUser({ nam: 'Ира', age: 20 }) // Ошибка компиляции: нет поля nam
printUser({ name: 'Ира', age: 20 })
```

### 2. Базовые типы

```ts
let title: string = 'Курс TS'
let count: number = 0
let isActive: boolean = true

// Массивы
const nums: number[] = [1, 2, 3]
const words: Array<string> = ['a', 'b'] // дженерик-форма

// Кортеж (фиксированная длина/типы по позициям)
const point: [number, number] = [10, 20]

// Литеральные типы
let mode: 'light' | 'dark' = 'light'
mode = 'dark'

// any (избегайте), unknown (предпочтительнее для "неизвестного")
let dataAny: any
let dataUnknown: unknown
```

### 3. Объектные типы: interface и type

```ts
// interface: можно расширять (extends), сливать объявления
interface User {
  id: number
  name: string
  email?: string // опциональное поле
}

// type: алиас типа (включая union/intersection)
type Product = {
  id: number
  title: string
  price: number
}

type Id = number | string // союз

// Расширение
interface Admin extends User {
  role: 'admin' | 'owner'
}

// Пересечение
type UserWithMeta = User & { createdAt: Date }
```

Когда выбирать interface vs type:

- interface — лучше для объектных контрактов и расширения (особенно в публичных API).
- type — универсален: позволяет выражать объединения, пересечения и пр.

### 4. Союзы, пересечения и сужение типов

```ts
function printId(id: number | string) {
  if (typeof id === 'string') { // сужение типа
    console.log(id.toUpperCase())
  } else {
    console.log(id.toFixed(2))
  }
}

// Оператор in
function hasName(x: unknown): x is { name: string } {
  return typeof x === 'object' && x !== null && 'name' in x
}
```

Дискриминируемые объединения:

```ts
interface Loading { status: 'loading' }
interface Success<T> { status: 'success'; data: T }
interface Failure { status: 'failure'; error: string }

type ApiState<T> = Loading | Success<T> | Failure

function renderState<T>(s: ApiState<T>) {
  switch (s.status) {
    case 'loading':
      return 'Загрузка...'
    case 'success':
      return JSON.stringify(s.data)
    case 'failure':
      return 'Ошибка: ' + s.error
  }
}
```

### 5. Функции: типы параметров/возврата, перегрузки, this

```ts
// Аннотации параметров и типа возврата
function sum(a: number, b: number): number { return a + b }

// Опциональные и значения по умолчанию
function greet(name = 'гость'): string { return `Привет, ${name}!` }

// Перегрузки: несколько сигнатур + одна реализация
function toArray(x: string): string[]
function toArray(x: number): number[]
function toArray(x: string | number) {
  return typeof x === 'string' ? x.split('') : [x]
}

// Предикаты типов: сузить unknown → нужный тип
function isUser(x: unknown): x is User {
  return typeof x === 'object' && x !== null && 'id' in x && 'name' in x
}
```

### 6. Классы

```ts
interface WithId { id: number }

class Base implements WithId {
  constructor(public id: number, protected createdAt: Date = new Date()) {}
}

class UserModel extends Base {
  #privateNote = 'секрет'
  constructor(id: number, public name: string) { super(id) }
}

const m = new UserModel(1, 'Ира')
```

Модификаторы:

- public (по умолчанию), protected (доступ в подклассах), private (внутри класса); `#field` — приватное поле на уровне спецификации JS.

### 7. Дженерики

```ts
function first<T>(arr: T[]): T | undefined { return arr[0] }

interface ApiResponse<T> { data: T; status: number }

type Dict<T> = Record<string, T>

function merge<A extends object, B extends object>(a: A, b: B) {
  return { ...a, ...b } as A & B
}
```

### 8. Полезные утилиты и приёмы

```ts
interface Post { id: number; title: string; body: string }

type PostPreview = Pick<Post, 'id' | 'title'>

type PostUpdate = Partial<Omit<Post, 'id'>>

const CONST = { mode: 'dark', size: 12 } as const
// CONST.mode имеет тип 'dark', size — 12 (литералы)

// satisfies — проверка соответствия без ужесточения типа значения
const routes = {
  home: '/',
  about: '/about'
} satisfies Record<string, `/${string}`>
```

Ещё полезно: `Readonly<T>`, `Required<T>`, `NonNullable<T>`, `ReturnType<T>`, `Parameters<T>`.

### 9. Специальные типы

- any — «выключение» типизации (избегайте).
- unknown — безопасная «неизвестность»: требует сужения перед использованием.
- never — не происходит никогда (выбрасывание ошибок, бесконечные циклы, исчерпывающие проверки в `switch`).
- void — отсутствие значения (часто для функций‑процедур).
- null/undefined и strictNullChecks — включайте строгий режим и учитывайте возможность `undefined`.

### 10. Конфигурация: tsconfig.json (минимум)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noImplicitAny": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

Ключевые флаги: `strict`, `noImplicitAny`, `module`, `target`, `paths/baseUrl` (для алиасов), `moduleResolution`.

### 11. Интеграция и инструменты

- Компилятор: `tsc` — компилирует TS → JS.
- Быстрый dev: Vite с шаблоном `vanilla-ts` — минимальный и удобный.
- Выполнение без сборки: `ts-node` (для скриптов/CLI; в браузере не нужен).
- ESLint: `@typescript-eslint` + Prettier для стиля и правил.
- Внешние типы: DefinitelyTyped (`npm i -D @types/…`).

### 12. Типизация DOM/Fetch/async‑await

```ts
const btn = document.querySelector<HTMLButtonElement>('#add')
btn?.addEventListener('click', () => {
  console.log('click')
})

async function loadUsers(): Promise<Array<{ id: number; name: string }>> {
  const res = await fetch('https://jsonplaceholder.typicode.com/users')
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return res.json()
}
```

---

## Практика (лабораторные мини‑задачи)

1. Перенести ToDo на TS
   - Описать тип Task { id: string; text: string; done: boolean }.
   - Типизировать функции работы с localStorage и рендер.

1. Состояния запроса как дискриминируемое объединение
   - `Loading | Success<User[]> | Failure` и функция рендера с исчерпывающим `switch`.

1. Дженерики и утилиты
   - Создать `Paginated<T> { items: T[]; total: number }` и функцию `fetchPage<T>`.
   - Применить `Pick`, `Partial`, `Readonly` к типам доменной модели.

1. Пользовательский type guard
   - Написать `isTask(x: unknown): x is Task` и покрыть её простыми тестами в DevTools/консоли.

---

## Материалы для чтения (RU)

- [TypeScript Handbook (RU)](https://www.typescriptlang.org/ru/docs/handbook/intro.html)
- [TypeScript Docs (RU)](https://www.typescriptlang.org/ru/docs/)
- [LearnJavaScript.ru: TypeScript](https://learn.javascript.ru/typescript)
- [Vite (RU): руководство](https://ru.vitejs.dev/guide/)

---

## Как собрать и запустить (Windows)

Ниже — три быстрых способа поднять окружение.

### Вариант 1. Vite (vanilla‑ts)

```powershell
npm create vite@latest ts-lecture-06 -- --template vanilla-ts
cd ts-lecture-06
npm install
npm run dev
```

- Код лежит в `src/main.ts`; правьте и смотрите горячую перезагрузку в браузере.
- Прод‑сборка:

```powershell
npm run build
```

### Вариант 2. Компилятор tsc + статический сервер

```powershell
# Инициализация TS в каталоге
npm init -y
npm i -D typescript
npx tsc --init
# создайте src/main.ts и index.html
npx tsc -w
```

В другой вкладке PowerShell:

```powershell
python -m http.server 8000
# Открыть <http://localhost:8000>
```

### Вариант 3. ts-node (CLI/скрипты)

```powershell
npm i -D ts-node
npx ts-node src/script.ts
```

---

## Мини‑шаблон проекта (TypeScript)

```text
project/
  index.html
  tsconfig.json
  src/
    main.ts
```

```html
<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>TS Практика</title>
  <style>
    body { font-family: system-ui, Arial, sans-serif; margin: 2rem; }
    .done { text-decoration: line-through; color: #6c757d }
    .error { color: #d00000 }
  </style>
</head>
<body>
  <h1>ToDo (TypeScript)</h1>
  <div>
    <input id="todo-input" placeholder="Новая задача" />
    <button id="add">Добавить</button>
  </div>
  <ul id="todos"></ul>
  <script type="module" src="./dist/main.js"></script>
</body>
</html>
```

```jsonc
// tsconfig.json (минимум)
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

```ts
// src/main.ts
interface Task { id: string; text: string; done: boolean }

const q = <T extends Element>(s: string) => document.querySelector<T>(s)!
const input = q<HTMLInputElement>('#todo-input')
const addBtn = q<HTMLButtonElement>('#add')
const list = q<HTMLUListElement>('#todos')

const KEY = 'ts-lecture-06-todos'

function read(): Task[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
function write(data: Task[]) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

function render(items: Task[]) {
  list.innerHTML = items.map((t, i) => `
    <li data-i="${i}" class="${t.done ? 'done' : ''}">
      ${t.text}
      <button data-action="toggle">Готово</button>
      <button data-action="remove">Удалить</button>
    </li>`).join('')
}

let items: Task[] = read()
render(items)

addBtn.addEventListener('click', () => {
  const text = input.value.trim()
  if (!text) return
  const task: Task = { id: crypto.randomUUID?.() || String(Date.now()), text, done: false }
  items = [...items, task]
  write(items)
  render(items)
  input.value = ''
  input.focus()
})

list.addEventListener('click', (e) => {
  const target = e.target as HTMLElement
  const li = target.closest('li') as HTMLLIElement | null
  if (!li) return
  const i = Number(li.dataset.i)
  const action = (target as HTMLElement).dataset.action
  if (action === 'toggle') {
    items = items.map((t, idx) => idx === i ? { ...t, done: !t.done } : t)
  } else if (action === 'remove') {
    items = items.filter((_, idx) => idx !== i)
  }
  write(items)
  render(items)
})
```

---

## Вопросы для самопроверки

- В чём практическая разница между `interface` и `type`? Когда что выбирать?
- Зачем `unknown`, и почему он безопаснее, чем `any`?
- Приведите пример дискриминируемого объединения и объясните, как выполняется сужение типов в `switch`.
- Для чего нужен `as const` и `satisfies`?
- Что делают утилиты `Pick`, `Omit`, `Partial`, `Readonly`? Приведите пример.

---

> Примечание: Старайтесь ориентироваться на русскоязычные источники и добавлять иллюстрации/схемы. В примерах — строгое соблюдение типовой дисциплины (strict), обработка ошибок у `fetch` и явная типизация публичных API.
