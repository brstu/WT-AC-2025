import { renderLayout } from "./ui/layout.js";
import { createRouter } from "./router.js";

import { listView } from "./views/listView.js";
import { detailView } from "./views/detailView.js";
import { formView } from "./views/formView.js";

const app = document.getElementById("app");
const mount = renderLayout(app);

const router = createRouter({
  mount,
  routes: [
    { path: "/items", view: listView },
    { path: "/items/:id", view: detailView },
    { path: "/new", view: formView },
    { path: "/items/:id/edit", view: formView },
  ],
  onNotFound: async ({ mount, path }) => {
    mount.innerHTML = `
      <section class="card">
        <h2 style="margin:0 0 8px">404</h2>
        <div class="help">Маршрут <b>${path}</b> не найден.</div>
        <div style="margin-top:12px">
          <a class="btn btn--primary" href="#/items">Перейти к списку</a>
        </div>
      </section>
    `;
    return () => {};
  },
});

router.start();
