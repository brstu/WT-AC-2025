// router.js — простой hash роутер без фреймворков

const routes = [];

/**
 * Регистрирует маршрут
 * @param {string} path шаблон маршрута, например "/items/:id"
 * @param {Function} handler функция-обработчик ({ params, query })
 */
export function addRoute(path, handler) {
    routes.push({ path, handler });
}

/**
 * Программная навигация
 * @param {string} hash
 */
export function navigateTo(hash) {
    location.hash = hash;
}

/**
 * Парсинг query-параметров из hash
 * "#/items?search=abc" → { search: "abc" }
 */
function parseQuery(queryString) {
    const query = {};
    if (!queryString) return query;

    for (const part of queryString.split("&")) {
        const [key, value] = part.split("=");
        query[key] = decodeURIComponent(value || "");
    }
    return query;
}

/**
 * Сравнение текущего пути с шаблоном маршрута
 */
function match(pathname, routePath) {
    const pa = pathname.split("/");
    const ra = routePath.split("/");

    if (pa.length !== ra.length) return null;

    const params = {};

    for (let i = 0; i < ra.length; i++) {
        if (ra[i].startsWith(":")) {
            const name = ra[i].slice(1);
            params[name] = decodeURIComponent(pa[i]);
        } else if (ra[i] !== pa[i]) {
            return null;
        }
    }

    return params;
}

/**
 * Главная функция — вызывается при изменении hash
 */
function handleNavigation() {
    const hash = location.hash.slice(1) || "/items";

    const [path, queryString] = hash.split("?");
    const query = parseQuery(queryString);

    for (const route of routes) {
        const params = match(path, route.path);
        if (params) {
            return route.handler({ params, query });
        }
    }

    // Если ничего не нашли — рендерим 404
    document.getElementById("app").innerHTML = `
        <div class="error">404 — Страница не найдена</div>
    `;
}

// Подписки на события
window.addEventListener("hashchange", handleNavigation);
window.addEventListener("load", handleNavigation);
