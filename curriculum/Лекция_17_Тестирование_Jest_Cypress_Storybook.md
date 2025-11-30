# Лекция 17. Тестирование фронтенда: Jest, Cypress, Storybook

Цель лекции — научиться писать надёжные тесты для фронтенд-приложений, понять разницу между уровнями тестирования (unit, integration, e2e), освоить инструменты Jest, React Testing Library, Cypress/Playwright и Storybook, а также узнать, как интегрировать тестирование в CI/CD и поддерживать высокое качество кода.

Короткая карта тем:

1. Пирамида тестирования — зачем нужны разные уровни тестов и как их балансировать.
2. Jest — unit и integration тесты, моки, таймеры, снапшоты.
3. React Testing Library — тестирование UI-компонентов с фокусом на поведение пользователя.
4. Cypress и Playwright — end-to-end тесты, борьба с нестабильностью (flaky tests), best practices.
5. Storybook — документация компонентов, визуальные тесты, изоляция и переиспользование.
6. Покрытие кода, отчёты, интеграция с CI.
7. Практические задания — полный цикл тестирования Todo-приложения.

Чтение:

- Jest: <https://jestjs.io>
- React Testing Library: <https://testing-library.com/react>
- Cypress: <https://docs.cypress.io>
- Playwright: <https://playwright.dev>
- Storybook: <https://storybook.js.org/docs>

---

## 1) Пирамида тестирования — баланс между скоростью, стоимостью и уверенностью

Тестирование фронтенда не сводится к одному типу тестов. Классическая **пирамида тестирования** предлагает структуру:

```text
        /\
       /e2e\        ← мало, медленные, дорогие, но покрывают реальные сценарии
      /------\
     /integ. \      ← средний слой: проверяем взаимодействие модулей
    /----------\
   /   unit     \   ← много, быстрые, дешёвые, проверяют отдельные функции/компоненты
  /--------------\
```

### Unit-тесты (юнит-тесты)

**Что тестируем:** Изолированные функции, хуки, утилиты — без зависимостей от DOM, API, базы данных.

**Инструменты:** Jest, Vitest.

**Пример:** Проверить, что функция `sum(2, 2)` возвращает `4`.

**Преимущества:**

- Очень быстрые (миллисекунды).
- Легко локализовать проблему — если тест падает, вы точно знаете, какая функция сломалась.
- Высокая стабильность (не зависят от сети, БД, браузера).

**Недостатки:**

- Не проверяют интеграцию — функция может работать, но приложение в целом — нет.

### Integration-тесты (интеграционные тесты)

**Что тестируем:** Взаимодействие нескольких модулей/компонентов. Например, компонент + хук состояния + API-запрос (замоканный).

**Инструменты:** Jest + React Testing Library, Vue Test Utils.

**Пример:** Проверить, что при клике на кнопку "Добавить" задача появляется в списке.

**Преимущества:**

- Ближе к реальному использованию, чем unit-тесты.
- Всё ещё быстрые (секунды), потому что не запускают реальный браузер.

**Недостатки:**

- Сложнее отладка — если тест падает, нужно понять, какой из модулей виноват.

### End-to-End (e2e) тесты

**Что тестируем:** Полный путь пользователя в реальном браузере: открыть страницу, ввести данные, кликнуть кнопку, проверить результат.

**Инструменты:** Cypress, Playwright, Selenium.

**Пример:** Открыть приложение, добавить задачу, отметить как выполненную, проверить, что она отображается с галочкой.

**Преимущества:**

- Максимальная уверенность — тестируем то, что увидит пользователь.
- Покрывают интеграцию фронтенда, бэкенда, БД.

**Недостатки:**

- Медленные (секунды-минуты на тест).
- Хрупкие (flaky) — могут падать из-за задержек сети, таймаутов, изменений в UI.
- Сложнее отладка.

### Дополнительные типы тестов

- **Визуальные тесты (visual regression):** Сравнение скриншотов UI до и после изменений (инструменты: Percy, Chromatic, Playwright Visual Testing).
- **Контрактные тесты (contract tests):** Проверка, что фронтенд и бэкенд согласованы по API-контракту (Pact).
- **Accessibility (A11y) тесты:** Проверка доступности (axe-core, jest-axe).

**Практический совет:** Пирамида не догма — в зависимости от проекта можно сместить акценты. Например, в микрофронтендах больше integration-тестов, в простых лендингах — больше e2e.

---

## 2) Jest — основной инструмент для unit и integration тестов

Jest — это test runner и assertion library, разработанный Facebook для тестирования JavaScript/TypeScript кода (особенно React, но подходит для любых проектов).

### Базовый unit-тест

```ts
// sum.ts
export function sum(a: number, b: number): number {
  return a + b
}

// sum.test.ts
import { sum } from './sum'

test('adds 2 + 2 to equal 4', () => {
  expect(sum(2, 2)).toBe(4)
})

test('adds negative numbers', () => {
  expect(sum(-1, -2)).toBe(-3)
})
```

