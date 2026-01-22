export function showNotification(message, type = 'success') {
  const notif = document.getElementById('notification');
  notif.textContent = message;
  notif.style.background = type === 'error' ? '#f44336' : '#4CAF50';
  notif.style.display = 'block';
  setTimeout(() => notif.style.display = 'none', 3000);
}

export function setLoading(isLoading) {
  document.querySelector('.loading')?.style.setProperty('display', isLoading ? 'block' : 'none');
}