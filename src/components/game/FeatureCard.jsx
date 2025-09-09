import Card from '../ui/Card';

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  className = '' 
}) => {
  return (
    <Card variant="gaming" className={`p-8 text-center group hover:scale-105 transition-all duration-300 ${className}`}>
      {/* Icon - Gaming Style */}
      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-400 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg border-3 border-white group-hover:rotate-12 transition-all duration-300">
        {typeof icon === 'string' ? (
          <div className="text-3xl">{icon}</div>
        ) : (
          <div className="w-10 h-10 text-white">
            {icon}
          </div>
        )}
      </div>

      {/* Content - Cartoonish Styling */}
      <h3 
        className="text-xl font-bold text-purple-900 mb-4 group-hover:text-purple-700 transition-colors"
        style={{ fontFamily: 'Fredoka, sans-serif' }}
      >
        {title}
      </h3>
      <p 
        className="text-purple-700 leading-relaxed"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        {description}
      </p>
    </Card>
  );
};

export default FeatureCard;