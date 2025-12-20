import { Link } from "react-router-dom";
import {
  useDeleteTournamentMutation,
  useGetTournamentsQuery,
} from "../api";

export default function TournamentsList() {
  const { data, isLoading, error } = useGetTournamentsQuery();
  const [deleteTournament] = useDeleteTournamentMutation();

  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка загрузки</p>;
  if (!data || data.length === 0) return <p>Турниры отсутствуют</p>;

  return (
    <div>
      <h1>Турниры</h1>
      <Link to="/tournaments/new">➕ Добавить турнир</Link>

      <ul>
        {data.map((t) => (
          <li key={t.id}>
            <strong>{t.name}</strong> ({t.location})
            <br />
            <Link to={`/tournaments/${t.id}`}>Подробнее</Link>{" "}
            <Link to={`/tournaments/${t.id}/edit`}>Редактировать</Link>{" "}
            <button onClick={() => deleteTournament(t.id)}>
              Удалить
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
