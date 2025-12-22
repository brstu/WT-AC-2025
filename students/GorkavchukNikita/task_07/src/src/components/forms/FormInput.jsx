import './FormInput.css'

const FormInput = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  error, 
  min,
  max,
  step,
  placeholder 
}) => {
  return (
    <div className="form-group">
      <label htmlFor={name} className="form-label">
        {label}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={error ? 'form-control error' : 'form-control'}
          placeholder={placeholder}
          rows="4"
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={error ? 'form-control error' : 'form-control'}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
        />
      )}
      
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

export default FormInput