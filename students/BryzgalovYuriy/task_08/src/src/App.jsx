import { Link, Outlet } from "react-router-dom";

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Справочник стартапов</h1>
      <nav style={{ marginBottom: 20 }}>
        <Link to="/">Список</Link> |{" "}
        <Link to="/new">Добавить</Link>
      </nav>
      <Outlet />
    </div>
  );
}
