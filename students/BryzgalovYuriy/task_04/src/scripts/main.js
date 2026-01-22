import { createRouter } from "./router.js";
import { renderList } from "./views/list.js";
import { renderDetail } from "./views/detail.js";
import { renderNew, renderEdit } from "./views/form.js";
import { renderState } from "./utils.js";

const app = document.getElementById("app");

function withLayout(fn) {
  return async (params) => {
    try {
      await fn(app, params);
    } catch (e) {
      app.innerHTML = renderState({
        title: "Ошибка приложения",
        text: "Произошла непредвиденная ошибка."
      });
      console.error(e);
    }
  };
}

const router = createRouter([
  { pattern: /^#\/items(?:\?.*)?$/, handler: withLayout((app) => renderList(app)) },
  { pattern: /^#\/items\/(?<id>\d+)$/, handler: withLayout((app, p) => renderDetail(app, p)) },
  { pattern: /^#\/new$/, handler: withLayout((app) => renderNew(app)) },
  { pattern: /^#\/items\/(?<id>\d+)\/edit$/, handler: withLayout((app, p) => renderEdit(app, p)) },
  // fallback
  { pattern: /^#.*$/, handler: async () => (location.hash = "#/items") }
]);

router.run();
