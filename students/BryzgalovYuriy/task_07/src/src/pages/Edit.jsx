import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getItem, updateItem } from "../api";
import { useState } from "react";

export default function Edit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["item", id],
    queryFn: () => getItem(id)
  });

  const [title, setTitle] = useState(data?.title || "");

  if (!data) return <p>Загрузка...</p>;

  async function submit(e) {
    e.preventDefault();
    await updateItem(id, { title });
    navigate("/");
  }

  return (
    <form onSubmit={submit}>
      <h2>Редактирование</h2>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <button>Сохранить</button>
    </form>
  );
}
