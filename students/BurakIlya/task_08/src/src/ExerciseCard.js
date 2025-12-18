import React from 'react';
import PropTypes from 'prop-types';

function ExerciseCard(props) {
  const s1 = {
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '15px',
    width: '280px',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s'
  };

  const s2 = {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '5px'
  };

  const s3 = {
    margin: '10px 0 5px',
    color: '#333'
  };

  const s4 = {
    fontSize: '12px',
    color: '#888',
    margin: '5px 0'
  };

  const s5 = {
    fontSize: '14px',
    color: '#555'
  };

  return (
    <div style={s1} onClick={props.onClick}>
      <img src={props.img} alt={props.n} style={s2} />
      <h3 style={s3}>{props.n}</h3>
      <p style={s4}>{props.c}</p>
      <p style={s5}>{props.d}</p>
    </div>
  );
}

ExerciseCard.propTypes = {
  n: PropTypes.string.isRequired,
  c: PropTypes.string.isRequired,
  d: PropTypes.string.isRequired,
  img: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default ExerciseCard;
