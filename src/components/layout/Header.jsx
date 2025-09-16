import Link from 'next/link';
import Container from '../ui/Container';
import Button from '../ui/Button';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b-3 border-pink-300 shadow-lg">
      <Container>
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo - Gaming Style */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg border-2 border-white">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1-1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8m-8 0V1" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 
                className="text-2xl font-bold text-purple-900 group-hover:text-purple-700 transition-colors"
                style={{ fontFamily: 'Fredoka, sans-serif' }}
              >
                Unscripted
              </h1>
              <p 
                className="text-sm text-purple-600 -mt-1"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                🎬 Cinema Games
              </p>
            </div>
          </Link>

          {/* Navigation - Cartoonish Style */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="#features" 
              className="text-purple-700 hover:text-purple-900 transition-colors duration-200 font-semibold px-3 py-2 rounded-2xl hover:bg-pink-100"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              ✨ Features
            </Link>
            <Link 
              href="#how-it-works" 
              className="text-purple-700 hover:text-purple-900 transition-colors duration-200 font-semibold px-3 py-2 rounded-2xl hover:bg-pink-100"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              🎮 How It Works
            </Link>
            <Link 
              href="/movies" 
              className="text-purple-700 hover:text-purple-900 transition-colors duration-200 font-semibold px-3 py-2 rounded-2xl hover:bg-pink-100"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              🎭 Movies
            </Link>

          </nav>

          {/* CTA Button - Gaming Style */}
          <div className="flex items-center space-x-4">
            <Button size="sm" variant="primary" className="hidden sm:inline-flex animate-pulse-glow">
              🚀 GET STARTED
            </Button>
            <Button size="sm" variant="primary" className="sm:hidden">
              🎮 PLAY
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;