**Запуск:**

```powershell
npm test
```

Jest автоматически найдёт все файлы `*.test.ts` или `*.spec.ts` и выполнит тесты.

### Структура теста

- **describe:** Группирует связанные тесты.
- **test / it:** Определяет один тестовый сценарий.
- **expect:** Assertion — проверка ожидаемого результата.

```ts
describe('sum function', () => {
  test('adds positive numbers', () => {
    expect(sum(1, 2)).toBe(3)
  })

  test('adds zero', () => {
    expect(sum(0, 5)).toBe(5)
  })
})
```

### Моки (mocks) — замена реальных зависимостей

Моки позволяют изолировать тестируемый код от внешних зависимостей (API, файловая система, таймеры).

**Пример: мок функции**

```ts
// api.ts
export async function fetchUser(id: number) {
  const res = await fetch(`/api/users/${id}`)
  return res.json()
}

// userService.test.ts
import { fetchUser } from './api'

jest.mock('./api')

test('getUserName returns name', async () => {
  (fetchUser as jest.Mock).mockResolvedValue({ name: 'Alice' })

  const user = await fetchUser(1)
  expect(user.name).toBe('Alice')
})
```

**Зачем:** Тесты не должны зависеть от реальных API — они медленные, могут быть недоступны, и результат может меняться.

### Моки таймеров

Если функция использует `setTimeout` или `setInterval`, тесты будут медленными. Jest позволяет "ускорить" время:

```ts
jest.useFakeTimers()

test('calls callback after 1 second', () => {
  const callback = jest.fn()
  setTimeout(callback, 1000)

  jest.advanceTimersByTime(1000)
  expect(callback).toHaveBeenCalledTimes(1)
})
```

### Снапшоты (snapshots) — проверка структуры данных

Снапшоты сохраняют вывод функции или компонента и сравнивают его при следующих запусках. Полезно для проверки структуры объектов или JSX.

```ts
test('snapshot of user object', () => {
  const user = { id: 1, name: 'Alice', role: 'admin' }
  expect(user).toMatchSnapshot()
})
```

При первом запуске Jest создаст файл `__snapshots__/test.test.ts.snap`. При следующих запусках он сравнит результат со снапшотом. Если структура изменилась — тест упадёт, и вы решите: обновить снапшот (`npm test -- -u`) или исправить код.

**Осторожно:** Снапшоты удобны, но могут стать "ложным ощущением безопасности" — разработчики просто обновляют их, не проверяя, что изменилось.

### Setup и Teardown: beforeEach / afterEach

Если тесты требуют общей подготовки (например, создание mock-объектов, очистка состояния), используйте хуки:

```ts
let database: MockDatabase

beforeEach(() => {
  database = new MockDatabase()
  database.seed()
})

afterEach(() => {
  database.clear()
})

test('query returns data', () => {
  const result = database.query('SELECT * FROM users')
  expect(result).toHaveLength(3)
})
```

---

## 3) React Testing Library — тестируем поведение, а не реализацию

React Testing Library (RTL) — это библиотека для тестирования React-компонентов, которая фокусируется на **поведении пользователя**, а не на внутренней реализации (state, props, методы).

### Философия: "Тестируй так, как пользуется пользователь"

Плохой подход (тестирование реализации):

```tsx
// НЕ ДЕЛАЙТЕ ТАК
expect(component.state.count).toBe(1)
expect(wrapper.find('.button').props().onClick).toBeDefined()
```

Проблема: Если вы рефакторите компонент (меняете state на хук, переименовываете класс), тесты ломаются, хотя поведение не изменилось.

Хороший подход (тестирование поведения):

```tsx
// ДЕЛАЙТЕ ТАК
expect(screen.getByText('Счётчик: 1')).toBeInTheDocument()
fireEvent.click(screen.getByRole('button', { name: /увеличить/i }))
expect(screen.getByText('Счётчик: 2')).toBeInTheDocument()
```

**Принцип:** Тесты должны проверять то, что видит и делает пользователь, а не внутреннюю реализацию.

### Базовый пример: тестируем счётчик

```tsx
// Counter.tsx
import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <p>Счётчик: {count}</p>
      <button onClick={() => setCount(count + 1)}>Увеличить</button>
    </div>
  )
}

// Counter.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Counter } from './Counter'

test('увеличивает счётчик при клике', () => {
  render(<Counter />)

  // Проверяем начальное состояние
  expect(screen.getByText('Счётчик: 0')).toBeInTheDocument()

  // Кликаем на кнопку
  const button = screen.getByRole('button', { name: /увеличить/i })
  fireEvent.click(button)

  // Проверяем, что счётчик увеличился
  expect(screen.getByText('Счётчик: 1')).toBeInTheDocument()
})
```

### Основные API RTL

