import {el, showToast, parseHash} from '../utils.js';
import {api} from '../api.js';

// List view: shows search, list, handles empty/loading/error, saves search in hash (?q=...)
export async function renderList(ctx){
  const app = document.getElementById('app');
  const container = el('div',{class:'container'});
  const controls = el('div',{class:'controls'});
  const searchInput = el('input',{type:'search', placeholder:'Поиск по названию', value: ctx.query.get('q') || ''});
  const newBtn = el('button', {onclick:()=> location.hash = '#/new'}, 'Добавить');
  controls.append(searchInput, newBtn);
  container.append(controls);

  const listWrap = el('div');
  container.append(listWrap);
  app.appendChild(container);

  async function loadAndRender(){
    listWrap.innerHTML = `<div class="state">Загрузка...</div>`;
    const q = {};
    const qv = searchInput.value.trim();
    if(qv) q.q = qv;
    try{
      const teams = await api.listTeams(q);
      if(!teams || teams.length === 0){
        listWrap.innerHTML = `<div class="state">Пусто — команд не найдено.</div>`;
        return;
      }
      const grid = el('div',{class:'teams-grid'});
      teams.forEach(t => {
        const card = el('article',{class:'team-card'});
        const title = el('h3', {}, el('a',{href:`#/teams/${t.id}`}, t.name));
        const meta = el('div',{class:'meta'}, `${t.region || '—'} • ${t.founded || 'год не указан'}`);
        const desc = el('p', {}, t.description ? (t.description.slice(0,140) + (t.description.length>140?'…':'')) : 'Описание отсутствует');
        // prefetch on hover
        title.addEventListener('mouseenter', ()=> api.prefetchTeam(t.id));
        card.append(title, desc, meta);
        grid.append(card);
      });
      listWrap.innerHTML = '';
      listWrap.append(grid);
    }catch(e){
      console.error(e);
      listWrap.innerHTML = `<div class="state">Ошибка: ${e.message}</div>`;
    }
  }

  // keep query in hash on enter and on blur
  searchInput.addEventListener('keydown', (ev)=>{
    if(ev.key === 'Enter'){
      const v = searchInput.value.trim();
      const base = location.hash.split('?')[0] || '#/teams';
      location.hash = base + (v ? `?q=${encodeURIComponent(v)}` : '');
    }
  });

  // small debounce for input -> update hash after pause
  let tmr;
  searchInput.addEventListener('input', ()=> {
    clearTimeout(tmr);
    tmr = setTimeout(()=> {
      const v = searchInput.value.trim();
      const base = location.hash.split('?')[0] || '#/teams';
      location.hash = base + (v ? `?q=${encodeURIComponent(v)}` : '');
    }, 700);
  });

  // initial load
  await loadAndRender();

  // allow external refresh via custom event
  window.addEventListener('teams:refresh', loadAndRender);
}
