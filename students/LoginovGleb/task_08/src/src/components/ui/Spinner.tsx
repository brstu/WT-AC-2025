import './Spinner.css';

export type SpinnerSize = 'small' | 'medium' | 'large';

export interface SpinnerProps {
  size?: SpinnerSize;
}

export const Spinner = ({ size = 'medium' }: SpinnerProps) => {
  return (
    <div className="spinner-container">
      <div className={`spinner spinner-${size}`}></div>
    </div>
  );
};
