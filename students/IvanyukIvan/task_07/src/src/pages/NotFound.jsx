import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div>
      <h2>Страница не найдена</h2>
      <p>Маршрут не существует или был удалён.</p>
      <Link className="btn" to="/">На главную</Link>
    </div>
  );
}
