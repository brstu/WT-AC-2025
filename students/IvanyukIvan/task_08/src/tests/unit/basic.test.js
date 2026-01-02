describe("catalog data", () => {
  beforeEach(() => {
    global.window = {};
    jest.resetModules();
    require("../../lib/catalog.js");
  });

  test("список не пустой", () => {
    expect(Array.isArray(window.catalogData)).toBe(true);
    expect(window.catalogData.length).toBeGreaterThan(0);
  });

  test("есть хотя бы один странный проект", () => {
    const found = window.catalogData.some((item) =>
      (item.title || "").toLowerCase().includes("кофе")
    );
    expect(found).toBe(true);
  });
});
