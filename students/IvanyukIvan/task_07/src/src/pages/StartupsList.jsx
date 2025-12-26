import React, { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchStartups, deleteStartup } from '../api.js';
import StartupCard from '../components/StartupCard.jsx';
import { Link } from 'react-router-dom';

export default function StartupsList() {
  const [q, setQ] = useState('');
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['startups'], queryFn: fetchStartups });
  const del = useMutation({
    mutationFn: deleteStartup,
    onSuccess: () => {
      alert('Удалено');
      refetch();
    },
    onError: () => alert('Ошибка удаления')
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((item) =>
      item.name.toLowerCase().includes(q.toLowerCase()) ||
      item.description.toLowerCase().includes(q.toLowerCase())
    );
  }, [q, data]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          placeholder="Поиск по названию или описанию"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Link className="btn" to="/startups/new">Добавить стартап</Link>
      </div>

      {isLoading && <p>Загрузка списка...</p>}
      {isError && <p style={{ color: 'red' }}>Не удалось получить данные. Попробуйте позже.</p>}

      {!isLoading && filtered.length === 0 && <p>Пока нет совпадений.</p>}

      <div className="grid">
        {filtered.map((item) => (
          <StartupCard key={item.id} item={item} onDelete={(id) => del.mutate(id)} />
        ))}
      </div>
    </div>
  );
}
