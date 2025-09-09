import Link from 'next/link';
import Container from '../ui/Container';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-pink-100 to-purple-100 border-t-3 border-pink-300 mt-20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-4 left-10 w-8 h-8 bg-yellow-400 rounded-full animate-pulse opacity-60"></div>
      <div className="absolute top-6 right-20 w-6 h-6 bg-pink-400 rounded-full animate-pulse opacity-50" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-4 left-1/3 w-4 h-4 bg-blue-400 rounded-full animate-pulse opacity-40" style={{animationDelay: '2s'}}></div>
      
      <Container>
        <div className="py-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand - Gaming Style */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8m-8 0V1" />
                  </svg>
                </div>
                <span 
                  className="text-2xl font-bold text-purple-900"
                  style={{ fontFamily: 'Fredoka, sans-serif' }}
                >
                  Unscripted
                </span>
              </div>
              <p 
                className="text-purple-700 text-sm max-w-md leading-relaxed"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                🎬 Transform your favorite movies into epic interactive gaming experiences! 
                Create amazing alternate storylines with friends through AI-powered gameplay! ✨
              </p>
            </div>

            {/* Quick Links - Cartoonish Style */}
            <div>
              <h3 
                className="text-purple-900 font-bold mb-4 text-lg"
                style={{ fontFamily: 'Fredoka, sans-serif' }}
              >
                🔗 Quick Links
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    href="#features" 
                    className="text-purple-700 hover:text-purple-900 text-sm transition-colors duration-200 hover:underline font-medium"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    ✨ Features
                  </Link>
                </li>
                <li>
                  <Link 
                    href="#how-it-works" 
                    className="text-purple-700 hover:text-purple-900 text-sm transition-colors duration-200 hover:underline font-medium"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    🎮 How It Works
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/movies" 
                    className="text-purple-700 hover:text-purple-900 text-sm transition-colors duration-200 hover:underline font-medium"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    🎭 Available Movies
                  </Link>
                </li>
              </ul>
            </div>

            {/* Game Modes - Fun Style */}
            <div>
              <h3 
                className="text-purple-900 font-bold mb-4 text-lg"
                style={{ fontFamily: 'Fredoka, sans-serif' }}
              >
                🎯 Game Modes
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    href="/single-player" 
                    className="text-purple-700 hover:text-purple-900 text-sm transition-colors duration-200 hover:underline font-medium"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    🎯 Single Player
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/quiz-game" 
                    className="text-purple-700 hover:text-purple-900 text-sm transition-colors duration-200 hover:underline font-medium"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    🧠 Quiz Game
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/join" 
                    className="text-purple-700 hover:text-purple-900 text-sm transition-colors duration-200 hover:underline font-medium"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    🎪 Join Game
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar - Fun Style */}
          <div className="border-t-2 border-pink-300 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p 
              className="text-purple-600 text-sm font-medium"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              © 2024 Unscripted. Made with 💖 for movie lovers!
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <Link 
                href="/privacy" 
                className="text-purple-600 hover:text-purple-900 text-sm transition-colors duration-200 hover:underline font-medium"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                🔒 Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="text-purple-600 hover:text-purple-900 text-sm transition-colors duration-200 hover:underline font-medium"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                📋 Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;