
## Лабораторная работа 01: HTML/CSS — семантика, адаптивность и доступность
## Вариант: Сайт о любимом аниме — *Attack on Titan (Shingeki no Kyojin)*
### Описание проекта
Одностраничный сайт, посвящённый аниме **"Атака титанов"**.  
Содержит разделы:  
- **Сюжет**  
- **Персонажи**  
- **Фан-теории**  
- **Мемы**
Реализована **семантическая разметка HTML5**, **адаптивная вёрстка (mobile-first)** и **доступность (a11y)**.  
Проверено через **Lighthouse** и **W3C валидаторы**.
### Структура проекта
/
├── index.html
├── styles.css
├── assets/
│   ├── eren.jpg
│   ├── mikasa.jpg
│   ├── armin.jpg
│   ├── meme1.jpg
│   ├── meme2.jpg
│   ├── lighthouse-accessibility.png
│   ├── lighthouse-bestpractices.png
│   ├── html-validator.png
│   ├── css-validator.png
│   ├── mobile.png
│   ├── tablet.png
│   └── desktop.png
└── README.md
text---

### Архитектура вёрстки

#### 1. **Семантические элементы HTML5**
- `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- `role="banner"`, `role="main"`, `role="contentinfo"`
- `aria-labelledby` для секций
- Иерархия заголовков: `h1 → h2 → h3`

#### 2. **Адаптивность (mobile-first)**
| Брейкпоинт       | Ширина           | Особенности |
|------------------|------------------|-----------|
| **Mobile**       | `≤600px`         | 1 колонка, вертикальное меню |
| **Tablet**       | `601–1024px`     | 2 колонки, горизонтальное меню |
| **Desktop**      | `>1024px`        | 3 колонки, расширенный контейнер |

#### 3. **Flexbox и CSS Grid**
- **Навигация**: `display: flex` + `gap`, `flex-direction: column → row`
- **Сетки персонажей/мемов**:  
  ```css
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
Автоматически адаптируется под ширину экрана.
#### 4. Медиазапросы
css@media (min-width: 601px) { ... }
@media (min-width: 1025px) { ... }

## Бонусные улучшения (+10 баллов)
### Тёмная тема:
css@media (prefers-color-scheme: dark) { ... }Автоматически подстраивается под системную тему.
### Адаптивные изображения:
max-width: 100%, height: auto
Готово к использованию <picture>, srcset, sizes (при наличии разных размеров)

## Web Vitals
CLS — 0 (стабильная сетка, без сдвигов)
LCP — оптимизировано (маленькие изображения, быстрый рендер)
INP — мгновенный отклик (без JS)