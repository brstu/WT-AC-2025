import './Input.css';

import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import './Input.css';

export const Input = forwardRef(({ 
  label, 
  error, 
  type = 'text', 
  placeholder,
  id,
  ...props 
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="input-group">
      {label && <label htmlFor={inputId} className="input-label">{label}</label>}
      <input 
        id={inputId}
        ref={ref}
        type={type} 
        className={`input ${error ? 'input-error' : ''}`}
        placeholder={placeholder}
        {...props}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
});

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  id: PropTypes.string,
};

Input.displayName = 'Input';
