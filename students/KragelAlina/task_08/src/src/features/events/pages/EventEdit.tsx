import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetEventQuery,
  useUpdateEventMutation,
} from "../api";

export default function EventEdit() {
  const { id } = useParams();
  const eventId = Number(id);
  const { data } = useGetEventQuery(eventId);
  const [updateEvent] = useUpdateEventMutation();
  const navigate = useNavigate();

  const { register, handleSubmit } = useForm({
    values: data,
  });

  const onSubmit = async (formData: any) => {
    await updateEvent({ id: eventId, ...formData });
    navigate("/");
  };

  if (!data) return <p>Загрузка...</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Редактирование</h2>

      <input {...register("name")} />
      <input {...register("location")} />
      <input {...register("date")} type="date" />
      <textarea {...register("description")} />

      <button type="submit">Сохранить</button>
    </form>
  );
}
