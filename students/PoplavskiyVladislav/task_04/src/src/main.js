import Router from './router.js';
import {setApiBase, setToken} from './api.js';
import {renderList} from './views/list.js';
import {renderDetail} from './views/detail.js';
import {renderForm} from './views/form.js';

// optionally configure API base and token from environment or query
setApiBase('http://localhost:3000'); // default for json-server
// setToken('MYTOKEN'); // uncomment if you want to test Authorization header

const routes = [
  {pattern: '/teams', handler: renderList},
  {pattern: '/', handler: renderList},
  {pattern: '/teams/:id', handler: renderDetail},
  {pattern: '/teams/:id/edit', handler: renderForm},
  {pattern: '/new', handler: renderForm},
];

// initialize router
new Router(routes);

// accessibility: focus main after route change
window.addEventListener('hashchange', ()=> {
  const app = document.getElementById('app');
  if(app) app.focus();
});
