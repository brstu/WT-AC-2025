export function renderLayout(root) {
  root.innerHTML = `
    <header class="header">
      <div class="container header__row">
        <div class="brand">
          <div class="brand__title">Каталог студенческих кружков</div>
          <div class="brand__sub">Вариант 27 — список / деталь / заявка + CRUD</div>
        </div>
        <nav class="nav" aria-label="Навигация">
          <a class="pill" href="#/items">Список</a>
          <a class="pill" href="#/new">Добавить кружок</a>
        </nav>
      </div>
    </header>

    <main class="main">
      <div class="container">
        <div id="view"></div>
      </div>
    </main>
  `;

  return root.querySelector("#view");
}
