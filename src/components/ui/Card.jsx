const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  hover = false,
  ...props 
}) => {
  const baseStyles = 'rounded-3xl transition-all duration-300 relative overflow-hidden';
  
  const variants = {
    default: 'bg-game-blue/30 border-3 border-game-blue shadow-lg backdrop-blur-sm',
    gaming: 'bg-game-blue/25 border-3 border-game-blue shadow-lg backdrop-blur-sm',
    cinema: 'bg-game-blue/30 border-3 border-game-blue shadow-lg backdrop-blur-sm',
    retro: 'bg-game-pink/30 border-3 border-game-pink shadow-lg backdrop-blur-sm',
    glass: 'bg-white/20 backdrop-blur-lg border-3 border-game-blue/70 shadow-lg'
  };
  
  const hoverStyles = hover ? 'hover:scale-105 hover:shadow-2xl cursor-pointer hover:-translate-y-1' : '';
  const variantStyles = variants[variant] || variants.default;
  
  return (
    <div 
      className={`${baseStyles} ${variantStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {/* Decorative corner elements */}
      <div className="absolute top-2 right-2 w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
      <div className="absolute bottom-2 left-2 w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      
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