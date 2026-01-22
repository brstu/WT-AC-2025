import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useCreateEventMutation } from "../api";

export default function EventCreate() {
  const { register, handleSubmit } = useForm();
  const [createEvent] = useCreateEventMutation();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    await createEvent(data);
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Новое мероприятие</h2>

      <input {...register("title")} placeholder="Название" />
      <textarea {...register("description")} placeholder="Описание" />
      <input {...register("location")} placeholder="Место" />
      <input {...register("date")} type="date" />
      <input {...register("capacity")} type="number" placeholder="Вместимость" />

      <button type="submit">Создать</button>
    </form>
  );
}
