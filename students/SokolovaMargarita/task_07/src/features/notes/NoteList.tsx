import { useGetNotesQuery, useDeleteNoteMutation, usePrefetch } from "../../app/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";

export default function NoteList() {
  const { data: notes, isLoading, isError } = useGetNotesQuery();
  const [deleteNote] = useDeleteNoteMutation();
  const prefetchNote = usePrefetch("getNote");

  useEffect(() => {
    toast.info("Заметки загружены");
  }, []);

  if (isLoading) return <div className="note-list">Загрузка...</div>;
  if (isError) return <div className="note-list">Ошибка загрузки заметок</div>;
  if (!notes?.length) return <div className="note-list">Заметок пока нет</div>;

  const handleDelete = async (id: number) => {
    try {
      await deleteNote(id).unwrap();
      toast.success("Заметка удалена");
    } catch {
      toast.error("Не удалось удалить");
    }
  };

  return (
    <div className="note-list">
      <h1 style={{ textAlign: "center", fontWeight: 700, fontSize: "2.5rem", marginBottom: 24 }}>Мои заметки</h1>
      <Link to="/new" style={{ marginBottom: 24, color: "#7b2f5b", fontWeight: 500, fontSize: "1.1rem" }}>Добавить новую заметку</Link>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        {notes.map((note) => (
          <div
            className="note-item"
            key={note.id}
            onMouseEnter={() => prefetchNote(note.id)}
            style={{ width: "100%", maxWidth: 420, marginBottom: 24 }}
          >
            <div className="note-title" style={{ textAlign: "center", width: "100%", marginBottom: 10 }}>{note.title}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, width: "100%" }}>
              <button onClick={() => handleDelete(note.id)} style={{ minWidth: 120 }}>Удалить</button>
              <Link to={`/edit/${note.id}`} style={{ textDecoration: "none" }}>
                <button style={{ minWidth: 120 }}>Редактировать</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}