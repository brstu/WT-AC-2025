import { Podcast } from '../types';

interface Props {
  podcast: Podcast;
  onClick: () => void;
}

const PodcastCard: React.FC<Props> = ({ podcast, onClick }) => {
  return (
    <div data-testid="podcast-card" onClick={onClick} style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '16px', margin: '8px' }}>
      <img src={podcast.image} alt={podcast.title} width={100} />
      <h3>{podcast.title}</h3>
      <p>{podcast.author}</p>
    </div>
  );
};

export default PodcastCard;