import React from 'react';
import { Link } from 'react-router-dom';

export default function StartupCard({ item, onDelete }) {
  return (
    <div className="card">
      <img src={item.logo} alt={`Логотип ${item.name}`} />
      <div className="card-body">
        <div className="meta-row">
          <span className="badge">{item.sector}</span>
          <span style={{ color: '#666', fontSize: 12 }}>id: {item.id}</span>
        </div>
        <strong>{item.name}</strong>
        <p style={{ minHeight: 60 }}>{item.description?.slice(0, 80)}...</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link className="btn secondary" to={`/startups/${item.id}`}>Открыть</Link>
          <Link className="btn secondary" to={`/startups/${item.id}/edit`}>Править</Link>
          <button className="btn" onClick={() => onDelete(item.id)}>Удалить</button>
        </div>
      </div>
    </div>
  );
}
