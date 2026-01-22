import { useParams } from "react-router-dom";
import { useGetNoteQuery } from "../../app/api";

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: note, isLoading, isError } = useGetNoteQuery(Number(id));

  if (isLoading) return <div>Загрузка...</div>;
  if (isError || !note) return <div>Заметка не найдена</div>;

  return (
    <div>
      <h1>{note.title}</h1>
      <p>{note.content}</p>
      <p>Дата: {note.date}</p>
      <p>Теги: {note.tags.join(", ")}</p>
    </div>
  );
}