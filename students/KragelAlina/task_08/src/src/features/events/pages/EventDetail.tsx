import { Link, useParams } from "react-router-dom";
import { useGetEventQuery } from "../api";

export default function EventDetail() {
  const { id } = useParams();
  const eventId = Number(id);

  const { data, isLoading } = useGetEventQuery(eventId);

  if (isLoading) return <p>Загрузка...</p>;
  if (!data) return <p>Событие не найдено</p>;

  return (
    <div>
      <h2>{data.name}</h2>
      <p>Место: {data.location}</p>
      <p>Дата: {data.date}</p>
      {data.description && <p>Описание: {data.description}</p>}

      <Link to="/">← Назад</Link>
    </div>
  );
}
