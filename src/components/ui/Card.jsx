const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  hover = false,
  ...props 
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-300';
  
  const variants = {
    default: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-xl',
    glass: 'bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl',
    solid: 'bg-white shadow-lg border border-gray-200',
    gradient: 'bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md border border-white/20 shadow-xl'
  };
  
  const hoverStyles = hover ? 'hover:scale-105 hover:shadow-2xl cursor-pointer' : '';
  const variantStyles = variants[variant] || variants.default;
  
  return (
    <div 
      className={`${baseStyles} ${variantStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={`p-6 pt-4 ${className}`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;