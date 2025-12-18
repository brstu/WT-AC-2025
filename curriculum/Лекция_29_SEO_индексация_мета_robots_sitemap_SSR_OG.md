# Лекция 29. SEO: индексация, метаданные, robots/sitemap, SSR/SSG, Open Graph

План:

1. Как работает поиск: краулинг, индексация, ранжирование; robots.txt, sitemap.xml.
2. Метаданные: title/description, canonical, hreflang, Open Graph/Twitter Cards.
3. Структурированные данные (Schema.org/JSON‑LD): сниппеты.
4. SPA и SEO: SSR/SSG (Next.js/Nuxt/SvelteKit), динамический рендеринг.
5. Технический SEO: скорость (CWV), семантика, доступность, мобильность.
6. Практика: добавить мета‑теги, sitemap/robots, проверка через Lighthouse/Google tools.

Чтение (RU/оф. доки):

- Google Search Central: [developers.google.com/search](https://developers.google.com/search)
- MDN: [Meta теги](https://developer.mozilla.org/ru/docs/Web/HTML/Element/meta)

---

## 1. robots.txt и sitemap.xml

Определения:
- **robots.txt**: файл в корне сайта с директивами для поисковых ботов (Allow/Disallow, Sitemap).
- **Sitemap.xml**: XML со списком URL и метаданными (приоритет, частота обновления).
- **Краулинг**: обход ссылок ботом для обнаружения страниц.
- **Индексация**: добавление проанализированных страниц в поисковый индекс.

```txt
User-agent: *
Disallow: /admin
Sitemap: https://example.com/sitemap.xml
```

Пояснение: разрешаем обход всех путей кроме `/admin`; явно указываем местоположение sitemap для ускорения обнаружения URL.

Проверка: открыть `https://example.com/robots.txt`, статус 200; отправить sitemap в Search Console и получить статус «успешно обработан».

Типичные ошибки:
- случайный `Disallow: /` (полная деиндексация);
- устаревший sitemap (404 на части ссылок).

Генерация sitemap: статически или автоматически (например, плагинами фреймворков).

## 2. Метаданные и каноникал

Определения:
- **Title/Description**: ключевые мета‑теги для сниппета в выдаче.
- **Canonical**: указывает поиску основную версию при наличии дублей параметров/страниц.
- **Meta robots**: `index|noindex`, `follow|nofollow` управление индексацией и обходом ссылок.
- **Open Graph/Twitter Cards**: метаданные соцсетей для формирования карточки.

```html
<title>Каталог — Магазин</title>
<meta name="description" content="Каталог товаров, быстрая доставка.">
<link rel="canonical" href="https://example.com/catalog">
```

Пояснение: уникальный `title` и информативный `description` повышают CTR; canonical устраняет конкуренцию параметризованных URL.

Проверка: DevTools → Elements → наличие `canonical`; проверить длину `description` ≤160 символов.

Типичные ошибки:
- дублирующие title на всех страницах;
- пустой или избыточно длинный description.

Open Graph/Twitter:

```html
<meta property="og:title" content="Каталог" />
<meta property="og:description" content="Каталог товаров" />
<meta property="og:image" content="https://example.com/og.png" />
<meta name="twitter:card" content="summary_large_image" />
```

Пояснение: эти теги формируют визуальное превью при шаринге; корректный размер изображения (≥1200x630) улучшает отображение.

Проверка: прогнать URL через Facebook Sharing Debugger и Twitter Card Validator.

Типичные ошибки:
- относительные пути в `og:image`;
- использование изображения большого веса без оптимизации.

## 3. Структурированные данные (JSON‑LD)

Определения:
- **Schema.org**: спецификация типов и свойств для структурированных данных.
- **JSON‑LD**: формат вложения семантики в HTML без влияния на DOM.
- **Rich Snippet**: расширенный фрагмент в SERP (цены, рейтинг, FAQ).

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Кофеварка",
  "image": ["https://example.com/coffee.png"],
  "description": "Домашняя кофеварка",
  "offers": { "@type": "Offer", "priceCurrency": "RUB", "price": "4990" }
}
</script>
```

Пояснение: описание товара позволяет поиску вывести цену и изображение прямо в выдаче.

Проверка: Rich Results Test → отсутствие ошибок по типу Product.

Типичные ошибки:
- расхождение JSON‑LD и фактического контента;
- пропуск обязательных полей для выбранного типа.

## 4. SPA и SEO

Определения:
- **SSR**: генерация HTML на сервере при запросе.
- **SSG**: генерация HTML на этапе билда.
- **Hydration**: активация интерактивности поверх статического HTML.
- **Dynamic Rendering**: отдача предрендеренного HTML ботам (как временное решение).

- Используйте SSR/SSG (Next/Nuxt/SvelteKit) для контента, который должен индексироваться.
- Dynamic rendering (устаревающий приём) — как временная мера.

Мини‑пример (Next.js SSG):
```js
export async function getStaticProps() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json())
  return { props: { posts }, revalidate: 600 }
}