#### render — рендерим компонент в тестовой среде

```tsx
const { container, rerender, unmount } = render(<App />)
```

#### Queries (запросы) — поиск элементов

RTL предоставляет разные типы запросов в зависимости от сценария:

- **getBy\*:** Возвращает элемент или выбрасывает ошибку (используйте, когда элемент должен быть).
- **queryBy\*:** Возвращает `null`, если элемента нет (полезно для проверки отсутствия).
- **findBy\*:** Асинхронный — ждёт появления элемента (для асинхронных обновлений).

Приоритет селекторов (от лучшего к худшему):

1. **getByRole** — самый семантичный (button, textbox, heading и т.д.)
2. **getByLabelText** — для форм (связь с `<label>`)
3. **getByPlaceholderText** — для input с placeholder
4. **getByText** — для текстового контента
5. **getByTestId** — последний вариант (требует `data-testid` в коде)

Примеры:

```tsx
// По роли (лучший выбор)
screen.getByRole('button', { name: /submit/i })
screen.getByRole('textbox', { name: /email/i })

// По тексту
screen.getByText('Hello World')

// По placeholder
screen.getByPlaceholderText('Enter your name')

// По test ID (если другие способы не подходят)
screen.getByTestId('submit-button')
```

#### fireEvent и userEvent — симуляция действий пользователя

**fireEvent** — низкоуровневый API для генерации DOM-событий:

```tsx
fireEvent.click(button)
fireEvent.change(input, { target: { value: 'Alice' } })
```

**userEvent** — более реалистичная симуляция (предпочтительнее):

```tsx
import userEvent from '@testing-library/user-event'

test('типизация в поле ввода', async () => {
  const user = userEvent.setup()
  render(<App />)

  const input = screen.getByRole('textbox')
  await user.type(input, 'Hello')

  expect(input).toHaveValue('Hello')
})
```

**userEvent** более точно имитирует реальное поведение (например, `type` генерирует события keyDown, keyPress, keyUp, а не просто change).

### Тестирование асинхронного кода

Когда компонент загружает данные с API, используйте **findBy** или **waitFor**:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { UserList } from './UserList'

test('загружает и отображает пользователей', async () => {
  // Мокаем API
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve([{ id: 1, name: 'Alice' }])
    })
  ) as jest.Mock

  render(<UserList />)

  // Сначала виден лоадер
  expect(screen.getByText(/loading/i)).toBeInTheDocument()

  // Ждём появления данных
  const userName = await screen.findByText('Alice')
  expect(userName).toBeInTheDocument()
})
```

### Полный пример: Todo-приложение

```tsx
// TodoApp.tsx
import { useState } from 'react'

export function TodoApp() {
  const [todos, setTodos] = useState<string[]>([])
  const [input, setInput] = useState('')

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, input])
      setInput('')
    }
  }

  return (
    <div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Новая задача"
      />
      <button onClick={addTodo}>Добавить</button>
      <ul>
        {todos.map((todo, i) => (
          <li key={i}>{todo}</li>
        ))}
      </ul>
    </div>
  )
}

// TodoApp.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoApp } from './TodoApp'

test('добавляет задачу в список', async () => {
  const user = userEvent.setup()
  render(<TodoApp />)

  const input = screen.getByPlaceholderText('Новая задача')
  const button = screen.getByRole('button', { name: /добавить/i })

  // Вводим текст и кликаем
  await user.type(input, 'Купить молоко')
  await user.click(button)

  // Проверяем, что задача появилась
  expect(screen.getByText('Купить молоко')).toBeInTheDocument()

  // Проверяем, что поле ввода очищено
  expect(input).toHaveValue('')
})

