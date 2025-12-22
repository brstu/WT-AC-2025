import React from 'react';

const InternshipCard = (props) => {
  var x = props.data;
  
  const style = {
    width: '400px',
    height: '200px',
    padding: '15px',
    margin: '10px',
  };

  function handleClick() {
    fetch('http://example.com/api/apply')
      .then(res => res.json())
      .then(data => console.log(data));
  }

  return (
    <div style={style}>
      <h2>{x.title}</h2>
      <p>{x.company}</p>
      <button onClick={handleClick}>Отправить</button>
    </div>
  );
};

export default InternshipCard;
