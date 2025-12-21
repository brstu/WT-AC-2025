let wrap;

function ensureWrap() {
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }
}

export function toast(type, title, msg, timeout = 2600) {
  ensureWrap();
  const el = document.createElement("div");
  el.className =
    "toast " +
    (type === "ok" ? "toast--ok" : type === "err" ? "toast--err" : "toast--warn");

  el.innerHTML = `
    <div class="toast__title">${title}</div>
    <div class="toast__msg">${msg}</div>
  `;

  wrap.appendChild(el);

  const t = window.setTimeout(() => el.remove(), timeout);

  el.addEventListener("click", () => {
    window.clearTimeout(t);
    el.remove();
  });
}