test('не добавляет пустую задачу', async () => {
  const user = userEvent.setup()
  render(<TodoApp />)

  const button = screen.getByRole('button', { name: /добавить/i })
  await user.click(button)

  // Проверяем, что список пуст
  expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
})
```

---

## 4) Cypress и Playwright — end-to-end тестирование в реальном браузере

E2E-тесты запускают приложение в настоящем браузере и симулируют действия пользователя: открыть страницу, ввести текст, кликнуть кнопку, проверить результат. Это самые "дорогие" тесты, но они дают максимальную уверенность.

### Cypress — популярный инструмент e2e для веб-приложений

Cypress — это фреймворк для e2e-тестирования, который работает внутри браузера (в отличие от Selenium, который управляет браузером извне). Это даёт ему преимущества: быстрый debugging, автоматические retry, time-travel (просмотр состояния DOM в каждый момент).

**Установка:**

```powershell
npm i -D cypress
npx cypress open
```

Cypress создаст папку `cypress/` с примерами тестов.

### Базовый e2e-тест: Todo-приложение

```js
// cypress/e2e/todo.cy.js
describe('Todo приложение', () => {
  beforeEach(() => {
    // Перед каждым тестом открываем приложение
    cy.visit('http://localhost:5173')
  })

  it('добавляет новую задачу', () => {
    // Находим поле ввода и вводим текст
    cy.get('input[placeholder="Новая задача"]').type('Купить молоко')

    // Кликаем на кнопку "Добавить"
    cy.contains('button', 'Добавить').click()

    // Проверяем, что задача появилась в списке
    cy.contains('li', 'Купить молоко').should('exist')
  })

  it('не добавляет пустую задачу', () => {
    cy.contains('button', 'Добавить').click()

    // Проверяем, что список пуст
    cy.get('li').should('not.exist')
  })

  it('отмечает задачу как выполненную', () => {
    // Добавляем задачу
    cy.get('input[placeholder="Новая задача"]').type('Помыть посуду')
    cy.contains('button', 'Добавить').click()

    // Кликаем на чекбокс
    cy.contains('li', 'Помыть посуду').find('input[type="checkbox"]').check()

    // Проверяем, что задача отмечена
    cy.contains('li', 'Помыть посуду')
      .find('input[type="checkbox"]')
      .should('be.checked')
  })
})
```

### Основные команды Cypress

- **cy.visit(url)** — открыть страницу
- **cy.get(selector)** — найти элемент по CSS-селектору
- **cy.contains(text)** — найти элемент по тексту
- **cy.click()** — кликнуть
- **cy.type(text)** — ввести текст
- **cy.check() / cy.uncheck()** — чекбокс
- **cy.should(assertion)** — проверка (exist, be.visible, have.text, и т.д.)

### Best practices: как писать устойчивые e2e-тесты

#### 1. Используйте data-testid вместо хрупких селекторов

Плохо:

```js
cy.get('.btn-primary.large') // Сломается при изменении классов
```

Хорошо:

```js
cy.get('[data-testid="add-button"]')
```

В коде:

```tsx
<button data-testid="add-button">Добавить</button>
```

**Почему:** `data-testid` не изменится при рефакторинге стилей или структуры DOM.

#### 2. Избегайте жёстких ожиданий (hardcoded waits)

Плохо:

```js
cy.wait(3000) // Тест всегда ждёт 3 секунды, даже если ответ пришёл за 100 мс
```

Хорошо:

```js
cy.intercept('GET', '/api/todos').as('getTodos')
cy.visit('/')
cy.wait('@getTodos') // Ждём конкретный запрос
```

#### 3. Изолируйте тесты — каждый тест должен быть независимым

Каждый тест должен начинаться с чистого состояния (например, очистка БД, перезагрузка страницы).

```js
beforeEach(() => {
  cy.task('db:seed') // Очищаем и наполняем БД тестовыми данными
  cy.visit('/')
})
```

#### 4. Используйте перехваты сети (intercepts) для ускорения и стабильности

Вместо реальных API-запросов можно мокировать ответы:

```js
cy.intercept('GET', '/api/todos', { fixture: 'todos.json' })
cy.visit('/')
cy.contains('Купить молоко').should('exist')
```

Это ускоряет тесты и делает их независимыми от бэкенда.

### Playwright — современная альтернатива Cypress

Playwright (Microsoft) — более новый инструмент, который поддерживает несколько браузеров (Chromium, Firefox, WebKit) из коробки и имеет более мощный API.

**Установка:**

```powershell
npm i -D @playwright/test
npx playwright install
```

**Пример теста:**

```ts
// tests/todo.spec.ts
import { test, expect } from '@playwright/test'

test('добавляет задачу', async ({ page }) => {
  await page.goto('http://localhost:5173')

  await page.fill('input[placeholder="Новая задача"]', 'Купить молоко')
  await page.click('button:has-text("Добавить")')

  await expect(page.locator('text=Купить молоко')).toBeVisible()
})
```

**Преимущества Playwright:**

- Поддержка нескольких браузеров (Cypress пока в основном Chromium).
- Автоматические скриншоты и видео при падении тестов.
- Встроенная поддержка параллельного запуска и test sharding.

**Когда выбирать:**

- **Cypress:** Если нужен удобный UI, time-travel debugging, и работаете в основном с Chrome.
- **Playwright:** Если нужна кросс-браузерная поддержка и более мощный API.

### Борьба с flaky tests (нестабильными тестами)

Flaky tests — тесты, которые иногда проходят, иногда падают без изменений в коде. Основные причины:

1. **Таймауты и задержки:** Элемент ещё не появился, а тест уже пытается с ним взаимодействовать.
   - **Решение:** Используйте умные ожидания (`cy.should`, `expect(locator).toBeVisible()`), не `cy.wait(5000)`.

2. **Параллельные запросы и race conditions:** Два теста изменяют одни и те же данные.
   - **Решение:** Изолируйте тесты, используйте уникальные данные (user_test_123).

3. **Зависимость от внешних сервисов:** API недоступен или медленный.
   - **Решение:** Мокируйте API через `cy.intercept` / `page.route`.

4. **Анимации и переходы:** Элемент перемещается во время клика.
   - **Решение:** Отключите анимации в тестовой среде (`prefers-reduced-motion`).

---

## 5) Storybook — документация, изоляция и визуальное тестирование компонентов

Storybook — это инструмент для разработки и документирования UI-компонентов в изоляции от основного приложения. Он позволяет:

- Разрабатывать компоненты отдельно (без необходимости запускать всё приложение).
- Документировать варианты использования (states, props).
- Делать визуальные тесты (сравнение скриншотов).
- Облегчать коллаборацию дизайнеров и разработчиков.

### Установка и настройка

```powershell
npx storybook@latest init
```

Storybook автоматически обнаружит ваш фреймворк (React, Vue, Angular) и настроит конфигурацию.

**Запуск:**

```powershell
npm run storybook
```

Откроется браузер с интерактивным каталогом компонентов на <http://localhost:6006>.

### Создание story — варианты использования компонента

Story — это одна "история" или вариант использования компонента с конкретным набором props.

#### Пример: Кнопка

```tsx
// Button.tsx
interface ButtonProps {
  label: string
  variant?: 'primary' | 'secondary' | 'danger'
  onClick?: () => void
}

