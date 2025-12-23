import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Entry } from './Entry';

const EntryList: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('diaryEntries');
    if (stored) setEntries(JSON.parse(stored));
  }, []);

  const deleteEntry = (id: string) => {
    const updated = entries.filter((entry) => entry.id !== id);
    setEntries(updated);
    localStorage.setItem('diaryEntries', JSON.stringify(updated));
  };

  return (
    <div>
      <Link
        to="/new"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md mb-6 inline-block transition duration-300"
      >
        Add New Entry
      </Link>
      {entries.length === 0 ? (
        <p className="text-gray-400 text-center">
          No entries yet. Start writing!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-gray-700 p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
            >
              <h2 className="font-bold text-xl mb-2 text-blue-300">
                {entry.date}
              </h2>
              <p className="text-gray-300 mb-4">{entry.text}</p>
              <p className="text-gray-500">Tags: {entry.tags.join(', ')}</p>
              <div className="mt-4 flex justify-between">
                <Link
                  to={`/edit/${entry.id}`}
                  className="text-blue-400 hover:text-blue-500"
                >
                  Edit
                </Link>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="text-red-400 hover:text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EntryList;
