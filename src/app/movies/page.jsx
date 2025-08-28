import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Container from '../../components/ui/Container';
import Button from '../../components/ui/Button';
import MovieSection from '../../components/game/MovieSection';
import { getAllMovies, getMoviesByGenre, getMoviesByDifficulty } from '../../lib/movies';

export default async function MoviesPage() {
  const allMovies = await getAllMovies();
  const beginnerMovies = await getMoviesByDifficulty('beginner');
  const intermediateMovies = await getMoviesByDifficulty('intermediate');
  const advancedMovies = await getMoviesByDifficulty('advanced');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <Header />

      <main className="relative pt-32 pb-20">
        {/* Hero Section */}
        <section className="py-12">
          <Container>
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
                Choose Your
                <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Adventure
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Select from our collection of interactive movie experiences. Each story offers unique characters, 
                branching narratives, and endless possibilities.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/multiplayer">
                  <Button size="lg" className="w-full sm:w-auto">
                    Create Multiplayer Room
                  </Button>
                </Link>
                <Link href="/join">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Join Existing Game
                  </Button>
                </Link>
              </div>
            </div>
          </Container>
        </section>

        {/* All Movies Section */}
        <section className="py-12">
          <Container>
            <div className="mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                All Movies ({allMovies.length})
              </h2>
              <p className="text-lg text-gray-300">
                Explore our complete collection of interactive storytelling experiences
              </p>
            </div>

            <MovieSection movies={allMovies} />
          </Container>
        </section>

        {/* Movies by Difficulty */}
        {beginnerMovies.length > 0 && (
          <section className="py-12">
            <Container>
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  <span className="inline-flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    Beginner Friendly
                  </span>
                </h2>
                <p className="text-lg text-gray-300">
                  Perfect for first-time players and younger audiences
                </p>
              </div>

              <MovieSection movies={beginnerMovies} />
            </Container>
          </section>
        )}

        {intermediateMovies.length > 0 && (
          <section className="py-12">
            <Container>
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  <span className="inline-flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    Intermediate
                  </span>
                </h2>
                <p className="text-lg text-gray-300">
                  More complex narratives with deeper character development
                </p>
              </div>

              <MovieSection movies={intermediateMovies} />
            </Container>
          </section>
        )}

        {advancedMovies.length > 0 && (
          <section className="py-12">
            <Container>
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  <span className="inline-flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    Advanced
                  </span>
                </h2>
                <p className="text-lg text-gray-300">
                  Challenging stories with mature themes and complex choices
                </p>
              </div>

              <MovieSection movies={advancedMovies} />
            </Container>
          </section>
        )}

        {/* Stats Section */}
        <section className="py-20">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                <div className="text-4xl font-bold text-white mb-2">{allMovies.length}</div>
                <div className="text-gray-300">Interactive Movies</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                <div className="text-4xl font-bold text-white mb-2">
                  {allMovies.reduce((total, movie) => total + (movie.characters?.length || 0), 0)}
                </div>
                <div className="text-gray-300">Playable Characters</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                <div className="text-4xl font-bold text-white mb-2">∞</div>
                <div className="text-gray-300">Possible Storylines</div>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
}