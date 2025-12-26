describe("DOM фильтр", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div>
        <input id="filter" />
        <button id="filter-btn">go</button>
        <div id="catalog"></div>
      </div>
    `;

    window.catalogData = [
      { title: "Котики", description: "", stage: "seed", link: "#" },
      { title: "Собаки", description: "", stage: "seed", link: "#" }
    ];

    jest.resetModules();
    delete require.cache[require.resolve("../../public/script.js")];
    require("../../public/script.js");
  });

  test("фильтр по буквам сокращает список", () => {
    const input = document.getElementById("filter");
    const button = document.getElementById("filter-btn");
    input.value = "кот";
    button.click();

    const cards = document.querySelectorAll(".card");
    expect(cards.length).toBe(1);
    expect(cards[0].textContent.toLowerCase()).toContain("котики");
  });
});
