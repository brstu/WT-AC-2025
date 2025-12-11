# Лекция 14. Vue 3: реактивность, компоненты, Composition API, маршрутизация — развёрнуто

Цель лекции — дать не только набор API, но и практическую интуицию: как устроена реактивность Vue 3, когда и зачем переходить на Composition API, как правильно строить компоненты и сторы (Pinia), а также как организовать маршрутизацию и загрузку данных.

Короткая дорожная карта:

1. Почему Vue — что отличает подход и чем он удобен для обучения и продакшена.
2. Основы шаблонов и директив — когда писать шаблон, а когда JSX/TSX.
3. Реактивность: `ref`, `reactive`, `computed`, `watch`, и что происходит «под капотом».
4. Composition API и `<script setup>` — как реюзить логику, писать композаблы.
5. Компоненты: пропсы, эмиты, слоты, жизненный цикл и тестируемость.
6. Маршрутизация (Vue Router v4) и ленивые загрузки.
7. Состояние приложения: Pinia — простота по сравнению с Vuex и практические паттерны.
8. Практика: развёрнутое задание «Todo + Router + Pinia» и советы по реальной работе.

---

## 1) Зачем Vue? Краткая интуиция

Vue сочетает в себе приятный синтаксис для шаблонов (SFC — single file components), понятную реактивную модель и постепенный онбординг: можно начать с небольших виджетов и затем масштабировать приложение. По сравнению с чистым императивным управлением DOM, Vue позволяет думать в терминах состояния и реактивных зависимостей: вы обновляете модель — Vue обновляет представление.

Практические преимущества:
- Быстрый вход для новичков (HTML‑like шаблоны).
- Мощный Composition API для сложных приложений.
- Экосистема: Vue Router, Pinia, Vite, удобные плагины.

---

## 2) Основы: createApp, шаблоны и директивы

Стартовый код приложения крайне компактный:

```js
import { createApp } from 'vue'
import App from './App.vue'
createApp(App).mount('#app')
```

Шаблоны в SFC (Single File Components) — декларативные и читаемые. Основные директивы:

- `v-if` / `v-else` — условный рендеринг.
- `v-for` — итерации по массивам (не забывайте `:key`).
- `v-model` — двусторонняя привязка для контролов.
- `@click` / `@input` — слушатели событий.

Пример базового компонента:

```vue
<template>
  <p v-if="ok">OK</p>
  <ul>
    <li v-for="i in items" :key="i.id">{{ i.text }}</li>
  </ul>
  <input v-model="text" />
  <button @click="add">Добавить</button>
</template>

<script setup>
import { ref } from 'vue'
const items = ref([])
const text = ref('')
function add() {
  if (!text.value) return
  items.value.push({ id: Date.now(), text: text.value })
  text.value = ''
}
</script>
```

Советы:
- Всегда указывайте `:key` в `v-for` — это помогает Vue сохранять правильную привязку состояния и избегать перерисовки.
- Для простых динамических изменений шаблонного синтаксиса достаточно; JSX используют, если нужен программируемый контроль над деревом.

---

## 3) Реактивность: что и почему

Vue 3 реализует реактивность на основе прокси (Proxy). Основные примитивы:

- `ref(value)` — обёртка для примитивов или одиночных реактивных значений; значение доступно через `.value`.
- `reactive(obj)` — делает объект реактивным; удобно для структурированных состояний.
- `computed(() => ...)` — вычисляемое значение, которое кэшируется и пересчитывается при изменении зависимостей.
- `watch` / `watchEffect` — следят за изменениями и выполняют побочные эффекты.

Пример:

```js
import { ref, computed } from 'vue'
const items = ref([{ id: 1, text: 'a', done: true }])
const done = computed(() => items.value.filter(i => i.done))
```

Ключевые моменты:
- `ref` — хорош для простых значений и когда нужно сохранить ссылку, `reactive` — для вложенных структур.
- При передаче реактивных значений в шаблон, Vue автоматически «разворачивает» `.value`.
- `watch` полезен для асинхронных побочных эффектов (запросы, синхронизация с localStorage), `watchEffect` — для автоматического отслеживания любых зависимостей внутри блока.

Практические предупреждения:
- Не мутируйте объекты вне реактивных примитивов (потеря реактивности).
- Избегайте глубоких наблюдений, если можно — используйте явные реактивные структуры.

---

## 4) Composition API и `<script setup>` — как реюзить логику

Composition API позволяет выносить логику в функции‑композаблы (composables), похожие по роли на React hooks. `<script setup>` — синтаксический сахар, делающий компоненты компактнее.

Пример композабла `useTasks`:

