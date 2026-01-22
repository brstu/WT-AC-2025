import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getItem } from "../api";

export default function Detail() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["item", id],
    queryFn: () => getItem(id)
  });

  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка</p>;

  return (
    <div>
      <h2>{data.title}</h2>
      <p>Статус: {String(data.done)}</p>
      <Link to="/">Назад</Link>
    </div>
  );
}