export function Button({ label, variant = 'primary', onClick }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  )
}

// Button.stories.ts
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'Components/Button',
  tags: ['autodocs'], // Автоматическая генерация документации
}

export default meta
type Story = StoryObj<typeof Button>

// Story 1: Primary кнопка
export const Primary: Story = {
  args: {
    label: 'Primary Button',
    variant: 'primary',
  },
}

// Story 2: Secondary кнопка
export const Secondary: Story = {
  args: {
    label: 'Secondary Button',
    variant: 'secondary',
  },
}

// Story 3: Danger кнопка
export const Danger: Story = {
  args: {
    label: 'Delete',
    variant: 'danger',
  },
}

// Story 4: С обработчиком
export const WithAction: Story = {
  args: {
    label: 'Click me',
    variant: 'primary',
  },
  play: async ({ args, canvasElement }) => {
    // Можно добавить интерактивный тест прямо в Storybook
    const button = canvasElement.querySelector('button')
    button?.click()
  },
}
```

### Преимущества Storybook

#### 1. Разработка в изоляции

Вы можете разрабатывать компонент, не запуская всё приложение и не проходя через сложные пути навигации.

#### 2. Документация компонентов

Storybook автоматически генерирует документацию из JSDoc/TypeScript типов и stories:

```tsx
/**
 * Кнопка для основных действий
 */
export function Button({ label, variant = 'primary' }: ButtonProps) {
  // ...
}
```

В Storybook появится описание, список props и их типы.

#### 3. Визуальные тесты (Visual Regression Testing)

Storybook интегрируется с инструментами визуального тестирования (Chromatic, Percy), которые делают скриншоты stories и сравнивают их при каждом коммите.

**Пример с Chromatic:**

```powershell
npm i -D chromatic
npx chromatic --project-token=YOUR_TOKEN
```

Chromatic сделает скриншоты всех stories и покажет diff, если UI изменился.

#### 4. Тестирование взаимодействий (Interaction Testing)

С помощью `@storybook/test` и `play` функций можно писать интерактивные тесты прямо в stories:

```tsx
import { userEvent, within } from '@storybook/test'

export const FormSubmit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    const button = canvas.getByRole('button')

    await userEvent.type(input, 'Hello World')
    await userEvent.click(button)

    // Проверяем, что форма отправилась
    await expect(canvas.getByText('Success!')).toBeInTheDocument()
  },
}
```

### Организация stories: Component Story Format (CSF 3)

Современный формат CSF 3 использует объекты для определения stories:

```tsx
export default {
  component: Button,
  title: 'Design System/Button',
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
    },
  },
}

export const Default = {}
export const Large = { args: { size: 'large' } }
```

### Addon: расширения Storybook

Storybook имеет богатую экосистему аддонов:

- **@storybook/addon-actions** — логирование событий (onClick, onChange)
- **@storybook/addon-controls** — интерактивное изменение props в UI
- **@storybook/addon-a11y** — проверка доступности (A11y)
- **@storybook/addon-viewport** — тестирование на разных экранах (mobile, tablet, desktop)

**Пример использования actions:**

```tsx
import { action } from '@storybook/addon-actions'

export const WithAction: Story = {
  args: {
    onClick: action('button-clicked'),
  },
}
```

При клике на кнопку в Storybook вы увидите лог в панели Actions.

---

## 6) Покрытие кода, отчёты и интеграция с CI

### Покрытие кода (Code Coverage)

Покрытие показывает, какой процент кода покрыт тестами. Jest имеет встроенную поддержку покрытия.

**Включение покрытия:**

```powershell
npm test -- --coverage
```

**Результат:**

```text
File      | % Stmts | % Branch | % Funcs | % Lines
----------|---------|----------|---------|--------
sum.ts    |   100   |   100    |   100   |   100
utils.ts  |    75   |    50    |    80   |    75
```

- **Statements:** Процент выполненных инструкций.
- **Branches:** Покрытие условных ветвлений (if/else).
- **Functions:** Процент вызванных функций.
- **Lines:** Покрытие строк кода.

**Настройка порогов в package.json или jest.config.js:**

```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

