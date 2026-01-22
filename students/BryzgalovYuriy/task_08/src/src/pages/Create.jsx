import { useState } from "react";
import { createItem } from "../api";
import { useNavigate } from "react-router-dom";

export default function Create() {
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    if (!title) return;
    await createItem({ title, done: false });
    navigate("/");
  }

  return (
    <form onSubmit={submit}>
      <h2>Новый стартап</h2>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Название"
      />
      <button>Создать</button>
    </form>
  );
}
