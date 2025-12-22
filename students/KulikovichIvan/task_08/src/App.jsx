import React from 'react';
import { PodcastList } from './components/PodcastList';

const mockPodcasts = [
  { id: 1, title: 'React для начинающих', author: 'Алексей Луковец', duration: 3600 },
  { id: 2, title: 'Docker в production', author: 'Елена Козлович', duration: 2700 },
  { id: 3, title: 'CI/CD с GitHub Actions', author: 'Павел Козлов', duration: 1800 },
];

function App() {
  return (
    <div className="app">
      <header>
        <h1>База подкастов</h1>
      </header>
      <main>
        <PodcastList podcasts={mockPodcasts} />
      </main>
    </div>
  );
}

export default App;