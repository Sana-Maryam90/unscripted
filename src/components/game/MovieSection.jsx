'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MovieCard from './MovieCard';
import { getAllMoviesClient } from '../../lib/moviesClient';

const MovieSection = ({ movies: propMovies, onMovieSelect }) => {
  const router = useRouter();
  const [movies, setMovies] = useState(propMovies || []);
  const [loading, setLoading] = useState(!propMovies);

  useEffect(() => {
    if (!propMovies) {
      const loadMovies = async () => {
        try {
          const movieData = await getAllMoviesClient();
          setMovies(movieData);
        } catch (error) {
          console.error('Failed to load movies:', error);
        } finally {
          setLoading(false);
        }
      };
      loadMovies();
    }
  }, [propMovies]);

  const handleMovieClick = (movie) => {
    if (onMovieSelect) {
      onMovieSelect(movie);
    } else {
      // Default behavior - redirect to quiz-game with movie pre-selected
      router.push(`/quiz-game?movie=${movie.id}`);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-white/10 rounded-lg h-64"></div>
          </div>
        ))}
      </div>
    );
  }

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