// src/router.js
import { ListView } from './views/ListView.js';
import { DetailView } from './views/DetailView.js';
import { FormView } from './views/FormView.js';

const routes = {
    'items': ListView,
    'items/:id': DetailView,
    'items/:id/edit': FormView,
    'new': FormView,
};

export class Router {
    static async init() {
        window.addEventListener('hashchange', () => this.route());
        window.addEventListener('load', () => this.route());
    }

    static async route() {
        let hash = location.hash.slice(1) || 'items';
        if (hash.startsWith('/')) hash = hash.slice(1);

        let match = null;
        let ViewClass = null;

        for (const pattern in routes) {
            const regex = new RegExp('^' + pattern.replace(/:\w+/g, '(\\d+)') + '$');
            const params = hash.match(regex);
            if (params) {
                match = { pattern, params: params.slice(1) };
                ViewClass = routes[pattern];
                break;
            }
        }

        if (!ViewClass) {
            document.getElementById('content').innerHTML = '<h2>404 — Страница не найдена</h2>';
            return;
        }

        const view = new ViewClass();
        if (match) {
            if (match.pattern.includes(':id')) {
                view.id = match.params[0];
            }
            if (match.pattern.includes('edit')) {
                view.mode = 'edit';
            } else if (hash === 'new') {
                view.mode = 'create';
            }
        }

        await view.render();
    }
}