'use client';

import Image from 'next/image';
import Card from '../ui/Card';

const MovieCard = ({
  movie,
  onClick,
  selected = false,
  className = ''
}) => {
  const { id, title, description, poster, characters } = movie;

  return (
    <Card
      variant="glass"
      hover
      onClick={() => onClick?.(movie)}
      className={`p-0 overflow-hidden ${selected ? 'ring-2 ring-purple-500' : ''} ${className}`}
    >
      {/* Movie Poster */}
      <div className="relative h-48 sm:h-56 bg-gradient-to-br from-purple-900/50 to-blue-900/50">
        {poster ? (
          <Image
            src={poster}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8m-8 0V1" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Movie Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {description}
        </p>

        {/* Characters Preview */}
        {characters && characters.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">Characters:</span>
            <div className="flex -space-x-2">
              {characters.slice(0, 3).map((character, index) => (
                <div
                  key={character.id}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-white/20 flex items-center justify-center"
                  title={character.name}
                >
                  <span className="text-xs text-white font-medium">
                    {character.name.charAt(0)}
                  </span>
                </div>
              ))}
              {characters.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-600 border-2 border-white/20 flex items-center justify-center">
                  <span className="text-xs text-white">+{characters.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MovieCard;