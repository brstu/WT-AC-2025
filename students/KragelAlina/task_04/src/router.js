const routes = [];

export function route(path, handler) {
  routes.push({ path, handler });
}

function match(urlPath, routePath) {
  const urlParts = urlPath.split('/').filter(Boolean);
  const routeParts = routePath.split('/').filter(Boolean);
  if (urlParts.length !== routeParts.length) return null;

  const params = {};
  for (let i = 0; i < routeParts.length; i++) {
    if (routeParts[i].startsWith(':')) {
      params[routeParts[i].slice(1)] = urlParts[i];
    } else if (routeParts[i] !== urlParts[i]) return null;
  }
  return params;
}

export function navigate() {
  let hash = location.hash.slice(1) || '/items';
  const [path, search] = hash.split('?');
  const query = new URLSearchParams(search);

  for (const r of routes) {
    const params = match(path, r.path);
    if (params !== null) {
      r.handler({ params, query });
      return;
    }
  }
  document.getElementById('app').innerHTML = '<h2 style="text-align:center;padding:4rem;color:var(--text-secondary);">404</h2>';
}

window.addEventListener('hashchange', navigate);
window.addEventListener('load', navigate);