```ts
// useTasks.ts
import { ref } from 'vue'
export function useTasks() {
  const items = ref([] as { id: number; text: string; done?: boolean }[])
  function add(text: string) {
    items.value.push({ id: Date.now(), text })
  }
  function toggle(id: number) {
    const it = items.value.find(i => i.id === id)
    if (it) it.done = !it.done
  }
  return { items, add, toggle }
}
```

Преимущества композиции:
- Логика сгруппирована по поведению, а не по опциям компонента.
- Легко тестировать и переиспользовать.

Советы по структуре:
- Композаблы должны быть чистыми: принимать вход/возвращать реактивные объекты или методы, не иметь побочных эффектов на уровне модуля.

---

## 5) Компоненты: пропсы, эмиты, слоты и жизненный цикл

Пропсы — входные данные; эмиты (`emit`) — callback‑события вверх. Слоты дают гибкость в композиции UI (особенно scoped slots для передачи данных от ребенка к родителю через шаблон).

Жизненные хуки в Composition API доступны через `onMounted`, `onUnmounted`, `onBeforeMount` и т.д. Используйте их для подписок, таймеров и инициализации.

Пример пропсов/эмита:

```vue
<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
const props = defineProps<{ title: string }>()
const emit = defineEmits<['select']>()
function handle() { emit('select') }
</script>
```

Тестируемость:
- Компоненты должны быть маленькими и иметь минимальную побочную логику; сложную логику выносите в композаблы и тестируйте отдельно.

---

## 6) Маршрутизация: Vue Router v4 — практические приёмы

Vue Router v4 поддерживает nested routes, lazy loading и composition‑ориентированный API. Рекоммендации:

- Организуйте маршруты модульно по фичам (feature folders).
- Используйте `defineAsyncComponent`/динамический импорт для ленивой загрузки страниц.
- Для загрузки данных используйте `route` guards или composables, вызываемые в `setup`.

Пример базового router.ts:

```ts
import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home.vue'
const routes = [
  { path: '/', component: Home },
  { path: '/tasks', component: () => import('./pages/Tasks.vue') },
]
export const router = createRouter({ history: createWebHistory(), routes })
```

Советы по UX:
- При переходе между страницами показывайте skeleton/loader — это улучшает восприятие задержек.

---

## 7) Состояние приложения: Pinia

Pinia — современная альтернатива Vuex, легче по API и интегрируется с Composition API.

Пример store:

```ts
// stores/tasks.ts
import { defineStore } from 'pinia'
export const useTasksStore = defineStore('tasks', () => {
  const items = ref<{ id: number; text: string; done?: boolean }[]>([])
  function add(text: string) { items.value.push({ id: Date.now(), text }) }
  function remove(id: number) { items.value = items.value.filter(i => i.id !== id) }
  return { items, add, remove }
})
```

Паттерны использования:
- Храните минимально необходимое в сторе; локальное UI‑состояние (модалки, временные поля) лучше держать в компоненте.
- Используйте actions для асинхронной логики (fetch, сохранение в localStorage).

---

## 8) Практика — развёрнутое задание «Vue Todo + Router + Pinia»

Требования и подсказки:

1. Компонентная структура:
   - `App` (подключает router и pinia)
   - `Header`, `Footer`
   - `TasksPage` (контейнер) → использует `useTasks` или `useTasksStore`
   - `TaskList`, `TaskItem`, `TaskForm` — презентационные компоненты
   - `About` — статическая страница

2. Функциональность:
   - CRUD задач: добавление, редактирование, удаление, пометка выполнения.
   - Фильтры: все/активные/выполненные — реализовать через query params или локальный фильтр.
   - Сохранение состояния в `localStorage` через эффект в сторе/хукe.

3. Работа с сетью (опционально):
   - Реализовать загрузку/сохранение через fetch; учитывать AbortController и состояние загрузки.
   - Для полноценных проектов — использовать TanStack Query для кэширования и синхронизации данных.

4. Тесты и A11y:
   - Написать базовые тесты на добавление задачи и фильтрацию (VTU / Vue Testing Library).
   - Проверить доступность: semantic HTML, aria‑labels у кнопок и форм.

---

## Как собрать и запустить (Windows)

Требования: Node.js 18+.

```powershell
npm create vite@latest my-vue -- --template vue
cd my-vue
npm i
npm run dev
```

Откройте [http://localhost:5173](http://localhost:5173).

---

## Вопросы для самопроверки

- В чём преимущества Composition API по сравнению с Options API?
- Когда использовать `ref` и когда `reactive`?
- Как организовать маршруты и хранение состояния во Vue 3?

Примечание: стоит пройти официальный гайд и реализовать мини‑проект — это лучший способ закрепить знания.

