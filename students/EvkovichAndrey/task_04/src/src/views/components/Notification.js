export const showNotification = (message, type = 'success') => {
    const notif = document.getElementById('notification');
    notif.textContent = message;
    notif.className = `notification ${type}`;
    notif.style.display = 'block';
    setTimeout(() => notif.style.display = 'none', 3000);
};