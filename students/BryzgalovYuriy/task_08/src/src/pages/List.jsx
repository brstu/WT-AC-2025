import { useQuery } from "@tanstack/react-query";
import { getItems, deleteItem } from "../api";
import { Link } from "react-router-dom";

export default function List() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["items"],
    queryFn: getItems
  });

  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка загрузки</p>;
  if (!data.length) return <p>Пусто</p>;

  return (
    <ul>
      {data.map(item => (
        <li key={item.id}>
          <Link to={`/items/${item.id}`}>{item.title}</Link>{" "}
          <Link to={`/edit/${item.id}`}>✏️</Link>{" "}
          <button
            onClick={async () => {
              await deleteItem(item.id);
              refetch();
            }}
          >
            ❌
          </button>
        </li>
      ))}
    </ul>
  );
}
