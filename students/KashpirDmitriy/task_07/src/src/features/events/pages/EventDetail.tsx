import { Link, useParams } from "react-router-dom";
import { useGetEventQuery } from "../api";
import { useGetRequestsByEventQuery } from "../../participationRequests/api";

export default function EventDetail() {
  const { id } = useParams();
  const eventId = Number(id);

  const { data, isLoading } = useGetEventQuery(eventId);
  const { data: requests } =
    useGetRequestsByEventQuery(eventId);

  if (isLoading) return <p>Загрузка...</p>;
  if (!data) return <p>Мероприятие не найдено</p>;

  return (
    <div>
      <h2>{data.title}</h2>
      <p>{data.description}</p>
      <p>Место: {data.location}</p>
      <p>Дата: {data.date}</p>
      <p>Вместимость: {data.capacity}</p>

      <h3>Заявки на участие</h3>
      <ul>
        {requests?.map((r) => (
          <li key={r.id}>
            <strong>{r.participantName}</strong> ({r.email})
            <br />
            Статус: {r.status}
          </li>
        ))}
      </ul>

      <Link to="/">← Назад</Link>
    </div>
  );
}
