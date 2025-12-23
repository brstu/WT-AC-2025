import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useCreateTournamentMutation } from "../api";

export default function TournamentCreate() {
  const { register, handleSubmit } = useForm();
  const [createTournament] = useCreateTournamentMutation();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    await createTournament(data);
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Новый турнир</h2>

      <input {...register("name")} placeholder="Название" />
      <input {...register("location")} placeholder="Место" />
      <input {...register("startDate")} type="date" />
      <input {...register("endDate")} type="date" />

      <button type="submit">Создать</button>
    </form>
  );
}
