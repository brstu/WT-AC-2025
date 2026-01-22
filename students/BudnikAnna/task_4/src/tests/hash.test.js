import { buildHash } from "../src/clubs-v27/utils/hash.js";

function test(name, fn) {
  try {
    fn();
    console.log("✅", name);
  } catch (e) {
    console.error("❌", name, e);
  }
}

test("buildHash без query", () => {
  const h = buildHash("/items", new URLSearchParams());
  if (h !== "#/items") throw new Error(`Expected #/items, got ${h}`);
});

test("buildHash с query", () => {
  const qs = new URLSearchParams({ q: "GIS", category: "Наука" });
  const h = buildHash("/items", qs);
  if (!h.startsWith("#/items?")) throw new Error(`Expected query, got ${h}`);
  if (!h.includes("q=GIS")) throw new Error("No q=GIS");
  if (!h.includes("category=%D0%9D%D0%B0%D1%83%D0%BA%D0%B0")) throw new Error("No category encoded");
});
