import { createBrowserRouter } from "react-router-dom";
import TournamentsList from "../features/tournaments/pages/TournamentsList";
import TournamentDetail from "../features/tournaments/pages/TournamentDetail";
import TournamentCreate from "../features/tournaments/pages/TournamentCreate";
import TournamentEdit from "../features/tournaments/pages/TournamentEdit";
import NotFound from "../pages/NotFound";

export const router = createBrowserRouter([
  { path: "/", element: <TournamentsList /> },
  { path: "/tournaments/new", element: <TournamentCreate /> },
  { path: "/tournaments/:id", element: <TournamentDetail /> },
  { path: "/tournaments/:id/edit", element: <TournamentEdit /> },
  { path: "*", element: <NotFound /> },
]);
