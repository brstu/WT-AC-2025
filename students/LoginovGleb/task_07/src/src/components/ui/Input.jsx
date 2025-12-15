import './Input.css';

export const Input = ({ 
  label, 
  error, 
  type = 'text', 
  placeholder, 
  ...props 
}) => {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input 
        type={type} 
        className={`input ${error ? 'input-error' : ''}`}
        placeholder={placeholder}
        {...props}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};
