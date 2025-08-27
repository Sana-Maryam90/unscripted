import Link from 'next/link';

export default function SinglePlayerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-blue-300 hover:text-white mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">
            Single Player Mode
          </h1>
          <p className="text-xl text-blue-200">
            Choose a movie to start your solo adventure
          </p>
        </div>

        {/* Movie Selection */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Movie 1 */}
            <Link href="/single-player/harry-potter-1" className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="aspect-[3/4] bg-gradient-to-b from-red-600 to-yellow-600 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-4xl mb-2">⚡</div>
                    <div className="text-sm font-medium">Movie Poster</div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Harry Potter and the Philosopher's Stone
                  </h3>
                  <p className="text-blue-200 text-sm mb-4">
                    A young wizard discovers his magical heritage and begins his journey at Hogwarts.
                  </p>
                  <div className="flex justify-between text-xs text-blue-300">
                    <span>Fantasy</span>
                    <span>4 characters</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Movie 2 */}
            <Link href="/single-player/star-wars-4" className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="aspect-[3/4] bg-gradient-to-b from-black to-blue-900 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-4xl mb-2">⭐</div>
                    <div className="text-sm font-medium">Movie Poster</div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Star Wars: A New Hope
                  </h3>
                  <p className="text-blue-200 text-sm mb-4">
                    A young farm boy joins a rebellion against an evil galactic empire.
                  </p>
                  <div className="flex justify-between text-xs text-blue-300">
                    <span>Sci-Fi</span>
                    <span>4 characters</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Movie 3 */}
            <Link href="/single-player/lotr-1" className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="aspect-[3/4] bg-gradient-to-b from-green-800 to-yellow-700 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-4xl mb-2">💍</div>
                    <div className="text-sm font-medium">Movie Poster</div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    The Lord of the Rings: Fellowship
                  </h3>
                  <p className="text-blue-200 text-sm mb-4">
                    A hobbit inherits a mysterious ring and must embark on a perilous journey.
                  </p>
                  <div className="flex justify-between text-xs text-blue-300">
                    <span>Fantasy</span>
                    <span>4 characters</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}