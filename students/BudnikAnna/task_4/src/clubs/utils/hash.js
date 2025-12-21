export function parseHash() {
  const raw = (location.hash || "#/items").slice(1); // remove '#'
  const [pathRaw, queryRaw] = raw.split("?");
  const path = (pathRaw || "/items").startsWith("/")
    ? (pathRaw || "/items")
    : `/${pathRaw || "items"}`;
  const query = new URLSearchParams(queryRaw || "");
  return { path, query };
}

export function buildHash(path, query) {
  const q = query && [...query.entries()].length ? `?${query.toString()}` : "";
  return `#${path}${q}`;
}

export function setHash(path, query) {
  location.hash = buildHash(path, query);
}
