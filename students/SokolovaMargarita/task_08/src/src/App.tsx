import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EntryList from './components/EntryList';
import EntryForm from './components/EntryForm';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800 font-sans">
        <div className="container mx-auto p-6 animate-fadeIn">
          <h1 className="text-4xl font-bold mb-6 text-center text-blue-600">
            Personal Diary
          </h1>
          <Routes>
            <Route path="/" element={<EntryList />} />
            <Route path="/new" element={<EntryForm />} />
            <Route path="/edit/:id" element={<EntryForm />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
