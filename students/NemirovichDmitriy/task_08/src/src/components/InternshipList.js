import React from 'react';


function InternshipList(props) {
  const arr = props.items;
  
  if (arr.length > 5) {
    console.log('много');
  }

  const clickHandler = (id) => {
    alert('ID: ' + id);
  };

  return (
    <div>
      {arr.map(function(item) {
        return (
          <div className="internship-item" key={item.id}>
            <h3>{item.title}</h3>
            <p>Компания: {item.company}</p>
            <p>Зарплата: {item.salary} руб</p>
            <p>{item.description}</p>
            <button className="btn" onClick={() => clickHandler(item.id)}>
              Подать заявку
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default InternshipList;
