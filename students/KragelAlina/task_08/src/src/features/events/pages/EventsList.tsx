import { Link } from "react-router-dom";
import {
  useDeleteEventMutation,
  useGetEventsQuery,
} from "../api";

export default function EventsList() {
  const { data, isLoading, error } = useGetEventsQuery();
  const [deleteEvent] = useDeleteEventMutation();

  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка загрузки</p>;
  if (!data || data.length === 0) return <p>Товары отсутствуют</p>;

  return (
    <div>
      <h1>Мини‑магазин — Товары</h1>
      <Link to="/events/new">➕ Добавить товар</Link>

      <ul>
        {data.map((e) => (
          <li key={e.id}>
            <strong>{e.name}</strong> ({e.location})
            <br />
            <Link to={`/events/${e.id}`}>Подробнее</Link>{" "}
            <Link to={`/events/${e.id}/edit`}>Редактировать</Link>{" "}
            <button onClick={() => deleteEvent(e.id)}>
              Удалить
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
