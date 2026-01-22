(function () {
  const container = document.getElementById("catalog");
  const filterInput = document.getElementById("filter");
  const filterBtn = document.getElementById("filter-btn");

  function render(list) {
    container.innerHTML = "";
    list.forEach((item) => {
      const div = document.createElement("article");
      div.className = "card";
      div.innerHTML =
        "<img src='" +
        (item.cover || "https://loremflickr.com/320/240/startup") +
        "' alt='обложка'/>" +
        "<h3>" +
        item.title +
        "</h3><p>" +
        item.description +
        "</p><p><strong>Стадия:</strong> " +
        item.stage +
        "</p><a href='" +
        item.link +
        "' target='_blank' rel='noopener'>Открыть</a>";
      container.appendChild(div);
    });
  }

  function applyFilter() {
    const value = (filterInput.value || "").toLowerCase();
    const filtered = (window.catalogData || []).filter((x) =>
      (x.title || "").toLowerCase().includes(value)
    );
    render(filtered.length ? filtered : window.catalogData || []);
  }

  filterBtn.addEventListener("click", applyFilter);
  filterInput.addEventListener("keyup", function (e) {
    if (e.key === "Enter") {
      applyFilter();
    }
  });

  render(window.catalogData || []);
})();