Если покрытие ниже порога, Jest выдаст ошибку.

**Важно:** Высокое покрытие ≠ качественные тесты. 100% покрытие не гарантирует отсутствие багов — важно качество assertions.

### HTML-отчёты

Jest может генерировать HTML-отчёты покрытия:

```powershell
npm test -- --coverage --coverageReporters=html
```

Откройте `coverage/index.html` в браузере — увидите детальный отчёт по каждому файлу с подсветкой непокрытых строк.

### Интеграция с CI/CD

#### GitHub Actions пример

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm test -- --coverage
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
```

#### GitLab CI пример

```yaml
# .gitlab-ci.yml
test:
  image: node:20
  script:
    - npm ci
    - npm test -- --coverage
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
```

#### Сервисы покрытия

- **Codecov** (<https://codecov.io>) — отслеживание покрытия по коммитам, показ diff в PR.
- **Coveralls** (<https://coveralls.io>) — аналогично Codecov.
- **SonarQube** — комплексный анализ качества кода (покрытие, code smells, security).

---

## 7) Мини-проект: полное тестирование Todo-приложения

Требования: написать полный набор тестов для Todo-приложения на трёх уровнях.

### Функционал приложения

- Добавление задачи.
- Отметка задачи как выполненной (чекбокс).
- Фильтрация задач (все / активные / завершённые).
- Удаление задачи.

### Уровень 1: Unit-тесты для утилит

```ts
// utils/filterTodos.ts
export type Todo = { id: number; text: string; completed: boolean }

export function filterTodos(todos: Todo[], filter: 'all' | 'active' | 'completed'): Todo[] {
  if (filter === 'active') return todos.filter(t => !t.completed)
  if (filter === 'completed') return todos.filter(t => t.completed)
  return todos
}

// utils/filterTodos.test.ts
import { filterTodos, Todo } from './filterTodos'

describe('filterTodos', () => {
  const todos: Todo[] = [
    { id: 1, text: 'Buy milk', completed: false },
    { id: 2, text: 'Walk dog', completed: true },
    { id: 3, text: 'Read book', completed: false },
  ]

  test('возвращает все задачи для фильтра "all"', () => {
    expect(filterTodos(todos, 'all')).toEqual(todos)
  })

  test('возвращает только активные задачи', () => {
    const result = filterTodos(todos, 'active')
    expect(result).toHaveLength(2)
    expect(result.every(t => !t.completed)).toBe(true)
  })

  test('возвращает только завершённые задачи', () => {
    const result = filterTodos(todos, 'completed')
    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('Walk dog')
  })
})
```

### Уровень 2: Integration-тесты с React Testing Library

```tsx
// TodoApp.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoApp } from './TodoApp'

