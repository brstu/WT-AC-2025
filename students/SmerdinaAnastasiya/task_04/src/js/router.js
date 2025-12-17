// Простой hash-маршрутизатор
export const Router = (function () {
    const routes = [];

    function route(path, handler) {
        routes.push({ path, handler });
    }

    function splitPath(p) {
        return p.replace(/(^\/+|\/+$)/g, "").split("/").filter(Boolean);
    }

    function match(pathname, routePath) {
        const pa = splitPath(pathname);
        const ra = splitPath(routePath);
        if (pa.length !== ra.length) return null;
        const params = {};
        for (let i = 0; i < ra.length; i++) {
            if (ra[i].startsWith(":")) {
                params[ra[i].slice(1)] = decodeURIComponent(pa[i]);
            } else if (ra[i] !== pa[i]) return null;
        }
        return params;
    }

    function parseHash() {
        const hash = location.hash.slice(1) || "/albums";
        const [path, qs = ""] = hash.split("?");
        const searchParams = Object.fromEntries(new URLSearchParams(qs));
        return { path, searchParams };
    }

    async function navigate() {
        const { path, searchParams } = parseHash();
        for (const r of routes) {
            const params = match(path, r.path);
            if (params) {
                try {
                    await r.handler({ params, query: searchParams });
                } catch (err) {
                    document.getElementById("app").innerHTML =
                        `<div class="card error">Ошибка: ${err.message}</div>`;
                }
                return;
            }
        }

        document.getElementById("app").innerHTML =
            `<div class="card"><h2>404 — Страница не найдена</h2></div>`;
    }

    function start() {
        window.addEventListener("hashchange", navigate);
        window.addEventListener("load", navigate);
    }

    function go(path, query = {}) {
        const qs = new URLSearchParams(query).toString();
        location.hash = qs ? `${path}?${qs}` : path;
    }

    return { route, start, go };
})();
