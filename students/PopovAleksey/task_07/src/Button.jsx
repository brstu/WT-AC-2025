import React from 'react'

function Button({ children, onClick, type = 'button' }) {
  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }

  return (
    <button style={buttonStyle} onClick={onClick} type={type}>
      {children}
    </button>
  )
}

export default Button
