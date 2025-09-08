const Container = ({ 
  children, 
  size = 'default',
  className = '',
  ...props 
}) => {
  const sizes = {
    sm: 'max-w-4xl',
    default: 'max-w-6xl',
    lg: 'max-w-7xl',
    xl: 'max-w-screen-2xl',
    full: 'max-w-full'
  };
  
  const sizeClass = sizes[size] || sizes.default;
  
  return (
    <div 
      className={`${sizeClass} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;