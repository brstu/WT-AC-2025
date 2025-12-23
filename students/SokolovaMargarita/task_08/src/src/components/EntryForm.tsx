import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Entry } from './Entry';

const EntryForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [text, setText] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (id) {
      const stored = localStorage.getItem('diaryEntries');
      if (stored) {
        const entries: Entry[] = JSON.parse(stored);
        const entry = entries.find((e) => e.id === id);
        if (entry) {
          setDate(entry.date);
          setText(entry.text);
          setTags(entry.tags.join(', '));
        }
      }
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const newEntry: Entry = { id: id || uuidv4(), date, text, tags: newTags };

    const stored = localStorage.getItem('diaryEntries');
    let entries: Entry[] = stored ? JSON.parse(stored) : [];

    if (id) {
      entries = entries.map((e) => (e.id === id ? newEntry : e));
    } else {
      entries.push(newEntry);
    }

    localStorage.setItem('diaryEntries', JSON.stringify(entries));
    navigate('/');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-700 p-8 rounded-lg shadow-lg max-w-md mx-auto"
    >
      <div className="mb-4">
        <label htmlFor="date" className="block text-gray-300 mb-2">
          Date:
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-500 p-2 w-full rounded bg-gray-800 text-white"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="text" className="block text-gray-300 mb-2">
          Text:
        </label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border border-gray-500 p-2 w-full rounded bg-gray-800 text-white h-32"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="tags" className="block text-gray-300 mb-2">
          Tags (comma-separated):
        </label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="border border-gray-500 p-2 w-full rounded bg-gray-800 text-white"
        />
      </div>
      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md w-full transition duration-300"
      >
        Save
      </button>
    </form>
  );
};

export default EntryForm;
