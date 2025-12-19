export function showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    const div = document.createElement('div');
    div.className = `notification ${type}`;
    div.textContent = message;
    container.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

export function renderLoader() {
    return `<div class="loader">Loading... ⏳</div>`;
}

export function renderError(message) {
    return `<div class="error"><h3>Ошибка 😕</h3><p>${message}</p></div>`;
}