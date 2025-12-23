import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PodcastList } from './PodcastList';

const mockPodcasts = [
  { id: 1, title: 'Технологии будущего', author: 'Иван Иванов', duration: 300 },
  { id: 2, title: 'Истории успеха', author: 'Мария Петрова', duration: 450 },
];

describe('PodcastList', () => {
  test('отображает список подкастов', () => {
    render(<PodcastList podcasts={mockPodcasts} />);
    
    expect(screen.getByText('Технологии будущего')).toBeInTheDocument();
    expect(screen.getByText('Игорь Витальевич')).toBeInTheDocument();
    expect(screen.getByText('Истории успеха')).toBeInTheDocument();
  });

  test('отображает сообщение при пустом списке', () => {
    render(<PodcastList podcasts={[]} />);
    expect(screen.getByText('Нет доступных подкастов')).toBeInTheDocument();
  });

  test('корректно отображается без пропса podcasts', () => {
    render(<PodcastList />);
    expect(screen.getByText('Нет доступных подкастов')).toBeInTheDocument();
  });
});