export function createRouter(routes) {
  function matchRoute(hash) {
    const clean = (hash || "#/items").split("?")[0];
    for (const r of routes) {
      const m = clean.match(r.pattern);
      if (m) return { handler: r.handler, params: m.groups || {} };
    }
    return null;
  }

  async function run() {
    const h = location.hash || "#/items";
    const matched = matchRoute(h);
    if (!matched) {
      location.hash = "#/items";
      return;
    }
    await matched.handler(matched.params);
  }

  window.addEventListener("hashchange", run);
  window.addEventListener("load", run);

  return { run };
}
