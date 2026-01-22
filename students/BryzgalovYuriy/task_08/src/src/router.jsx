import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import List from "./pages/List";
import Detail from "./pages/Detail";
import Create from "./pages/Create";
import Edit from "./pages/Edit";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <List /> },
      { path: "items/:id", element: <Detail /> },
      { path: "new", element: <Create /> },
      { path: "edit/:id", element: <Edit /> }
    ]
  },
  { path: "*", element: <NotFound /> }
]);
