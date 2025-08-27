import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4">
            🎬 Unscripted
          </h1>
          <p className="text-xl text-blue-200 mb-8">
            Rewrite your favorite movies with AI-powered storytelling
          </p>
          <p className="text-lg text-blue-300 max-w-2xl mx-auto">
            Choose characters, make decisions, and create alternate storylines in real-time
          </p>
        </div>

        {/* Game Mode Selection */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Choose Your Adventure
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Single Player */}
            <Link href="/single-player" className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-center">
                  <div className="text-6xl mb-4">👤</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Single Player</h3>
                  <p className="text-blue-200 mb-6">
                    Create your own alternate storyline at your own pace
                  </p>
                  <ul className="text-sm text-blue-300 space-y-2 mb-6">
                    <li>✓ Play at your own pace</li>
                    <li>✓ Control all characters</li>
                    <li>✓ No time limits</li>
                    <li>✓ Save and resume anytime</li>
                  </ul>
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium group-hover:bg-blue-500 transition-colors">
                    Start Solo Adventure
                  </div>
                </div>
              </div>
            </Link>

            {/* Multiplayer */}
            <Link href="/multiplayer" className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-center">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Multiplayer</h3>
                  <p className="text-blue-200 mb-6">
                    Collaborate with friends to create stories together
                  </p>
                  <ul className="text-sm text-blue-300 space-y-2 mb-6">
                    <li>✓ Up to 4 players</li>
                    <li>✓ Real-time collaboration</li>
                    <li>✓ Turn-based choices</li>
                    <li>✓ Shared storytelling</li>
                  </ul>
                  <div className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium group-hover:bg-purple-500 transition-colors">
                    Create/Join Room
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Join */}
        <div className="text-center mt-16">
          <p className="text-blue-200 mb-4">Have a room code?</p>
          <Link href="/join" className="inline-block bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-lg font-medium hover:bg-white/30 transition-colors border border-white/30">
            Join Existing Room
          </Link>
        </div>
      </div>
    </div>
  );
}