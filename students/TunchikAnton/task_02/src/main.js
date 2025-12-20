const root = document.documentElement;

/* ТЕМА */
const savedTheme = localStorage.getItem('theme');
if (savedTheme) root.dataset.theme = savedTheme;

document.querySelector('.theme-toggle').onclick = () => {
  root.dataset.theme =
    root.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', root.dataset.theme);
};

/* ТАБЫ */
const tabs = document.querySelector('.tabs');
const cards = document.querySelectorAll('.card');

const savedBrand = localStorage.getItem('brand') || 'apple';
setBrand(savedBrand);

tabs.addEventListener('click', e => {
  if (e.target.role !== 'tab') return;
  setBrand(e.target.dataset.brand);
});

function setBrand(brand) {
  tabs.querySelectorAll('[role=tab]').forEach(tab =>
    tab.setAttribute('aria-selected', tab.dataset.brand === brand)
  );

  cards.forEach(card =>
    card.hidden = card.dataset.brand !== brand
  );

  localStorage.setItem('brand', brand);
}

/* ЛАЙКИ */
const likes = JSON.parse(localStorage.getItem('likes')) || {};

cards.forEach(card => {
  const id = card.dataset.id;
  card.querySelector('.like-count').textContent = likes[id] || 0;
});

/* КАРТОЧКИ */
document.getElementById('cards').addEventListener('click', e => {
  const card = e.target.closest('.card');
  if (!card) return;

  const id = card.dataset.id;

  if (e.target.dataset.action === 'like') {
    likes[id] = (likes[id] || 0) + 1;
    card.querySelector('.like-count').textContent = likes[id];
    localStorage.setItem('likes', JSON.stringify(likes));
  }

  if (e.target.dataset.action === 'delete') {
    delete likes[id];
    localStorage.setItem('likes', JSON.stringify(likes));
    card.remove();
  }
});

/* ФОРМА */
const form = document.querySelector('form');
const btn = form.querySelector('button');
const result = document.querySelector('.form-result');

const rules = {
  name: v => v.trim().length > 0,
  email: v => /\S+@\S+\.\S+/.test(v),
  message: v => v.length >= 20
};

form.addEventListener('input', () => {
  let ok = true;

  [...form.elements].forEach(el => {
    if (!rules[el.name]) return;
    const valid = rules[el.name](el.value);
    el.nextElementSibling.textContent = valid ? '' : 'Ошибка поля';
    ok &&= valid;
  });

  btn.disabled = !ok;
});

form.addEventListener('submit', e => {
  e.preventDefault();
  result.textContent = 'Сообщение успешно отправлено!';
  form.reset();
  btn.disabled = true;
});
