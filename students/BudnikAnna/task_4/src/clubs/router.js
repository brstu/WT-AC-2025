import { parseHash } from "./utils/hash.js";

function compile(pattern) {
  const keys = [];
  const rx =
    "^" +
    pattern.replace(/:[^/]+/g, (m) => {
      keys.push(m.slice(1));
      return "([^/]+)";
    }) +
    "$";
  return { regex: new RegExp(rx), keys };
}

export function createRouter({ mount, routes, onNotFound }) {
  const compiled = routes.map((r) => ({ ...r, ...compile(r.path) }));
  let cleanup = null;

  function match(path) {
    for (const r of compiled) {
      const m = path.match(r.regex);
      if (m) {
        const params = {};
        r.keys.forEach((k, i) => (params[k] = m[i + 1]));
        return { route: r, params };
      }
    }
    return null;
  }

  async function render() {
    if (typeof cleanup === "function") cleanup();
    cleanup = null;

    const { path, query } = parseHash();
    const found = match(path);

    if (!found) {
      cleanup = await onNotFound({ mount, path, query });
      return;
    }

    cleanup = await found.route.view({ mount, params: found.params, query });
  }

  function start() {
    window.addEventListener("hashchange", render);
    window.addEventListener("load", render);
    render();
  }

  return { start, render };
}
