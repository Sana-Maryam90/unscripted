'use client';

import Image from 'next/image';
import Button from '../ui/Button';
import Container from '../ui/Container';

const MovieHeroSection = ({ movie, onPlay }) => {
  if (!movie) return null;

  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        {movie.poster ? (
          <Image
            src={movie.poster}
            alt={movie.title}
            fill
            className="object-cover opacity-30"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <Container className="relative z-10">
        <div className="max-w-2xl">
          {/* Movie Title */}
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            {movie.title}
          </h1>

          {/* Movie Info */}
          <div className="flex items-center gap-4 mb-6 text-sm text-gray-300">
            <span className="bg-red-600 text-white px-2 py-1 rounded font-semibold">
              {movie.difficulty || 'BEGINNER'}
            </span>
            <span>{movie.estimatedPlayTime || '45-60 min'}</span>
            <span>•</span>
            <span>{movie.maxPlayers || 4} players</span>
            <span>•</span>
            <span>{movie.genre?.join(', ')}</span>
          </div>

          {/* Description */}
          <p className="text-xl text-gray-200 mb-8 leading-relaxed max-w-xl">
            {movie.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="xl" 
              className="netflix-red text-lg px-8 py-4"
              onClick={() => onPlay?.(movie)}
            >
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Play Now
            </Button>
            <Button 
              variant="secondary" 
              size="xl"
              className="bg-gray-600/80 hover:bg-gray-500/80 text-white border-0 text-lg px-8 py-4"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              More Info
            </Button>
          </div>

          {/* Characters Preview */}
          {movie.characters && movie.characters.length > 0 && (
            <div className="mt-12">
              <h3 className="text-lg font-semibold text-white mb-4">Playable Characters</h3>
              <div className="flex gap-4">
                {movie.characters.slice(0, 4).map((character) => (
                  <div key={character.id} className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mb-2">
                      <span className="text-white font-bold text-lg">
                        {character.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{character.name}</span>
                  </div>
                ))}
                {movie.characters.length > 4 && (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mb-2">
                      <span className="text-white text-sm">+{movie.characters.length - 4}</span>
                    </div>
                    <span className="text-xs text-gray-400">More</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default MovieHeroSection;