export default function Blog({ posts }) {
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
}
```

Пояснение: индексируемый список статей доступен без выполнения JS, `revalidate` обеспечивает актуальность.

Проверка: отключить JS → контент сохраняется; просмотреть исходный HTML содержит элементы списка.

Типичные ошибки:
- важный SEO‑контент грузится только после клиентского fetch;
- отсутствие периодического revalidate → устаревшие данные.

## 5. Технический SEO

Определения:
- **Core Web Vitals**: LCP (Largest Contentful Paint), CLS, INP/FID.
- **Semantic HTML**: использование тегов (`main`, `nav`, `article`) для структурирования.
- **Mobile‑friendly**: адаптация под мобильные устройства (viewport, responsive).

- Core Web Vitals, mobile‑friendly, доступность, семантическая разметка.

Мини‑пример (семантика + alt):
```html
<main>
  <article>
    <h1>Обзор кофеварки</h1>
    <img src="coffee.png" alt="Кофеварка на кухонном столе">
  </article>
</main>
```

Пояснение: семантические теги и корректный `alt` улучшают доступность и восприятие поиском.

Проверка: Lighthouse → Accessibility ≥90; вкладка Performance → оценить LCP.

Типичные ошибки:
- перегруженный DOM без структуры;
- отсутствие `alt` на информационных изображениях.

## Мини‑проект: «SEO‑улучшение учебного сайта»

Определения:
- **Checklist**: набор обязательных шагов (meta, структурированные данные, robots, sitemap).
- **Baseline Metrics**: начальные показатели (SEO score Lighthouse) до изменений.

- Добавьте title/description, canonical и OG/Twitter карточки.
- Создайте `robots.txt` и `sitemap.xml`.
- Прогоните Lighthouse (SEO) и зафиксируйте улучшения.

Пояснение: мини‑проект закрепляет основные элементы технического и контентного SEO.

Проверка: сравнить SEO score Lighthouse до/после и наличие rich snippet после индексации.

Типичные ошибки:
- валидация только в одном браузере;
- пропуск проверки структурированных данных.

---

## Как собрать и запустить (Windows)

Определения:
- **Lighthouse**: инструмент аудита производительности, SEO, доступности.
- **Manual Crawl**: ручная проверка ссылок на сайте.

Добавьте мета/OG/JSON‑LD в ваш Vite‑проект или статическую страницу и проверьте в Lighthouse (Chrome DevTools → Lighthouse → SEO).

Пояснение: Vite позволяет быстро добавлять meta в `index.html`; JSON‑LD вставляется перед закрывающим `</head>`.

Проверка: запустить Lighthouse → вкладка SEO → индикаторы «Document has a title» и «Meta description» зелёные.

Типичные ошибки:
- забыть `lang` атрибут на `<html>`;
- отсутствие viewport meta.

---

## Вопросы для самопроверки

Определения (напоминание): robots.txt, sitemap.xml, canonical, JSON‑LD, SSR/SSG, CWV.

- Зачем canonical и как он помогает с дубликатами?
- Как добавить сниппеты через Schema.org?
- Что делать с SEO в SPA без SSR?

Дополнительные вопросы:
- Чем SSR отличается от SSG по моменту генерации?
- Какие директивы можно указать в meta robots?
- Как проверить валидность JSON‑LD?
- Зачем нужен hreflang и как его оформить?
- Почему отсутствие sitemap не «ломает» SEO, но замедляет краулинг?
- Назовите два способа снижения LCP.
- Как canonical предотвращает каннибализацию трафика?

## Краткий конспект (cheat‑sheet)
- robots.txt: не закрывать нужные разделы; sitemap актуальный.
- Meta: уникальные title/description; canonical для параметров.
- OG/Twitter: карточки для соцсетей, изображения оптимизированы.
- JSON‑LD: соответствие контенту, Rich Results Test.
- SSR/SSG: индексируемый HTML + hydration.
- CWV: оптимизация изображений, критических ресурсов.

## Глоссарий (8)
- robots.txt, Sitemap, Canonical, JSON‑LD, Rich Snippet, SSR, SSG, CWV.

## Ссылки
- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)
- [Lighthouse Docs](https://developer.chrome.com/docs/lighthouse/)
