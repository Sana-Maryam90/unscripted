'use client';

import Image from 'next/image';

const MovieCard = ({
  movie,
  onClick,
  selected = false,
  className = ''
}) => {
  const { title, description, poster, characters, genre, difficulty, estimatedPlayTime, maxPlayers } = movie;

  return (
    <div
      onClick={() => onClick?.(movie)}
      className={`cartoon-card p-0 overflow-hidden cursor-pointer group transition-transform duration-200 hover:scale-105 ${selected ? 'ring-4 ring-pink-400' : ''} ${className}`}
    >
      {/* Movie Poster */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {poster ? (
          <Image
            src={poster}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 flex items-center justify-center">
            <svg className="w-16 h-16 text-purple-600/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8m-8 0V1" />
            </svg>
          </div>
        )}
        
        {/* Gaming overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-game-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <button 
              className="w-full py-2 text-sm font-bold bg-game-pink hover:bg-game-purple text-white rounded-xl border-2 border-white transition-colors"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              🎮 PLAY NOW
            </button>
          </div>
        </div>

        {/* Difficulty badge */}
        <div className="absolute top-3 right-3">
          <span 
            className="bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-game-dark rounded-full border-2 border-game-blue"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {difficulty || 'Beginner'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 
          className="text-xl font-bold text-purple-900 mb-2"
          style={{ fontFamily: 'Fredoka, sans-serif' }}
        >
          {title}
        </h3>
        <p 
          className="text-purple-700 text-sm mb-4 line-clamp-2"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {description}
        </p>

        {/* Genre tags */}
        {genre && genre.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {genre.slice(0, 2).map((g, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full border-2 border-blue-200"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div 
          className="flex items-center justify-between text-xs text-purple-600 font-medium"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{estimatedPlayTime || '45-60 min'}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{maxPlayers || 4} players</span>
          </div>
        </div>

        {/* Character avatars */}
        {characters && characters.length > 0 && (
          <div className="flex items-center gap-2 mt-4">
            <span 
              className="text-xs text-purple-600 font-medium"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Characters:
            </span>
            <div className="flex -space-x-2">
              {characters.slice(0, 3).map((character) => (
                <div
                  key={character.id}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 border-2 border-white flex items-center justify-center shadow-sm"
                  title={character.name}
                >
                  <span 
                    className="text-xs text-white font-bold"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {character.name.charAt(0)}
                  </span>
                </div>
              ))}
              {characters.length > 3 && (
                <div 
                  className="w-8 h-8 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center shadow-sm"
                >
                  <span 
                    className="text-xs text-white font-bold"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    +{characters.length - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;