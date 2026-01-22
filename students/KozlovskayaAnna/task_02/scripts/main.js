// Main JS for ЛР02 — Портфолио фотографа

// Tabs
const tabs = document.querySelectorAll('[role="tab"]');
const panels = document.querySelectorAll('[role="tabpanel"]');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    activateTab(tab);
  });
  tab.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const idx = Array.from(tabs).indexOf(tab);
      const next = e.key === 'ArrowRight' ? (idx+1)%tabs.length : (idx-1+tabs.length)%tabs.length;
      tabs[next].focus();
      activateTab(tabs[next]);
    }
  });
});

function activateTab(tab){
  tabs.forEach(t => t.setAttribute('aria-selected','false'));
  panels.forEach(p => p.hidden = true);
  tab.setAttribute('aria-selected','true');
  const id = tab.getAttribute('aria-controls');
  const panel = document.getElementById(id);
  if(panel){ panel.hidden = false; }
}

// Delegation for gallery (likes and delete), tooltip on hover/focus
const galleries = document.querySelectorAll('.gallery');
const tooltip = document.getElementById('tooltip');

galleries.forEach(gallery => {
  gallery.addEventListener('click', (e) => {
    const likeBtn = e.target.closest('[data-like]');
    if(likeBtn){
      const pressed = likeBtn.getAttribute('aria-pressed') === 'true';
      likeBtn.setAttribute('aria-pressed', String(!pressed));
      const card = likeBtn.closest('.card');
      card.classList.toggle('liked');
      // persist to localStorage bonus
      saveState();
      return;
    }
    const delBtn = e.target.closest('[data-delete]');
    if(delBtn){
      const card = delBtn.closest('.card');
      card.remove();
      saveState();
      return;
    }
    const img = e.target.closest('img');
    if(img){
      // open lightbox at index
      openLightbox(img);
    }
  });

  // tooltip show on mouseover/focus for images
  gallery.addEventListener('mouseover', handleTooltip);
  gallery.addEventListener('mouseout', hideTooltip);
  gallery.addEventListener('focusin', handleTooltip);
  gallery.addEventListener('focusout', hideTooltip);
});

function handleTooltip(e){
  const img = e.target.closest('img');
  if(!img) return;
  const exif = img.dataset.exif;
  if(!exif) return;
  tooltip.textContent = exif.replace(/;/g, ' · ');
  tooltip.removeAttribute('hidden');
  tooltip.setAttribute('aria-hidden','false');
  positionTooltip(e);
}
function hideTooltip(e){
  tooltip.setAttribute('hidden','');
  tooltip.setAttribute('aria-hidden','true');
}
function positionTooltip(e){
  const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
  const y = e.clientY || (e.touches && e.touches[0].clientY) || 0;
  tooltip.style.left = (x+12) + 'px';
  tooltip.style.top = (y+12) + 'px';
}

document.addEventListener('mousemove', (e) => {
  if(!tooltip.hasAttribute('hidden')) positionTooltip(e);
});

// Lightbox / modal slider
const lightbox = document.getElementById('lightbox');
const lbImage = document.getElementById('lb-image');
const lbCaption = document.getElementById('lb-caption');
const lbExif = document.getElementById('lb-exif');
let currentGallery = null; // NodeList or array of imgs
let currentIndex = 0;

function openLightbox(img){
  const gallery = img.closest('.gallery');
  currentGallery = Array.from(gallery.querySelectorAll('img'));
  currentIndex = currentGallery.indexOf(img);
  showSlide(currentIndex);
  lightbox.removeAttribute('hidden');
  lightbox.setAttribute('aria-hidden','false');
  // remember opener to return focus on close
  try{ window.__lastFocusedImage = img; }catch(e){}
  // put focus on close button inside modal
  document.querySelector('[data-lb-close]').focus();
}

function closeLightbox(){
  lightbox.setAttribute('hidden','');
  lightbox.setAttribute('aria-hidden','true');
  // return focus to the image that opened the lightbox (if still in DOM)
  try{ if(window.__lastFocusedImage && document.body.contains(window.__lastFocusedImage)) window.__lastFocusedImage.focus(); }catch(e){}
}

document.querySelector('[data-lb-close]').addEventListener('click', closeLightbox);
document.querySelector('[data-lb-next]').addEventListener('click', () => { showSlide(currentIndex+1); });
document.querySelector('[data-lb-prev]').addEventListener('click', () => { showSlide(currentIndex-1); });

function showSlide(idx){
  if(!currentGallery || currentGallery.length===0) return;
  currentIndex = (idx + currentGallery.length) % currentGallery.length;
  const img = currentGallery[currentIndex];
  // use the exact source of the clicked image
  lbImage.src = img.src;
  lbImage.alt = img.alt;
  lbCaption.textContent = img.nextElementSibling?.textContent || '';
  lbExif.textContent = img.dataset.exif || '';
}

// keyboard for modal
document.addEventListener('keydown', (e) => {
  if(lightbox.getAttribute('aria-hidden') === 'false'){
    if(e.key === 'Escape') closeLightbox();
    if(e.key === 'ArrowRight') showSlide(currentIndex+1);
    if(e.key === 'ArrowLeft') showSlide(currentIndex-1);
  }
});

// Simple persistence for likes and removed items
function saveState(){
  const state = {};
  document.querySelectorAll('.gallery').forEach((g,gi) => {
    state[gi] = {likes:[], removed:[]};
    g.querySelectorAll('.card').forEach((card,ci)=>{
      const img = card.querySelector('img');
      const like = card.querySelector('[data-like]')?.getAttribute('aria-pressed') === 'true';
      if(like) state[gi].likes.push(ci);
    });
  });
  localStorage.setItem('photoState', JSON.stringify(state));
}

function loadState(){
  const raw = localStorage.getItem('photoState');
  if(!raw) return;
  // (for demo simplicity, not fully restoring removed items positions)
}

loadState();

// Form validation
const form = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit');
const formResult = document.getElementById('form-result');

const validators = {
  name: (val) => val.trim().length >= 2,
  email: (val) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val),
  message: (val) => val.trim().length >= 20
};

function checkForm(){
  const name = form.name.value;
  const email = form.email.value;
  const message = form.message.value;
  const ok = validators.name(name) && validators.email(email) && validators.message(message);
  submitBtn.disabled = !ok;
  return ok;
}

form.addEventListener('input', (e) => {
  const el = e.target;
  if(!el.name) return;
  const valid = validators[el.name](el.value);
  const err = document.getElementById('err-'+el.name);
  if(!valid){
    err.textContent = getErrorMessage(el.name);
  } else { err.textContent = '' }
  checkForm();
});

function getErrorMessage(name){
  switch(name){
    case 'name': return 'Введите имя (мин. 2 символа)';
    case 'email': return 'Введите корректный e-mail';
    case 'message': return 'Сообщение должно быть не менее 20 символов';
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if(!checkForm()) return;
  const data = {name:form.name.value, email:form.email.value, message:form.message.value};
  formResult.textContent = 'Сообщение отправлено. Спасибо, ' + data.name + '!';
  form.reset();
  submitBtn.disabled = true;
});

// Accessibility small helpers: trap focus in modal (basic)
lightbox.addEventListener('keydown', (e) => {
  if(e.key !== 'Tab') return;
  const focusable = lightbox.querySelectorAll('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])');
  if(focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length-1];
  if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
});

// On load set first tab active
activateTab(document.querySelector('[role="tab"][aria-selected="true"]'));

// finished
console.log('Main script loaded');
