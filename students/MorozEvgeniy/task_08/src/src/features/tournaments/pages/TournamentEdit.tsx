import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetTournamentQuery,
  useUpdateTournamentMutation,
} from "../api";

export default function TournamentEdit() {
  const { id } = useParams();
  const tournamentId = Number(id);
  const { data } = useGetTournamentQuery(tournamentId);
  const [updateTournament] = useUpdateTournamentMutation();
  const navigate = useNavigate();

  const { register, handleSubmit } = useForm({
    values: data,
  });

  const onSubmit = async (formData: any) => {
    await updateTournament({ id: tournamentId, ...formData });
    navigate("/");
  };

  if (!data) return <p>Загрузка...</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Редактирование</h2>

      <input {...register("name")} />
      <input {...register("location")} />
      <input {...register("startDate")} type="date" />
      <input {...register("endDate")} type="date" />

      <button type="submit">Сохранить</button>
    </form>
  );
}
