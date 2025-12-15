import './Spinner.css';

export const Spinner = ({ size = 'medium' }) => {
  return (
    <div className="spinner-container">
      <div className={`spinner spinner-${size}`}></div>
    </div>
  );
};
