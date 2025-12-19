function showToast(message, type = 'success') {
  const cont = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = message;
  if (type === 'error') t.style.background = '#d32f2f'; 
  cont.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}