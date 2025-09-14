'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Container from '../../components/ui/Container';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import MovieSection from '../../components/game/MovieSection';
import SinglePlayerGame from '../../components/game/SinglePlayerGame';

export default function SinglePlayerPage() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
  };

  const handleStartGame = () => {
    if (selectedMovie) {
      setGameStarted(true);
    }
  };

  const handleBackToMovies = () => {
    setGameStarted(false);
    setSelectedMovie(null);
  };

  if (gameStarted && selectedMovie) {
    return <SinglePlayerGame movie={selectedMovie} onBack={handleBackToMovies} />;
  }

  return (
    <div className="min-h-screen relative">
      <Header />

      <main className="pt-32 pb-20">
        <Container>
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-6xl font-bold text-cream mb-6 font-display">
              Single Player Mode
            </h1>
            <p className="text-xl text-cream/80 max-w-3xl mx-auto">
              Embark on a solo storytelling adventure and reshape your favorite movies
            </p>
          </div>

          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-cream mb-4 font-display">
                Choose Your Story
              </h2>
              <p className="text-cream/70">
                Select a movie to begin your interactive storytelling journey
              </p>
            </div>
            <MovieSection onMovieSelect={(movie) => {
              setSelectedMovie(movie);
              setGameStarted(true);
            }} />
          </div>

          <div className="text-center mt-12">
            <Link href="/">
              <Button variant="outline" size="lg">
                Back to Home
              </Button>
            </Link>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}