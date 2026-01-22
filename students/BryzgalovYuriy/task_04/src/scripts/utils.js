export function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function qs() {
  const hash = location.hash || "";
  const idx = hash.indexOf("?");
  if (idx === -1) return new URLSearchParams();
  return new URLSearchParams(hash.slice(idx + 1));
}

export function setToast(message) {
  const toast = document.getElementById("toast");
  toast.innerHTML = message
    ? `<div class="toast-inner" role="status">${escapeHtml(message)}</div>`
    : "";
  if (message) {
    window.clearTimeout(setToast._t);
    setToast._t = window.setTimeout(() => setToast(""), 2500);
  }
}

export function renderState({ title, text, actionHtml = "" }) {
  return `
    <div class="state card">
      <h2 style="margin:0 0 .35rem">${escapeHtml(title)}</h2>
      <p class="muted" style="margin:0 0 .75rem">${escapeHtml(text)}</p>
      ${actionHtml}
    </div>
  `;
}
