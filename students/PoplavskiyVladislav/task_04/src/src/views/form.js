import {el, showToast} from '../utils.js';
import {api} from '../api.js';

// form for create (/new) and edit (/teams/:id/edit)
export async function renderForm(ctx){
  const app = document.getElementById('app');
  const isEdit = Boolean(ctx.params && ctx.params.id);
  const id = ctx.params.id;
  const container = el('div',{class:'container'});
  app.appendChild(container);
  container.innerHTML = `<div class="state">Загрузка...</div>`;

  let team = {name:'', region:'', founded:'', description:''};
  if(isEdit){
    try{
      team = await api.getTeam(id);
    }catch(e){
      container.innerHTML = `<div class="state">Ошибка загрузки: ${e.message}</div>`;
      return;
    }
  }

  const form = el('form', {onsubmit: onSubmit});
  const nameField = el('div',{class:'form-field'}, el('label',{}, 'Название'), el('input',{type:'text', name:'name', required:true, value:team.name}));
  const regionField = el('div',{class:'form-field'}, el('label',{}, 'Регион'), el('input',{type:'text', name:'region', value:team.region}));
  const foundedField = el('div',{class:'form-field'}, el('label',{}, 'Год основания'), el('input',{type:'text', name:'founded', inputmode:'numeric', value:team.founded}));
  const descField = el('div',{class:'form-field', style:'width:100%'}, el('label', {}, 'Описание'), el('textarea',{name:'description', rows:6}, team.description));

  const actions = el('div', {style:'margin-top:12px; display:flex; gap:8px;'});
  const submitBtn = el('button', {}, isEdit ? 'Сохранить' : 'Создать');
  const cancelBtn = el('button', {type:'button', class:'secondary', onclick: ()=> history.back()}, 'Отмена');

  actions.append(submitBtn, cancelBtn);

  form.append(el('div',{class:'form-row'}, nameField, regionField, foundedField), descField, actions);
  container.innerHTML = '';
  container.append(form);

  // validation: simple
  function validateForm(fd){
    const name = fd.get('name')?.trim();
    if(!name) return 'Название обязательно';
    const founded = fd.get('founded')?.trim();
    if(founded && !/^\d{3,4}$/.test(founded)) return 'Год должен быть числом (3-4 цифры)';
    return null;
  }

  let submitting = false;
  async function onSubmit(ev){
    ev.preventDefault();
    if(submitting) return;
    const fd = new FormData(form);
    const err = validateForm(fd);
    if(err){ alert(err); return; }
    const payload = {
      name: fd.get('name').trim(),
      region: fd.get('region').trim(),
      founded: fd.get('founded').trim(),
      description: fd.get('description').trim()
    };
    try{
      submitting = true;
      submitBtn.disabled = true;
      if(isEdit){
        await api.updateTeam(id, payload);
        showToast('Сохранено');
        location.hash = `#/teams/${id}`;
      } else {
        const created = await api.createTeam(payload);
        showToast('Создано');
        location.hash = `#/teams/${created.id}`;
      }
      window.dispatchEvent(new Event('teams:refresh'));
    }catch(e){
      alert('Ошибка: ' + e.message);
    }finally{
      submitting = false;
      submitBtn.disabled = false;
    }
  }
}
