import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Container from '../../components/ui/Container';
import Button from '../../components/ui/Button';
import MovieHeroSection from '../../components/game/MovieHeroSection';
import MovieGrid from '../../components/game/MovieGrid';
import { getAllMovies, getMoviesByDifficulty } from '../../lib/movies';

export default async function MoviesPage() {
  const allMovies = await getAllMovies();
  const featuredMovie = allMovies[0]; // Harry Potter as featured
  const otherMovies = allMovies.slice(1);

  const handleMoviePlay = (movie) => {
    // Redirect to quiz-game with movie pre-selected
    window.location.href = `/quiz-game?movie=${movie.id}`;
  };

  return (
    <div className="min-h-screen relative">
      <Header />

      <main className="relative">
        {/* Netflix-Style Hero Section */}
        <MovieHeroSection movie={featuredMovie} onPlay={handleMoviePlay} />

        {/* Art Gallery-Style Movie Grid */}
        <section className="py-20 bg-gradient-to-b from-transparent to-gray-900/20">
          <Container>
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-bold text-white mb-6 cinematic-text">
                More Adventures
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Discover other interactive storytelling experiences waiting for you
              </p>
            </div>

            <MovieGrid movies={otherMovies} onMovieSelect={handleMoviePlay} />
          </Container>
        </section>

        {/* Call to Action */}
        <section className="py-20">
          <Container>
            <div className="text-center bg-gradient-to-r from-red-900/20 to-amber-900/20 rounded-3xl p-12 border border-red-800/30">
              <h2 className="text-3xl font-bold text-white mb-6">
                Ready to Rewrite Cinema?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of storytellers creating unique movie experiences
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/single-player">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Solo Adventure
                  </Button>
                </Link>
                <Link href="/quiz-game">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Play Quiz Game
                  </Button>
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
}