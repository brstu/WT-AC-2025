const { jsPDF } = window.jspdf;

document.getElementById('downloadBtn').onclick = async () => {
  const resume = document.getElementById('resume');
  const canvas = await html2canvas(resume, {
    scale: 3,
    useCORS: true,
    scrollY: -window.scrollY,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'pt', [canvas.width, canvas.height]);
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save('Pavel_Kazarenko.pdf');
};

function createRipple(target, x = null, y = null) {
  const existing = target.querySelector('.ripple');
  if (existing) existing.remove();

  const ripple = document.createElement('span');
  ripple.classList.add('ripple');

  const rect = target.getBoundingClientRect();
  const size = Math.max(target.clientWidth, target.clientHeight);
  ripple.style.width = ripple.style.height = `${size}px`;

  ripple.style.left = `${(x ?? rect.width / 2) - size / 2}px`;
  ripple.style.top = `${(y ?? rect.height / 2) - size / 2}px`;

  target.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

document.addEventListener('click', (e) => {
  const target = e.target.closest('.ripple-effect');
  if (!target) return;

  createRipple(target, e.clientX - target.getBoundingClientRect().left, e.clientY - target.getBoundingClientRect().top);
});

document.querySelectorAll('.editable').forEach(element => {
  element.addEventListener('blur', () => {
    createRipple(element);
    element.classList.add('saved');
    setTimeout(() => element.classList.remove('saved'), 2000);
  });
});

const editState = document.getElementById('switch-contenteditable');
editState.classList.add('ripple-effect');

editState.addEventListener('click', () => {
  const editables = document.querySelectorAll('.editable');
  const isEnabled = editables[0]?.getAttribute('contenteditable') === 'true';

  editables.forEach(el => {
    el.setAttribute('contenteditable', String(!isEnabled));
    el.classList.toggle('ripple-effect', !isEnabled);
  });

  editState.textContent = isEnabled ? 'ВКЛ редактирование' : 'ВЫКЛ редактирование';
});
