import { createBrowserRouter } from "react-router-dom";
import EventsList from "../features/events/pages/EventsList";
import EventDetail from "../features/events/pages/EventDetail";
import EventCreate from "../features/events/pages/EventCreate";
import EventEdit from "../features/events/pages/EventEdit";
import NotFound from "../pages/NotFound";

export const router = createBrowserRouter([
  { path: "/", element: <EventsList /> },
  { path: "/events/new", element: <EventCreate /> },
  { path: "/events/:id", element: <EventDetail /> },
  { path: "/events/:id/edit", element: <EventEdit /> },
  { path: "*", element: <NotFound /> },
]);
