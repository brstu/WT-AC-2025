import React from 'react';
import PropTypes from 'prop-types';

function Modal({ item, onClose }) {
  if (!item) return null;

  var style1 = {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '1000'
  };

  var style2 = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '15px',
    maxWidth: '500px',
    width: '90%'
  };

  var style3 = {
    width: '100%',
    height: '250px',
    objectFit: 'cover',
    borderRadius: '10px'
  };

  var style4 = {
    margin: '15px 0',
    color: '#333'
  };

  var style5 = {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#4a90e2',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px'
  };

  return (
    <div style={style1} onClick={onClose}>
      <div style={style2} onClick={(e) => e.stopPropagation()}>
        <img src={item.img} alt={item.n} style={style3} />
        <h2 style={style4}>{item.n}</h2>
        <p style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>
          Категория: {item.c}
        </p>
        <p style={{ fontSize: '16px', color: '#555', marginBottom: '10px' }}>
          {item.d}
        </p>
        <p style={{ fontSize: '16px', color: '#333', fontWeight: 'bold' }}>
          Повторений: {item.r}
        </p>
        <button onClick={onClose} style={style5}>
          Закрыть
        </button>
      </div>
    </div>
  );
}

Modal.propTypes = {
  item: PropTypes.shape({
    n: PropTypes.string.isRequired,
    c: PropTypes.string.isRequired,
    d: PropTypes.string.isRequired,
    img: PropTypes.string.isRequired,
    r: PropTypes.number.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
};

export default Modal;
