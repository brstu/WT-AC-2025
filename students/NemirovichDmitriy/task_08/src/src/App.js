import React, { useState, useEffect } from 'react';
import InternshipList from './components/InternshipList';
import './App.css';

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const internships = [
      { id: 1, title: 'Стажировка Frontend разработчик', company: 'ООО Технологии', salary: '50000', description: 'Разработка интерфейсов' },
      { id: 2, title: 'Стажировка Backend разработчик', company: 'ЗАО Софт', salary: '60000', description: 'Разработка серверной части' },
      { id: 3, title: 'Стажировка Тестировщик', company: 'ИП Иванов', salary: '40000', description: 'Тестирование ПО' },
    ];
    
    setTimeout(() => {
      setData(internships);
    }, 500);
  }, []);

  return (
    <div className="app">
      <h1>Портал стажировок</h1>
      <InternshipList items={data} />
    </div>
  );
}

export default App;
