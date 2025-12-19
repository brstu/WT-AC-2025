import { Link, useParams } from "react-router-dom";
import { useGetTournamentQuery } from "../api";
import { useGetMatchesByTournamentQuery } from "../../matches/api";

export default function TournamentDetail() {
  const { id } = useParams();
  const tournamentId = Number(id);

  const { data, isLoading } = useGetTournamentQuery(tournamentId);
  const { data: matches } =
    useGetMatchesByTournamentQuery(tournamentId);

  if (isLoading) return <p>Загрузка...</p>;
  if (!data) return <p>Турнир не найден</p>;

  return (
    <div>
      <h2>{data.name}</h2>
      <p>Место: {data.location}</p>
      <p>
        Даты: {data.startDate} — {data.endDate}
      </p>

      <h3>Матчи</h3>
      <ul>
        {matches?.map((m) => (
          <li key={m.id}>
            {m.teamA} vs {m.teamB} — {m.score}
          </li>
        ))}
      </ul>

      <Link to="/">← Назад</Link>
    </div>
  );
}
