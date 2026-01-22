import { useState } from 'react';
import PodcastCard from './components/PodcastCard';
import { Podcast } from './types';

const mockPodcasts: Podcast[] = [
  { id: '1', title: 'React Podcast', author: 'React Team', image: 'https://picsum.photos/200', description: '...' },
  { id: '2', title: 'JS Jabber', author: 'JS Team', image: 'https://picsum.photos/201', description: '...' },
];

function App() {
  const [selected, setSelected] = useState<Podcast | null>(null);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Библиотека подкастов</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {mockPodcasts.map((p) => (
          <PodcastCard key={p.id} podcast={p} onClick={() => setSelected(p)} />
        ))}
      </div>
      {selected && (
        <div>
          <h2>Сейчас играет: {selected.title}</h2>
          <audio controls src="https://www.soundhelix.com/examples/audio/SoundHelix-Song-1.mp3" />
        </div>
      )}
    </div>
  );
}

export default App;