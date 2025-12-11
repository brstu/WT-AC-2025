// Main app initialization
import * as router from './router.js';
import * as views from './views.js';

console.log('App starting');

var appElement = document.getElementById('app');
views.setAppElement(appElement);

router.addRoute('#/items', views.showTaskList);
router.addRoute('#/items/:id', views.showTaskDetail);
router.addRoute('#/items/:id/edit', views.showTaskForm);
router.addRoute('#/new', views.showTaskForm);

router.init();

console.log('App initialized');
