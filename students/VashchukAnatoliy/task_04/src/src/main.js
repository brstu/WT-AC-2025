// main.js

import { addRoute } from "./router/router.js";

import { renderListView } from "./views/listView.js";
import { renderDetailView } from "./views/detailView.js";
import { renderFormView } from "./views/formView.js";

// Маршрут: список статей
addRoute("/items", ({ query }) => {
    renderListView({ query });
});

// Маршрут: детальная страница
addRoute("/items/:id", ({ params }) => {
    renderDetailView({ params });
});

// Маршрут: создание новой статьи
addRoute("/new", () => {
    renderFormView({ params: {} });
});

// Маршрут: редактирование статьи
addRoute("/items/:id/edit", ({ params }) => {
    renderFormView({ params });
});

console.log("SPA initialized.");
