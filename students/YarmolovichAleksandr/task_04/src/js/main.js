import { Router } from "./router.js";
import { renderAlbumList } from "./views/albumList.js";
import { renderAlbumDetail } from "./views/albumDetail.js";
import { renderAlbumForm } from "./views/albumForm.js";

Router.route("/albums", renderAlbumList);
Router.route("/albums/:id", renderAlbumDetail);
Router.route("/albums/:id/edit", renderAlbumForm);
Router.route("/new", renderAlbumForm);

Router.start();