describe('TodoApp', () => {
  test('добавляет новую задачу', async () => {
    const user = userEvent.setup()
    render(<TodoApp />)

    const input = screen.getByPlaceholderText(/новая задача/i)
    const button = screen.getByRole('button', { name: /добавить/i })

    await user.type(input, 'Buy milk')
    await user.click(button)

    expect(screen.getByText('Buy milk')).toBeInTheDocument()
  })

  test('отмечает задачу как выполненную', async () => {
    const user = userEvent.setup()
    render(<TodoApp />)

    // Добавляем задачу
    await user.type(screen.getByPlaceholderText(/новая задача/i), 'Walk dog')
    await user.click(screen.getByRole('button', { name: /добавить/i }))

    // Кликаем на чекбокс
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(checkbox).toBeChecked()
  })

  test('фильтрует активные задачи', async () => {
    const user = userEvent.setup()
    render(<TodoApp />)

    // Добавляем две задачи
    const input = screen.getByPlaceholderText(/новая задача/i)
    await user.type(input, 'Task 1')
    await user.click(screen.getByRole('button', { name: /добавить/i }))

    await user.type(input, 'Task 2')
    await user.click(screen.getByRole('button', { name: /добавить/i }))

    // Отмечаем первую задачу
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    // Кликаем на фильтр "Активные"
    await user.click(screen.getByRole('button', { name: /активные/i }))

    // Проверяем, что видна только одна задача
    expect(screen.getByText('Task 2')).toBeInTheDocument()
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument()
  })

  test('удаляет задачу', async () => {
    const user = userEvent.setup()
    render(<TodoApp />)

    await user.type(screen.getByPlaceholderText(/новая задача/i), 'Delete me')
    await user.click(screen.getByRole('button', { name: /добавить/i }))

    const deleteButton = screen.getByRole('button', { name: /удалить/i })
    await user.click(deleteButton)

    expect(screen.queryByText('Delete me')).not.toBeInTheDocument()
  })
})
```

### Уровень 3: E2E-тесты с Cypress

```js
// cypress/e2e/todo.cy.js
describe('Todo E2E', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173')
  })

  it('полный сценарий: добавление, отметка, фильтрация, удаление', () => {
    // Добавляем первую задачу
    cy.get('input[placeholder*="Новая задача"]').type('Buy milk')
    cy.contains('button', 'Добавить').click()
    cy.contains('Buy milk').should('exist')

    // Добавляем вторую задачу
    cy.get('input[placeholder*="Новая задача"]').type('Walk dog')
    cy.contains('button', 'Добавить').click()

    // Отмечаем первую задачу как выполненную
    cy.contains('li', 'Buy milk').find('input[type="checkbox"]').check()

    // Фильтруем активные задачи
    cy.contains('button', 'Активные').click()
    cy.contains('Walk dog').should('exist')
    cy.contains('Buy milk').should('not.exist')

    // Фильтруем завершённые задачи
    cy.contains('button', 'Завершённые').click()
    cy.contains('Buy milk').should('exist')
    cy.contains('Walk dog').should('not.exist')

    // Показываем все задачи
    cy.contains('button', 'Все').click()
    cy.contains('Buy milk').should('exist')
    cy.contains('Walk dog').should('exist')

    // Удаляем задачу
    cy.contains('li', 'Walk dog').find('button[aria-label="Удалить"]').click()
    cy.contains('Walk dog').should('not.exist')
  })

  it('не добавляет пустую задачу', () => {
    cy.contains('button', 'Добавить').click()
    cy.get('li').should('not.exist')
  })

  it('сохраняет задачи при перезагрузке страницы', () => {
    cy.get('input[placeholder*="Новая задача"]').type('Persistent task')
    cy.contains('button', 'Добавить').click()

    cy.reload()

    cy.contains('Persistent task').should('exist')
  })
})
```

### Уровень 4: Storybook stories

```tsx
// TodoApp.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { TodoApp } from './TodoApp'

const meta: Meta<typeof TodoApp> = {
  component: TodoApp,
  title: 'App/TodoApp',
}

export default meta
type Story = StoryObj<typeof TodoApp>

export const Empty: Story = {}

export const WithTodos: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText(/новая задача/i)
    const button = canvas.getByRole('button', { name: /добавить/i })

    await userEvent.type(input, 'Buy milk')
    await userEvent.click(button)

    await userEvent.type(input, 'Walk dog')
    await userEvent.click(button)
  },
}

export const WithCompletedTodo: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText(/новая задача/i)

    await userEvent.type(input, 'Done task')
    await userEvent.click(canvas.getByRole('button', { name: /добавить/i }))

    const checkbox = canvas.getByRole('checkbox')
    await userEvent.click(checkbox)
  },
}
```

### Запуск всех тестов

```powershell
# Unit и Integration тесты
npm test

# E2E тесты
npm run dev  # Запустить dev-сервер в отдельном терминале
npx cypress run

# Storybook
npm run storybook
```

### Метрики успеха проекта

- ✅ Все unit-тесты проходят (покрытие >80%).
- ✅ RTL-тесты покрывают основные пользовательские сценарии.
- ✅ E2E-тесты проходят без flaky failures.
- ✅ Storybook stories созданы для основных состояний компонентов.
- ✅ CI настроен и автоматически запускает тесты.

---

## Как настроить окружение для тестирования (Windows)

### Шаг 1: Установка Jest и React Testing Library

```powershell
# Jest и типы для TypeScript
npm i -D jest @types/jest ts-jest

# React Testing Library
npm i -D @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Конфигурация Jest для React/TypeScript
npx ts-jest config:init
```

**jest.config.js:**

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
}
```

**jest.setup.js:**

```js
import '@testing-library/jest-dom'
```

### Шаг 2: Установка Cypress

```powershell
npm i -D cypress
npx cypress open
```

Cypress создаст папку `cypress/` с примерами. Добавьте скрипт в `package.json`:

```json
{
  "scripts": {
    "test:e2e": "cypress open",
    "test:e2e:ci": "cypress run"
  }
}
```

### Шаг 3: Установка Playwright (альтернатива Cypress)

```powershell
npm i -D @playwright/test
npx playwright install
```

