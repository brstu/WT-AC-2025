# Лекция 05. CSS: блочная модель и позиционирование

План:
- Блочная модель: content, padding, border, margin
- Свойство display: block, inline, inline-block, none
- Позиционирование: static, relative, absolute, fixed

Практика: сверстать макет с использованием блочной модели.

Чтение: MDN Web Docs (Box model), css-tricks.com

## Материал для лекции

### 1. Блочная модель
**Теория:**  
Каждый элемент состоит из содержимого (content), внутренних отступов (padding), границы (border) и внешних отступов (margin).

**Пример:**
```css
.box {
  margin: 10px;
  padding: 20px;
  border: 2px solid #000;
}
```

### 2. Свойство display
- `display: block;`
- `display: inline;`
- `display: inline-block;`
- `display: none;`

### 3. Позиционирование
- `position: static;`
- `position: relative;`
- `position: absolute;`
- `position: fixed;`

---

**Практика:**
- Создайте несколько блоков с разными отступами и позиционированием.
- Для начинающих:  
  - Изменяйте свойства display и position, наблюдайте результат.
