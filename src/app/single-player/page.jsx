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

          {!selectedMovie ? (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-cream mb-4 font-display">
                  Choose Your Story
                </h2>
                <p className="text-cream/70">
                  Select a movie to begin your interactive storytelling journey
                </p>
              </div>
              <MovieSection onMovieSelect={handleMovieSelect} />
            </div>
          ) : (
            <Card variant="glass" className="p-8 max-w-2xl mx-auto glass-card">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-primary-400 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold text-cream mb-4 font-display">
                  Ready to Start?
                </h3>
                <p className="text-cream/80 mb-2">
                  <span className="font-semibold">Selected Movie:</span> {selectedMovie.title}
                </p>
                <p className="text-cream/60 text-sm mb-8">
                  {selectedMovie.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={handleStartGame} size="lg" className="w-full sm:w-auto modern-button">
                    Start Adventure
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedMovie(null)}
                    size="lg"
                    className="w-full sm:w-auto bg-cream text-slate-dark hover:bg-cream/90"
                  >
                    Choose Different Movie
                  </Button>
                </div>
              </div>
            </Card>
          )}

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