**playwright.config.ts:**

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
})
```

### Шаг 4: Установка Storybook

```powershell
npx storybook@latest init
npm run storybook
```

Storybook автоматически настроит конфигурацию для вашего фреймворка.

### Шаг 5: Добавление скриптов в package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "cypress open",
    "test:e2e:ci": "cypress run",
    "test:playwright": "playwright test",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

---

## Рекомендации по организации тестов в проекте

### Структура файлов

```text
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx        ← RTL тесты
│   │   ├── Button.stories.tsx     ← Storybook stories
│   │   └── Button.module.css
│   └── TodoList/
│       ├── TodoList.tsx
│       ├── TodoList.test.tsx
│       └── TodoList.stories.tsx
├── utils/
│   ├── filterTodos.ts
│   └── filterTodos.test.ts        ← Unit тесты
├── hooks/
│   ├── useTodos.ts
│   └── useTodos.test.ts
└── App.test.tsx                   ← Integration тесты

cypress/
├── e2e/
│   ├── todo.cy.js                 ← E2E тесты
│   └── auth.cy.js
└── support/
    └── commands.js

tests/                             ← Playwright тесты (опционально)
├── todo.spec.ts
└── fixtures/
    └── todos.json
```

### Конвенции именования

- Unit/Integration тесты: `ComponentName.test.tsx` или `functionName.test.ts`
- E2E Cypress: `feature.cy.js` или `user-flow.cy.js`
- Playwright: `feature.spec.ts`
- Storybook: `ComponentName.stories.tsx`

### Что тестировать на каждом уровне

| Уровень | Что тестировать | Примеры |
|---------|-----------------|---------|
| **Unit** | Чистые функции, утилиты, хуки (без UI) | `filterTodos`, `formatDate`, `usePagination` |
| **Integration** | Компоненты + их взаимодействие с состоянием/хуками | `TodoApp` (добавление, удаление, фильтрация) |
| **E2E** | Полные пользовательские сценарии (UI + API + БД) | Регистрация → логин → добавление задачи → выход |
| **Visual** | Внешний вид компонентов | Скриншоты кнопок, форм, карточек |

---

## Вопросы для самопроверки

1. **Чем отличается unit от integration и e2e тестов?**
   - Unit: тестируют изолированные функции/модули без зависимостей.
   - Integration: проверяют взаимодействие нескольких модулей.
   - E2E: симулируют полный путь пользователя в реальном браузере.

2. **Почему важно тестировать поведение, а не реализацию?**
   - Тесты, завязанные на реализацию (state, внутренние методы), ломаются при рефакторинге, даже если поведение не изменилось.

3. **Как бороться с flaky e2e-тестами?**
   - Использовать умные ожидания (не hardcoded `wait(5000)`).
   - Мокировать API-запросы.
   - Изолировать тесты (каждый начинается с чистого состояния).
   - Отключать анимации.

4. **Зачем нужен Storybook в команде?**
   - Документация компонентов.
   - Разработка в изоляции.
   - Визуальные тесты (скриншоты).
   - Облегчение коллаборации дизайнеров и разработчиков.

5. **Что такое code coverage и какой процент достаточен?**
   - Coverage показывает, какой процент кода покрыт тестами. Нет универсального порога, но обычно стремятся к 70-90%. Важно не количество, а качество тестов.

6. **В чём разница между Cypress и Playwright?**
   - Cypress: удобный UI, time-travel debugging, в основном Chromium.
   - Playwright: кросс-браузерность (Chromium, Firefox, WebKit), более мощный API, встроенная поддержка параллелизма.

---

## Дополнительное чтение и ресурсы

- **"Testing JavaScript" (Kent C. Dodds):** <https://testingjavascript.com> — курс от автора React Testing Library.
- **Jest документация:** <https://jestjs.io/docs/getting-started>
- **React Testing Library:** <https://testing-library.com/docs/react-testing-library/intro>
- **Cypress Best Practices:** <https://docs.cypress.io/guides/references/best-practices>
- **Playwright документация:** <https://playwright.dev/docs/intro>
- **Storybook Tutorial:** <https://storybook.js.org/tutorials/>
- **Martin Fowler — Test Pyramid:** <https://martinfowler.com/articles/practical-test-pyramid.html>

---

## Резюме

- **Пирамида тестирования** помогает балансировать между скоростью, стоимостью и уверенностью: больше unit-тестов, меньше e2e.
- **Jest** — основной инструмент для unit и integration тестов, поддерживает моки, снапшоты, покрытие.
- **React Testing Library** учит тестировать поведение пользователя, а не внутреннюю реализацию.
- **Cypress/Playwright** — мощные инструменты для e2e-тестов; важно писать устойчивые тесты (data-testid, умные ожидания).
- **Storybook** — не только документация, но и изоляция компонентов и визуальные тесты.
- **CI/CD интеграция** — автоматизируйте запуск тестов, отслеживайте покрытие, используйте сервисы (Codecov, Chromatic).

**Практический совет:** Начните с unit-тестов для критичной бизнес-логики, добавьте integration-тесты для ключевых компонентов, и несколько e2e-тестов для критичных путей пользователя (регистрация, оплата). Не гонитесь за 100% покрытием — лучше 80% качественных тестов, чем 100% формальных.
