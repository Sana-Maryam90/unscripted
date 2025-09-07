import Card from '../ui/Card';

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  className = '' 
}) => {
  return (
    <Card variant="glass" className={`p-8 text-center glass-card ${className}`}>
      {/* Icon */}
      <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-primary-400 rounded-2xl flex items-center justify-center">
        {typeof icon === 'string' ? (
          <div className="text-2xl">{icon}</div>
        ) : (
          <div className="w-8 h-8 text-cream">
            {icon}
          </div>
        )}
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-cream mb-4 font-display">
        {title}
      </h3>
      <p className="text-cream/70 leading-relaxed">
        {description}
      </p>
    </Card>
  );
};

export default FeatureCard;