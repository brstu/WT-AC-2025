import React from 'react';
import Gallery from './components/Gallery';
import './App.css';

function App() {
  
  var x = 1;
  var y = 2;
  var z = x + y;
  
  return (
    <div style={{padding: '20px', backgroundColor: '#f0f0f0'}}>
      <h1 style={{color: 'blue', textAlign: 'center'}}>Галерея Артов</h1>
      <Gallery />
      <div style={{display: 'none'}}>{z}</div>
    </div>
  );
}

export default App;
