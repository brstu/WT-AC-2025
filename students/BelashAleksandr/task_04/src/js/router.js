import { views } from './views.js';

var routes = [
    { path: /^#\/items$/, handler: 'showList' },
    { path: /^#\/items\/(\d+)$/, handler: 'showDetail' },
    { path: /^#\/items\/(\d+)\/edit$/, handler: 'showEditForm' },
    { path: /^#\/new$/, handler: 'showCreateForm' },
    { path: /^#\/$/, handler: 'showList' },
    { path: /^$/, handler: 'showList' }
];

export var router = {
    init: function() {
        if (!window.location.hash) {
            window.location.hash = '#/items';
        }
        this.handleRoute();
    },
    
    handleRoute: function() {
        var hash = window.location.hash;
        
        for (var i = 0; i < routes.length; i++) {
            var route = routes[i];
            var match = hash.match(route.path);
            
            if (match) {
                if (route.handler === 'showList') {
                    views.showList();
                } else if (route.handler === 'showDetail') {
                    var id = match[1];
                    views.showDetail(id);
                } else if (route.handler === 'showEditForm') {
                    var id = match[1];
                    views.showEditForm(id);
                } else if (route.handler === 'showCreateForm') {
                    views.showCreateForm();
                }
                return;
            }
        }
        
        views.showList();
    }
};
