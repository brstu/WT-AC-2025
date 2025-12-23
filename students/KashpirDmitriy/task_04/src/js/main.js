import { Router } from "./router.js";
import { renderWorksList } from "./views/worksList.js";
import { renderWorkDetail } from "./views/workDetail.js";
import { renderWorkForm } from "./views/workForm.js";

Router.route("/works", renderWorksList);
Router.route("/works/:id", renderWorkDetail);
Router.route("/works/:id/edit", renderWorkForm);
Router.route("/new", renderWorkForm);

Router.start();
