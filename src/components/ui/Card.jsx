const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  hover = false,
  ...props 
}) => {
  const baseStyles = 'rounded-xl transition-all duration-200 relative';
  
  const variants = {
    default: 'bg-cream/95 border-2 border-purple shadow-lg',
    gaming: 'bg-cream/90 border-2 border-pink shadow-lg hover:shadow-xl',
    cinema: 'bg-blue/20 border-2 border-purple shadow-lg',
    retro: 'bg-pink/20 border-2 border-purple shadow-lg',
    glass: 'bg-cream/80 backdrop-blur-sm border-2 border-purple/30 shadow-lg'
  };
  
  const hoverStyles = hover ? 'hover:shadow-xl cursor-pointer hover:-translate-y-1' : '';
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
  <div className={`p-6 pb-4 ${className}`} style={{ fontFamily: 'Fredoka, sans-serif' }}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={`p-6 pt-4 ${className}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;