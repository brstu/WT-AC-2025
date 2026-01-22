# Лабораторная работа 07 — Краткий отчёт по проекту

**Студент:** Колодич Максим
**Вариант:** Каталог курсов/уроков с формами.

## Описание проекта

Приложение — SPA «Course Manager» для просмотра, создания, редактирования и удаления курсов: каталог, детальная страница курса и формы для создания/редактирования (CRUD).

## Технологии и библиотеки

- React (ленивая загрузка страниц через `React.lazy` + `Suspense`)
- TypeScript
- Vite (dev сервер / сборка)
- React Router (пара основных маршрутов и `ProtectedRoute`)
- TanStack React Query (`useQuery`, `useMutation`, кэширование и инвалидация)
- axios для запросов
- React Hook Form + Zod (валидация форм)
- react-toastify (уведомления)

## Структура (важные файлы)

- `src/routes.tsx` — маршрутизация приложения (lazy-load)
- `src/features/courses/api/coursesApi.ts` — хуки React Query: `useCourses`, `useCourse`, `useCreateCourse`, `useUpdateCourse`, `useDeleteCourse`
- `src/features/courses/components/CourseList.tsx` — список курсов, удаление
- `src/features/courses/components/CourseDetail.tsx` — детальная страница курса
- `src/features/courses/components/CourseForm.tsx` — форма создания/редактирования с валидацией Zod
- `src/shared/components/ThemeToggle.tsx`, `useTheme.ts` — переключение темы
- `src/shared/components/ProtectedRoute.tsx` — защита маршрутов
- `src/shared/components/Loader.tsx`, `ErrorMessage.tsx` — UI для состояний загрузки/ошибки

## Главные функции и поведение

- Маршруты:
  - `/` — список курсов
  - `/courses/:id` — деталь курса
  - `/new` — создание (защищён)
  - `/edit/:id` — редактирование (защищён)
  - `/login` — страница входа
  - `*` — 404
- CRUD:
  - Чтение списка и детали через `useQuery`
  - Создание/обновление/удаление через `useMutation` с инвалидацией `['courses']`
- Оптимистичные обновления:
  - В `useCreateCourse` используется `onMutate` для добавления временного элемента в кэш и отката при ошибке
- Формы:
  - Валидация Zod (например, `title.min(3)`, `body.min(10)`)
  - Ошибки показываются рядом с полями
- UI/UX:
  - Загрузка и ошибки обрабатываются компонентами `Loader` / `ErrorMessage`
  - Подтверждение удаления через `window.confirm` и уведомления через `toast`
  - Тёмная/светлая темы через `ThemeToggle` и `useTheme`

## API / Конфигурация

- Базовый URL: `import.meta.env.VITE_API_URL` — в коде конструируется как `${VITE_API_URL}/posts` для работы с ресурсом `posts`.

## Команды (обычные для проекта на Vite)

```bash
# Установить зависимости
npm install

# Запуск dev сервера
npm run dev

# Сборка
npm run build

# Предпросмотр сборки
npm run preview
```

## Короткие замечания / рекомендации

- Проект аккуратно использует React Query для кэша и операций мутаций — есть инвалидация и оптимистичный патч.
- Есть простая защита маршрутов и тема — хорошая базовая реализация полного CRUD-приложения.
- Если нужно, могу расширить отчёт: добавить скриншоты, примеры запросов, или привести точные версии зависимостей (из `package.json`).
