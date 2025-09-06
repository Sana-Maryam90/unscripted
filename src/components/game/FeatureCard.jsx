import Card from '../ui/Card';

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  className = '' 
}) => {
  return (
    <Card variant="glass" className={`p-8 text-center ${className}`}>
      {/* Icon */}
      <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
        {typeof icon === 'string' ? (
          <div className="text-2xl">{icon}</div>
        ) : (
          <div className="w-8 h-8 text-white">
            {icon}
          </div>
        )}
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-white mb-4">
        {title}
      </h3>
      <p className="text-gray-300 leading-relaxed">
        {description}
      </p>
    </Card>
  );
};

export default FeatureCard;