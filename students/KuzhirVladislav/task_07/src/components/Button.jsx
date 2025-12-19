function Button({ children, variant = 'primary', className = '', ...props }) {
  let baseClass = 'btn';

  if (variant === 'link') {
    baseClass = 'btn btn-link';
  } else if (variant === 'danger') {
    baseClass = 'btn btn-danger';
  } else if (variant === 'success') {
    baseClass = 'btn btn-success';
  }

  const cls = `${baseClass} ${className}`.trim();
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}

export default Button;
