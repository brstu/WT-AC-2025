import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchStartup } from '../api.js';

export default function StartupDetail() {
  const { id } = useParams();
  const { data, isLoading, isError } = useQuery({ queryKey: ['startup', id], queryFn: () => fetchStartup(id) });

  if (isLoading) return <p>Загрузка...</p>;
  if (isError) return <p style={{ color: 'red' }}>Не получилось загрузить стартап.</p>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div>
        <img src={data.logo} alt={`Логотип ${data.name}`} style={{ width: '100%', borderRadius: 8 }} />
      </div>
      <div>
        <div className="meta-row">
          <span className="badge">{data.sector}</span>
          <span className="badge">id: {data.id}</span>
        </div>
        <h2>{data.name}</h2>
        <p>{data.description}</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link className="btn" to={`/startups/${id}/edit`}>Редактировать</Link>
          <Link className="btn secondary" to="/">Назад к списку</Link>
        </div>
      </div>
    </div>
  );
}
