// cache.js
const cache = new Map();

export function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

export function setCached(key, data, ttlMs = 10 * 60 * 1000) { // 10 минут по умолчанию
  cache.set(key, {
    data,
    expiry: Date.now() + ttlMs
  });
}

export function clearCache() {
  cache.clear();
}