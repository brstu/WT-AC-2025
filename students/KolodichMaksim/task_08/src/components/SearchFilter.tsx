import { useState } from 'react';

interface Props {
  onSearch: (query: string) => void;
  onCategory: (category: string) => void;
}

export default function SearchFilter({ onSearch, onCategory }: Props) {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="mb-12">
      <form onSubmit={handleSearch} className="flex gap-4 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по названию..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Найти
        </button>
      </form>

      <div className="flex gap-4">
        <button onClick={() => onCategory('')} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
          Все
        </button>
        <button onClick={() => onCategory('Frontend')} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
          Frontend
        </button>
        <button onClick={() => onCategory('Backend')} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
          Backend
        </button>
      </div>
    </div>
  );
}