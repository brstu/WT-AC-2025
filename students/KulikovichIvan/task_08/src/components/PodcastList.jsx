import React from 'react';
import { formatDuration } from '../utils/formatDuration';

export function PodcastList({ podcasts = [] }) {
  if (podcasts.length === 0) {
    return <div>Нет доступных подкастов</div>;
  }

  return (
    <div className="podcast-list">
      <h2>Список подкастов</h2>
      <ul>
        {podcasts.map(podcast => (
          <li key={podcast.id} className="podcast-item">
            <h3>{podcast.title}</h3>
            <p>Автор: {podcast.author}</p>
            <p>Длительность: {formatDuration(podcast.duration)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}