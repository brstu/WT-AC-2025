import { useParams, useNavigate } from "react-router-dom";
import { useGetNoteQuery, useUpdateNoteMutation, Note } from "../../app/api";
import NoteForm from "../../components/NoteForm";
import { toast } from "react-toastify";

export default function EditNote() {
  const { id } = useParams<{ id: string }>();
  const { data: note } = useGetNoteQuery(Number(id));
  const [updateNote] = useUpdateNoteMutation();
  const navigate = useNavigate();

  const handleSubmit = async (data: Partial<Note>) => {
    try {
      await updateNote({ id: Number(id), ...data }).unwrap();
      toast.success("Заметка обновлена");
      navigate("/");
    } catch {
      toast.error("Не удалось обновить");
    }
  };

  return note ? <NoteForm initialData={note} onSubmit={handleSubmit} /> : <div>Загрузка...</div>;
}