# MusicBrainz Explorer

Современное веб-приложение для поиска и просмотра артистов из крупнейшей в мире открытой музыкальной базы — [MusicBrainz.org](https://musicbrainz.org).

## Особенности

- Полностью на **Next.js 15+ (App Router)** + React Server Components
- Молниеносная загрузка данных прямо на сервере (SSR + Streaming)
- Поиск артистов с пагинацией и кэшированием через **TanStack Query**
- Красивые детальные страницы с табами: информация, релизы, теги, ссылки
- Адаптивный и современный UI (Tailwind CSS + shadcn/ui-style компоненты)
- SEO-дружелюбные метаданные и Open Graph
- Кастомная 404-страница и обработка ошибок
- Полностью на TypeScript
- Никаких лишних зависимостей — чистый, быстрый, современный стек 2025 года

## Стек

| Технология           | Назначение                          |
|----------------------|-------------------------------------|
| Next.js 15+          | App Router, Server Components       |
| React 19             | UI                                  |
| TypeScript           | Типобезопасность                    |
| Tailwind CSS         | Стили                               |
| TanStack Query       | Управление данными и кэширование    |
| Lucide React         | Иконки                              |

## Быстрый старт

```bash
cd musicbrainz-explorer

npm install
# или pnpm / yarn
npm run dev
```
