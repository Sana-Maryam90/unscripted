'use client';

import { useRouter } from 'next/navigation';
import MovieCard from './MovieCard';

const MovieSection = ({ movies }) => {
  const router = useRouter();

  const handleMovieClick = (movie) => {
    // For now, redirect to multiplayer page
    router.push('/multiplayer');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onClick={handleMovieClick}
        />
      ))}
    </div>
  );
};

export default MovieSection;