# Архитектура вёрстки

## Общий подход

- **Mobile First**: вёрстка реализована по принципу "сначала мобильные устройства" с постепенным усложнением для планшетов и десктопов
- **CSS Grid + Flexbox**: комбинированное использование современных технологий раскладки
- **Адаптивный дизайн**: плавное изменение интерфейса для разных размеров экранов

## Ключевые структурные элементы

### Flexbox контейнеры

- **Шапка**: `.header-content` - горизонтальное выравнивание логотипа и навигации
- **Навигация**: `.nav-list` - горизонтальное меню навигации
- **Биография**: `.bio-content` - расположение изображения и текста
- **Футер**: `.footer-content` - распределение элементов в подвале
- **Кнопки и формы**: `.button`, `.form-group` - центрирование и выравнивание

### CSS Grid области

- **Сетка альбомов**: `.albums-grid` - адаптивная сетка карточек с альбомами
- **Сетка фан-арта**: `.fanart-grid` - сетка для галереи фан-арта
- **Раздел вступления**: `.join-content` - двухколоночный макет для форм
- **Отзывчивые колонки**:
  - Мобильные: 1 колонка
  - Планшеты: 2 колонки
  - Десктоп: 3-4 колонки (в зависимости от контента)

## Медиазапросы

### Мобильные устройства (≤600px)

```css
@media (max-width: 600px) {
  /* Мобильная навигация */
  .nav { display: none; }
  .nav.active { display: block; }
  
  /* Одноколоночные сетки */
  .albums-grid,
  .fanart-grid,
  .bio-content,
  .join-content {
    grid-template-columns: 1fr;
  }
  
  /* Адаптивные отступы */
  :root {
    --space-md: 1rem;
    --space-lg: 2rem;
  }
}
```

### Планшеты (601–1024px)

```css
@media (max-width: 1024px) {
  /* Двухколоночная сетка альбомов */
  .albums-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  /* Четырёхколоночная сетка фан-арта */
  .fanart-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  /* Двухколоночная биография */
  .bio-content {
    grid-template-columns: 1fr 1fr;
  }
}
```

### Десктопы (>1024px)

```css
@media (min-width: 1024px) {
  /* Трёхколоночная сетка альбомов */
  .albums-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  /* Четырёхколоночная сетка фан-арта */
  .fanart-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  /* Двухколоночный макет вступления */
  .join-content {
    grid-template-columns: 1fr 1fr;
  }
  
  /* Максимальная ширина контента */
  .container {
    max-width: 1200px;
  }
}
```

## Особенности доступности

- **Skip-link**: скрытая ссылка `.skip-link` для перехода к основному контенту
- **Семантические теги**: правильная HTML5 разметка (`header`, `nav`, `main`, `section`, `article`, `footer`)
- **Атрибуты ARIA**: `aria-label`, `aria-expanded`, `role` для улучшения доступности
- **Контрастность**: поддержка `prefers-contrast: high` и `prefers-color-scheme: dark`
- **Фокус-индикаторы**: четкое визуальное выделение активных элементов
- **Минимальные размеры касания**: 44px для кликабельных элементов на мобильных устройствах
- **Плавная прокрутка**: `scroll-behavior: smooth` для навигации по якорям

## CSS Переменные

Используется система CSS-переменных для единообразного управления стилями:

```css
:root {
  /* Цветовая схема */
  --primary: #6c63ff;
  --primary-dark: #554fd8;
  --accent: #ff6584;
  --dark: #1a1a2e;
  --light: #f8f9fa;
  
  /* Типографика */
  --font-main: 'Open Sans', sans-serif;
  --font-heading: 'Montserrat', sans-serif;
  
  /* Размеры скруглений */
  --radius: 8px;
  --radius-lg: 16px;
  
  /* Тени и переходы */
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
  
  /* Отступы */
  --space-sm: 1rem;
  --space-md: 2rem;
  --space-lg: 3rem;
}
```

## Методология именования классов

- **БЭМ-подобная структура**: `.block__element--modifier`
- **Семантические имена**: `.bio-content`, `.album-card`, `.fanart-item`
- **Утилитарные классы**: `.container`, `.button`, `.section`

## Оптимизации производительности

- **Минификация CSS**: удаление пробелов и комментариев
- **Оптимизация изображений**: использование CSS-градиентов вместо реальных изображений в демо-версии
- **Ленивая загрузка**: может быть добавлена для реальных изображений
- **Оптимизированные шрифты**: Google Fonts с `preconnect` и правильными атрибутами

## Поддержка браузеров

- **Modern browsers**: Chrome, Firefox, Safari, Edge (последние 2 версии)
- **Fallback для старых браузеров**: использование flexbox как fallback для grid
- **Постепенное улучшение**: базовая функциональность работает даже без поддержки grid

## Структура файлов

```bash

├── index.html          # Основной HTML-файл
├── styles.css         # Все стили проекта
└── README.md         # Документация (этот файл)
```

## Lighthouse

### Mobile

![lighthouse_mobile](./image/lighthouse_mobile.png)

### Desktop

![lighthouse_desktop](./image/lighthouse_desktop.png)

## Валидаторы HTML/CSS

### HTML

![HTML](./image/html_validator.png)

### CSS

![CSS](./image/css_validator.png)
