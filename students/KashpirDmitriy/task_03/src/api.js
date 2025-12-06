// api.js
let lastController = null;

export function abortPrevious() {
  if (lastController) lastController.abort();
}

export async function fetchWithRetry(url, options = {}, { retries = 3, backoffMs = 600, timeoutMs = 8000 } = {}) {
  let attempt = 0;

  while (true) {
    abortPrevious();
    lastController = new AbortController();
    const signal = lastController.signal;

    const timeout = setTimeout(() => lastController.abort(), timeoutMs);

    try {
      const res = await fetch(url, { ...options, signal });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') throw err;
      if (attempt++ >= retries) throw err;

      await new Promise(r => setTimeout(r, backoffMs * Math.pow(2, attempt)));
    }
  }
}