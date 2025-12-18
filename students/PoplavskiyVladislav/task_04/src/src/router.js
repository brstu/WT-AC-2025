// Simple router with route patterns like /teams, /teams/:id, /new, /teams/:id/edit
export default class Router {
  constructor(routes){
    this.routes = routes; // array of {pattern, handler}
    this._onChange = this._onChange.bind(this);
    window.addEventListener('hashchange', this._onChange);
    window.addEventListener('load', this._onChange);
  }

  matchPath(path){
    // remove leading slash
    const parts = path.replace(/^\/+/,'').split('/').filter(Boolean);
    for(const r of this.routes){
      const pat = r.pattern.replace(/^\/+/,'').split('/').filter(Boolean);
      if(pat.length !== parts.length) continue;
      const params = {};
      let ok = true;
      for(let i=0;i<pat.length;i++){
        if(pat[i].startsWith(':')){
          params[pat[i].slice(1)] = decodeURIComponent(parts[i]);
        } else if(pat[i] !== parts[i]) { ok=false; break; }
      }
      if(ok) return {route:r, params};
    }
    return null;
  }

  async _onChange(){
    const raw = location.hash.slice(1) || '/teams';
    // split path and query
    const [pathPart, queryPart] = raw.split('?');
    const match = this.matchPath(pathPart);
    const ctx = {path: pathPart, raw, query: new URLSearchParams(queryPart || ''), params: match ? match.params : {}};
    const app = document.getElementById('app');
    app.innerHTML = '';
    try {
      if(match && match.route && match.route.handler){
        await match.route.handler(ctx);
      } else {
        app.appendChild(this._notFound());
      }
    } catch(e){
      console.error(e);
      app.appendChild(this._errorView(e));
    }
    window.scrollTo(0,0);
  }

  _notFound(){
    const d = document.createElement('div');
    d.className='container';
    d.innerHTML = `<div class="state"><h3>404 — Не найдено</h3><p>Маршрут не распознан.</p></div>`;
    return d;
  }

  _errorView(e){
    const d = document.createElement('div');
    d.className='container';
    d.innerHTML = `<div class="state"><h3>Ошибка</h3><pre style="white-space:pre-wrap">${String(e)}</pre></div>`;
    return d;
  }
}
