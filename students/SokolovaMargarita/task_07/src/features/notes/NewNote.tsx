import { useCreateNoteMutation, Note } from "../../app/api";
import NoteForm from "../../components/NoteForm";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function NewNote() {
  const [createNote] = useCreateNoteMutation();
  const navigate = useNavigate();

  const handleSubmit = async (data: Partial<Note>) => {
    try {
      await createNote(data).unwrap();
      toast.success("Заметка создана");
      navigate("/");
    } catch {
      toast.error("Не удалось создать");
    }
  };

  return <NoteForm onSubmit={handleSubmit} />;
}