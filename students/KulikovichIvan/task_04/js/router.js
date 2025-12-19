const Router = (function () {
    const routes = [];
    let currentRoute = null;
    const history = [];
    const maxHistory = 10;

    function addToHistory(path) {
        if (history[history.length - 1] !== path) {
            history.push(path);
            if (history.length > maxHistory) {
                history.shift();
            }
        }
    }

    function isAuthenticated() {
        const token = localStorage.getItem('authToken');
        return !!token;
    }

    function updateActiveLinks(currentPath) {
        document.querySelectorAll('nav a').forEach(link => {
            const linkPath = link.getAttribute('href').substring(1);
            if (currentPath.startsWith(linkPath) && linkPath !== '') {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    function saveScrollPosition() {
        const key = `scroll_${window.location.hash}`;
        sessionStorage.setItem(key, window.scrollY);
    }

    function restoreScrollPosition() {
        const key = `scroll_${window.location.hash}`;
        const savedPosition = sessionStorage.getItem(key);
        
        if (savedPosition !== null) {
            setTimeout(() => {
                window.scrollTo(0, parseInt(savedPosition));
            }, 100);
        } else {
            window.scrollTo(0, 0);
        }
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
        const hash = location.hash.slice(1) || "/places";
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
                    document.title = r.title ? `${r.title} | Городские места` : "Городские места";
                    
                    const app = document.getElementById("app");
                    app.innerHTML = `
                        <div class="card loading">
                            <div class="loading-spinner"></div>
                            <p>Загрузка...</p>
                        </div>
                    `;
                    
                    await r.handler({ params, query: searchParams });
                    currentRoute = r;
                    
                    updateActiveLinks(path);
                    saveScrollPosition();
                    
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
        
        window.addEventListener('scroll', () => {
            saveScrollPosition();
        });
    }

    function go(path, query = {}) {
        const qs = new URLSearchParams(query).toString();
        location.hash = qs ? `${path}?${qs}` : path;
    }

    function back() {
        if (history.length > 1) {
            history.pop();
            const previous = history.pop();
            if (previous) {
                go(previous);
            }
        } else {
            go("/places");
        }
    }

    return {
        route(path, handler, options = {}) {
            routes.push({ 
                path, 
                handler, 
                requiresAuth: options.requiresAuth || false,
                title: options.title || ''
            });
        },
        start,
        go,
        back
    };
})();

export { Router };