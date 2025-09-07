'use client';

import Image from 'next/image';
import Button from '../ui/Button';

const MovieGrid = ({ movies, onMovieSelect }) => {
  if (!movies || movies.length === 0) return null;

  const handleMovieClick = (movie) => {
    if (onMovieSelect) {
      onMovieSelect(movie);
    } else {
      // Default behavior - redirect to quiz-game with movie pre-selected
      window.location.href = `/quiz-game?movie=${movie.id}`;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
      {movies.map((movie, index) => (
        <div 
          key={movie.id} 
          className={`group cursor-pointer ${index % 2 === 0 ? 'lg:mt-0' : 'lg:mt-16'}`}
          onClick={() => handleMovieClick(movie)}
        >
          {/* Movie Poster */}
          <div className="relative aspect-[3/4] mb-8 overflow-hidden rounded-lg">
            {movie.poster ? (
              <Image
                src={movie.poster}
                alt={movie.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8m-8 0V1" />
                </svg>
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
              <Button className="netflix-red">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Play Now
              </Button>
            </div>

            {/* Difficulty Badge */}
            <div className="absolute top-4 right-4">
              <span className="bg-black/80 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                {movie.difficulty || 'Beginner'}
              </span>
            </div>
          </div>

          {/* Movie Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 cinematic-text group-hover:text-red-400 transition-colors">
                {movie.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {movie.description}
              </p>
            </div>

            {/* Genre Tags */}
            {movie.genre && movie.genre.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.genre.map((g, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full border border-gray-700"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{movie.estimatedPlayTime || '45-60 min'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{movie.maxPlayers || 4} players</span>
                </div>
              </div>
              
              {/* Character Count */}
              <div className="flex items-center gap-1">
                <span>{movie.characters?.length || 0}</span>
                <span>characters</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MovieGrid;