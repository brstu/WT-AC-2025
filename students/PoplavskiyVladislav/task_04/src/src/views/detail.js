import {el, showToast} from '../utils.js';
import {api} from '../api.js';

export async function renderDetail(ctx){
  const app = document.getElementById('app');
  const id = ctx.params.id;
  const container = el('div',{class:'container'});
  app.appendChild(container);
  container.innerHTML = `<div class="state">Загрузка...</div>`;

  try{
    const team = await api.getTeam(id);
    const title = el('h2', {}, team.name);
    const meta = el('div',{class:'meta'}, `${team.region || '—'} • ${team.founded || '—'}`);
    const desc = el('p', {}, team.description || 'Описание отсутствует');

    const actions = el('div',{style:'margin-top:12px; display:flex; gap:8px;'});
    const editBtn = el('button', {onclick: ()=> location.hash = `#/teams/${id}/edit`}, 'Редактировать');
    const delBtn = el('button', {class:'btn-danger', onclick: async ()=>{
      if(!confirm(`Удалить команду "${team.name}"?`)) return;
      try{
        await api.deleteTeam(id);
        showToast('Команда удалена');
        // go to list
        location.hash = '#/teams';
        // notify list to refresh
        window.dispatchEvent(new Event('teams:refresh'));
      }catch(e){
        alert('Ошибка удаления: ' + e.message);
      }
    }}, 'Удалить');

    actions.append(editBtn, delBtn);
    container.innerHTML = '';
    container.append(title, meta, desc, actions);
  }catch(e){
    container.innerHTML = `<div class="state">Ошибка: ${e.message}</div>`;
  }
}
