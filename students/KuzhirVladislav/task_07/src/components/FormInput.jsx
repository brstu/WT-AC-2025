function FormInput({ label, error, id, name, className = '', type = 'text', ...inputProps }) {
  const inputId = id || name;
  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label}
        </label>
      )}
      <input id={inputId} name={name} type={type} className="field-input" {...inputProps} />
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default FormInput;
